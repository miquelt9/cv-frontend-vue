import { watch } from 'vue';
import { jutge_api_client } from './jutge_api_client'; // Assuming .js, if it's .ts, update
import { verilog } from './verilog'; // Assuming .js, if it's .ts, update
import { showError, showMessage } from '#/simulator/src/utils';
import { usePromptStore } from '#/store/promptStore';
import type { PromptStoreType } from '#/store/promptStore'; // Import the type if needed for clarity

// Type for the store instance, can be inferred or explicitly imported if PromptStoreType is exported from promptStore.ts
type StoreInstance = ReturnType<typeof usePromptStore>;

/**
 * Initializes a watcher to keep the jutge_api_client.meta.token
 * in sync with the promptStore's Jutge authentication state.
 * This function should be called after Pinia is initialized and the store is available.
 * @param store The Pinia promptStore instance.
 */
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
            // Clears if token is nullified OR if user is no longer logged in (e.g. token expired)
            jutge_api_client.meta = {};
            console.log('[Jutge Auth Watcher] API client token cleared.');
        }
    }, { immediate: true }); // immediate: true ensures it runs once on setup
}

/**
 * Manages the Jutge login/logout process.
 */
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

        store.auth.activate = false;
        console.log('[jutgeLogin] Auth dialog closed. Result:', result);

        if (!result) {
            console.log('[jutgeLogin] Process cancelled by user.');
            return;
        }

        if (result.action === 'login') {
            const { email, password } = result.payload;
            if (!email || !password) {
                showMessage('Email and password are required.', 'error');
                return;
            }

            showMessage('Logging in to Jutge...', 'info');
            console.log('[jutgeLogin] Attempting login with email:', email);
            // Assuming jutge_api_client.auth.login returns { token?: string, expiration?: string | number, error?: string }
            const { token, expiration, error: loginError } = await jutge_api_client.auth.login({ email, password });

            if (loginError || !token) {
                console.error('[jutgeLogin] API login failed:', loginError || 'Token not received.');
                showError(`Jutge login failed: ${loginError || 'Unknown error or token not received'}`);
                store.clearJutgeAuthDetails(); // This will also clear localStorage and trigger watcher
                console.log('[jutgeLogin] API client meta should be cleared by watcher after login failure.');
                return;
            }

            console.log('[jutgeLogin] API login successful. Token:', token, 'Expiration:', expiration);
            let expirationTimestamp: number;
            if (typeof expiration === 'string') {
                expirationTimestamp = new Date(expiration).getTime();
            } else if (typeof expiration === 'number') {
                // Assume it's a timestamp. If it's in seconds (heuristic: < 1E12), convert to ms.
                expirationTimestamp = expiration > 1E12 ? expiration : expiration * 1000;
            } else {
                console.error('[jutgeLogin] Invalid expiration format from API:', expiration);
                showMessage('Invalid expiration format from API.', 'error');
                // Token was received but expiration is invalid, so don't proceed with setting auth details
                return;
            }
            console.log('[jutgeLogin] Expiration (timestamp ms):', expirationTimestamp, '(',new Date(expirationTimestamp),')');

            store.setJutgeAuthDetails(token, expirationTimestamp, email); // This saves to store, localStorage, and triggers watcher
            console.log('[jutgeLogin] Token set in store. API client meta should be updated by watcher.');
            showMessage(`Successfully logged in to Jutge as ${email}.`, 'success');

        } else if (result.action === 'logout') {
            console.log('[jutgeLogin] Logout action selected.');
            store.clearJutgeAuthDetails(); // This clears store, localStorage, and triggers watcher
            console.log('[jutgeLogin] API client meta should be cleared by watcher after logout.');
            showMessage('Successfully logged out from Jutge.', 'success');
        }

    } catch (err: any) { // Added : any for type safety, consider more specific error type
        const store = usePromptStore(); // Get store instance for cleanup
        console.error('[jutgeLogin] Unexpected error:', err);
        if(store.auth.activate) store.auth.activate = false;
        showMessage(`An unexpected error occurred: ${err.message || String(err)}`, 'error');
    }
}

/**
 * Manages sending a circuit to Jutge.
 */
export async function jutgeSendCircuit(): Promise<void> {
    const store = usePromptStore();
    console.log('[jutgeSendCircuit] Starting circuit submission process.');

    if (!store.isJutgeLoggedIn) {
        console.warn('[jutgeSendCircuit] User not logged in or token expired. Token in store:', store.jutgeToken, 'Expires:', store.jutgeTokenExpiration ? new Date(store.jutgeTokenExpiration) : 'N/A');
        showMessage('You must be logged in to Jutge to send a circuit. Please log in first.', 'warning');
        return;
    }
    
    // The watcher should keep jutge_api_client.meta up-to-date.
    // A defensive check for the API client token.
    if (!jutge_api_client.meta || !jutge_api_client.meta.token) {
         console.error('[jutgeSendCircuit] Critical: User is logged in per store, but API client meta token is missing. This might indicate an issue with the watcher or initialization order. Attempting to force meta update.');
         if (store.jutgeToken) {
            jutge_api_client.meta = { token: store.jutgeToken };
            console.log('[jutgeSendCircuit] API client meta token manually re-set.');
         } else {
            // This case should ideally not happen if isJutgeLoggedIn is true
            showMessage('Authentication inconsistency detected. Please try logging in again.', 'error');
            store.clearJutgeAuthDetails(); // This will trigger watcher to clear meta if it had anything.
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

        showMessage('Exporting circuit to Verilog...', 'info');
        const verilogCode = verilog.exportVerilog();
        
        if (!verilogCode || verilogCode.trim() === '') {
            console.error('[jutgeSendCircuit] Failed to export Verilog or code is empty.');
            showMessage('Failed to export circuit to Verilog. Ensure the circuit is valid.', 'error');
            return;
        }
        console.log('[jutgeSendCircuit] Verilog exported successfully.');

        showMessage(`Submitting solution for problem ${problemId} to Jutge...`, 'info');
        console.log('[jutgeSendCircuit] Sending to Jutge. API client meta just before API call:', JSON.stringify(jutge_api_client.meta));

        // Assuming submit returns { id?: string, error?: string }
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
                 store.clearJutgeAuthDetails(); // Clears store, localStorage, watcher updates meta
                 showMessage(`Submission failed: Authentication error. Your session might have expired. Please log in again. (${submissionResult.error})`, 'error');
            } else {
                 showMessage(`Submission error: ${submissionResult.error}`, 'error');
            }
        } else {
            showMessage(`Circuit successfully submitted for problem ${problemId}. Submission ID: ${submissionResult.id || '(no ID returned)'}`, 'success');
        }

    } catch (err: any) { // Added : any for type safety
        const store = usePromptStore(); // Get store instance for cleanup
        console.error('[jutgeSendCircuit] Error during circuit submission process:', err);
        if(store.sendCircuitPrompt.activate) {
            store.sendCircuitPrompt.activate = false;
        }
        showMessage(`An error occurred during circuit submission: ${err.message || String(err)}`, 'error');
    }
}
