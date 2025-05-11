import { watch } from 'vue';
import { jutge_api_client } from './jutge_api_client';
import { verilog } from './verilog';
import { showMessage, showError } from '#/simulator/src/utils';
import { usePromptStore } from '#/store/promptStore';
import type { PromptStoreType } from '#/store/promptStore';

type StoreInstance = ReturnType<typeof usePromptStore>;

export function initializeJutgeApiClientAuthWatcher(store: StoreInstance): void {
    if (!store) {
        console.error('[jutge.ts] Store instance not provided to initializeJutgeApiClientAuthWatcher. Watcher not set up.');
        return;
    }

    console.log('[jutge.ts] Setting up Jutge API client auth watcher.');
    watch(() => store.jutgeToken, (newToken) => {
        if (newToken && store.isJutgeLoggedIn) {
            jutge_api_client.meta = { token: newToken };
            console.log('[Jutge Auth Watcher] API client token updated from store:', newToken);
        } else if ((!newToken || !store.isJutgeLoggedIn) && Object.keys(jutge_api_client.meta).length > 0) {
            jutge_api_client.meta = {};
            console.log('[Jutge Auth Watcher] API client token cleared.');
        }
    }, { immediate: true });
}

export async function jutgeLogin(): Promise<void> {
    const store = usePromptStore();
    console.log('[jutgeLogin] Starting login/logout process.');

    if (store.isJutgeLoggedIn) {
        store.auth.view = 'loggedInStatus';
        store.auth.messageText = `Currently logged in as: ${store.getJutgeUserIdentifier}`;
        console.log('[jutgeLogin] User already logged in. Showing status.');
    } else {
        store.auth.view = 'loginForm';
        store.auth.messageText = 'Please enter your Jutge credentials:';
        console.log('[jutgeLogin] User not logged in. Showing login form.');
    }

    store.auth.activate = true;

    try {
        const result: { action: 'login', payload: { email: string, password: string } } | { action: 'logout' } | null = await new Promise((resolve) => {
            store.resolvePromise = resolve;
        });

        console.log('[jutgeLogin] Auth dialog promise resolved. Result:', result);

        if (!result) { // User cancelled or closed dialog
            console.log('[jutgeLogin] Process cancelled by user.');
            store.auth.activate = false;
            return;
        }

        if (result.action === 'login') {
            const { email, password } = result.payload;
            if (!email || !password) {
                showError('Email and password are required.');
                store.auth.activate = false; // Close dialog on validation failure
                return;
            }

            showMessage('Logging in to Jutge...');
            console.log('[jutgeLogin] Attempting login with email:', email);
            const { token, expiration, error: loginError } = await jutge_api_client.auth.login({ email, password });

            if (loginError || !token) {
                console.error('[jutgeLogin] API login failed:', loginError || 'Token not received.');
                showError(`Jutge login failed: ${loginError || 'Unknown error or token not received'}`);
                store.clearJutgeAuthDetails();
                console.log('[jutgeLogin] API client meta should be cleared by watcher after login failure.');
                store.auth.activate = false; // Close dialog on failed login
                return;
            }

            console.log('[jutgeLogin] API login successful. Token:', token, 'Expiration:', expiration);
            let expirationTimestamp: number;
            if (typeof expiration === 'string') {
                expirationTimestamp = new Date(expiration).getTime();
            } else if (typeof expiration === 'number') {
                expirationTimestamp = expiration > 1E12 ? expiration : expiration * 1000;
            } else {
                console.error('[jutgeLogin] Invalid expiration format from API:', expiration);
                showError('Invalid expiration format from API.');
                store.auth.activate = false; // Close on error
                return;
            }
            console.log('[jutgeLogin] Expiration (timestamp ms):', expirationTimestamp, '(',new Date(expirationTimestamp),')');

            store.setJutgeAuthDetails(token, expirationTimestamp, email);
            console.log('[jutgeLogin] Token set in store. API client meta should be updated by watcher.');
            showMessage(`Successfully logged in to Jutge as ${email}.`);
            store.auth.activate = false; // Close dialog on successful login

        } else if (result.action === 'logout') {
            console.log('[jutgeLogin] Logout action selected.');
            store.clearJutgeAuthDetails();
            console.log('[jutgeLogin] API client meta should be cleared by watcher after logout.');
            showMessage('Successfully logged out from Jutge.');
            store.auth.activate = false; // Close dialog on successful logout
        }

        // The dialog activation is now handled directly within each action block or cancellation.

    } catch (err: any) {
        console.error('[jutgeLogin] Unexpected error:', err);
        showError(`An unexpected error occurred: ${err.message || String(err)}`);
        if(store.auth.activate) store.auth.activate = false;
    }
}

// ... jutgeSendCircuit function remains the same
export async function jutgeSendCircuit(): Promise<void> {
    const store = usePromptStore();
    console.log('[jutgeSendCircuit] Starting circuit submission process.');

    if (!store.isJutgeLoggedIn) {
        console.warn('[jutgeSendCircuit] User not logged in or token expired.');
        showMessage('You must be logged in to Jutge to send a circuit. Please log in first.');
        return;
    }
    
    if (!jutge_api_client.meta || !jutge_api_client.meta.token) {
         console.error('[jutgeSendCircuit] Critical: User is logged in per store, but API client meta token is missing.');
         if (store.jutgeToken) {
            jutge_api_client.meta = { token: store.jutgeToken };
            console.log('[jutgeSendCircuit] API client meta token manually re-set.');
         } else {
            showError('Authentication inconsistency detected. Please try logging in again.');
            store.clearJutgeAuthDetails();
            return;
         }
    }
    console.log('[jutgeSendCircuit] User is logged in. Current API client meta:', JSON.stringify(jutge_api_client.meta));

    store.sendCircuitPrompt.activate = true;
    console.log('[jutgeSendCircuit] SendCircuitDialog activated.');

    try {
        const problemId: string | null = await new Promise((resolve) => {
            store.resolvePromise = resolve;
        });

        store.sendCircuitPrompt.activate = false; 
        console.log('[jutgeSendCircuit] SendCircuitDialog closed.');

        if (!problemId) {
            console.log('[jutgeSendCircuit] Submission cancelled by user (no problemId provided).');
            return;
        }
        console.log('[jutgeSendCircuit] Problem ID received:', problemId);

        showMessage('Exporting circuit to Verilog...');
        const verilogCode = verilog.exportVerilog();
        
        if (!verilogCode || verilogCode.trim() === '') {
            console.error('[jutgeSendCircuit] Failed to export Verilog or code is empty.');
            showError('Failed to export circuit to Verilog. Ensure the circuit is valid.');
            return;
        }
        console.log('[jutgeSendCircuit] Verilog exported successfully.');

        showMessage(`Submitting solution for problem ${problemId} to Jutge...`);
        console.log('[jutgeSendCircuit] Sending to Jutge. API client meta just before API call:', JSON.stringify(jutge_api_client.meta));

        const submissionResult = await jutge_api_client.student.submissions.submit({
            problem_id: problemId,
            compiler_id: 'Circuits',
            code: verilogCode,
            annotation: '',
        });
        console.log('[jutgeSendCircuit] Submission API response:', submissionResult);

        if (submissionResult.error) {
            console.error('[jutgeSendCircuit] API submission error:', submissionResult.error);
            if (String(submissionResult.error).toLowerCase().includes('unauthorized') || String(submissionResult.error).toLowerCase().includes('token')) {
                 console.warn('[jutgeSendCircuit] Submission failed, possibly due to an authentication/token issue. Forcing local token cleanup.');
                 store.clearJutgeAuthDetails();
                 showError(`Submission failed: Authentication error. Your session might have expired. Please log in again. (${submissionResult.error})`);
            } else {
                 showError(`Submission error: ${submissionResult.error}`);
            }
        } else {
            showMessage(`Circuit successfully submitted for problem ${problemId}. Submission ID: ${submissionResult.id || '(no ID returned)'}`);
        }

    } catch (err: any) {
        console.error('[jutgeSendCircuit] Error during circuit submission process:', err);
        showError(`An error occurred during circuit submission: ${err.message || String(err)}`);
        if(store.sendCircuitPrompt.activate) {
            store.sendCircuitPrompt.activate = false;
        }
    }
}