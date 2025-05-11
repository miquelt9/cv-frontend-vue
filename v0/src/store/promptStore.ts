import { HTMLContent } from '@tiptap/core'
import { defineStore } from 'pinia'

const JUTGE_AUTH_STORAGE_KEY = 'jutgeAuthDetails';

interface JutgeAuthData {
    token: string;
    expirationTimestamp: number;
    identifier: string;
}

interface PromptStoreType {
    resolvePromise: (value?: any) => void
    prompt: {
        activate: boolean
        messageText: string
        isPersistent: boolean
        buttonList: Array<{ text: string; emitOption: string }>
        inputList: Array<{
            text: string
            val: string
            placeholder: string
            id: string
            class: string
            style: string
            type: string
        }>
    }
    confirm: {
        activate: boolean
        messageText: string
        isPersistent: boolean
        buttonList: Array<{ text: string; emitOption: string | boolean }>
    }
    auth: {
        activate: boolean
        messageText: string
        isPersistent: boolean
        view: 'loginForm' | 'loggedInStatus' // To control the AuthDialog view
    }
    DeleteCircuit: {
        activate: boolean
        messageText: string
        isPersistent: boolean
        buttonList: Array<{ text: string; emitOption: string }>
        circuitItem: object
    }
    UpdateProjectDetail: {
        activate: boolean
        projectId: number
        projectName: string
        projectTags: string
        projectType: Readonly<any> | string
        projectDescription: HTMLContent
    }
    sendCircuitPrompt: {
        activate: boolean
        messageText: string
        isPersistent: boolean
    }
    // Jutge authentication details
    jutgeToken: string | null
    jutgeTokenExpiration: number | null // Store as timestamp (Date.getTime())
    jutgeUserIdentifier: string | null // e.g., email
}

export const usePromptStore = defineStore({
    id: 'promptStore',
    state: (): PromptStoreType => ({
        resolvePromise: () => {},
        prompt: {
            activate: false,
            messageText: '',
            isPersistent: false,
            buttonList: [],
            inputList: [],
        },
        confirm: {
            activate: false,
            messageText: '',
            isPersistent: false,
            buttonList: [],
        },
        auth: {
            activate: false,
            messageText: 'Please enter your Jutge credentials:',
            isPersistent: true,
            view: 'loginForm', // Default to login form view
        },
        DeleteCircuit: {
            activate: false,
            messageText: '',
            isPersistent: false,
            buttonList: [],
            circuitItem: {},
        },
        UpdateProjectDetail: {
            activate: false,
            projectId: 0,
            projectName: '',
            projectTags: '',
            projectType: 'Public',
            projectDescription: '',
        },
        sendCircuitPrompt: {
            activate: false,
            messageText: 'Enter the Problem ID to submit your circuit:',
            isPersistent: true,
        },
        // Default values for Jutge authentication
        jutgeToken: null,
        jutgeTokenExpiration: null,
        jutgeUserIdentifier: null,
    }),
    actions: {
        setProjectName(projectName: string): void {
            this.UpdateProjectDetail.projectName = projectName
        },
        setProjectId(projectId: number): void {
            this.UpdateProjectDetail.projectId = projectId
        },
        // Actions for Jutge authentication
        setJutgeAuthDetails(token: string, expirationTimestamp: number, identifier: string) {
            this.jutgeToken = token;
            this.jutgeTokenExpiration = expirationTimestamp;
            this.jutgeUserIdentifier = identifier;

            try {
                const authData: JutgeAuthData = { token, expirationTimestamp, identifier };
                localStorage.setItem(JUTGE_AUTH_STORAGE_KEY, JSON.stringify(authData));
                console.log('[PromptStore] Jutge auth details saved to localStorage.');
            } catch (error) {
                console.error('[PromptStore] Error saving Jutge auth details to localStorage:', error);
            }
        },
        clearJutgeAuthDetails() {
            this.jutgeToken = null;
            this.jutgeTokenExpiration = null;
            this.jutgeUserIdentifier = null;

            try {
                localStorage.removeItem(JUTGE_AUTH_STORAGE_KEY);
                console.log('[PromptStore] Jutge auth details removed from localStorage.');
            } catch (error) {
                console.error('[PromptStore] Error removing Jutge auth details from localStorage:', error);
            }
        },
        initializeJutgeAuth() {
            console.log('[PromptStore] Initializing Jutge auth from localStorage.');
            try {
                const storedAuthString = localStorage.getItem(JUTGE_AUTH_STORAGE_KEY);
                if (storedAuthString) {
                    const storedAuth: JutgeAuthData = JSON.parse(storedAuthString);
                    if (storedAuth.token && storedAuth.expirationTimestamp && storedAuth.identifier &&
                        storedAuth.expirationTimestamp > new Date().getTime()) {
                        // Token is valid and not expired
                        this.setJutgeAuthDetails(storedAuth.token, storedAuth.expirationTimestamp, storedAuth.identifier);
                        console.log('[PromptStore] Jutge auth details successfully restored from localStorage.');
                    } else {
                        // Token expired or data invalid
                        console.log('[PromptStore] Jutge auth details in localStorage are invalid or expired. Clearing.');
                        this.clearJutgeAuthDetails(); // This will also remove it from localStorage
                    }
                } else {
                    console.log('[PromptStore] No Jutge auth details found in localStorage.');
                }
            } catch (error) {
                console.error('[PromptStore] Error initializing Jutge auth from localStorage:', error);
                this.clearJutgeAuthDetails(); // Clear state and storage on error
            }
        },
    },
    getters: {
        getProjectName(): string {
            return this.UpdateProjectDetail.projectName
        },
        isJutgeLoggedIn(): boolean {
            return !!this.jutgeToken && !!this.jutgeTokenExpiration && (this.jutgeTokenExpiration > new Date().getTime());
        },
        getJutgeUserIdentifier(): string | null {
            return this.jutgeUserIdentifier;
        },
    },
})
