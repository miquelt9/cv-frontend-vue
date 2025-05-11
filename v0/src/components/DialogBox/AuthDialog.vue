<template>
    <v-dialog v-model="authDialogState.activate" :persistent="authDialogState.isPersistent" max-width="500px">
        <v-card class="messageBoxContent">
            <v-card-title class="dialogHeader pa-4">
                <span v-if="isLoggedIn && authDialogState.view === 'loggedInStatus'">Jutge Session</span>
                <span v-else>Jutge Login</span>
                <v-spacer></v-spacer>
                <v-btn
                    size="x-small"
                    icon
                    class="dialogClose"
                    variant="text"
                    @click="cancelDialog"
                >
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-card-title>

            <template v-if="isLoggedIn && authDialogState.view === 'loggedInStatus'">
                <v-card-text class="pt-2">
                    <p>Currently logged in as: {{ userIdentifier }}</p>
                </v-card-text>
                <v-card-actions class="pa-4">
                    <v-btn
                        @click="handleLogout"
                        block
                        class="mb-2 logout-button"
                        variant="outlined"
                    >
                        Logout
                    </v-btn>
                    <v-btn @click="cancelDialog" block variant="outlined">Close</v-btn>
                </v-card-actions>
            </template>

            <template v-else>
                <v-card-text class="pt-2">
                    <p>{{ authDialogState.messageText }}</p>
                    <v-text-field
                        v-model="email"
                        label="Email"
                        type="email"
                        required
                        class="mt-4"
                        variant="outlined"
                        density="compact"
                    ></v-text-field>
                    <v-text-field
                        v-model="password"
                        label="Password"
                        type="password"
                        required
                        class="mt-2"
                        variant="outlined"
                        density="compact"
                        @keyup.enter="submitCredentials"
                    ></v-text-field>
                </v-card-text>
                <v-card-actions class="pa-4">
                    <v-btn
                        @click="submitCredentials"
                        :disabled="!email || !password"
                        block
                        class="mb-2 primary-action-button"
                        variant="outlined"
                    >
                        Login
                    </v-btn>
                    <v-btn @click="cancelDialog" block variant="outlined">Cancel</v-btn>
                </v-card-actions>
            </template>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePromptStore } from '#/store/promptStore';

const promptStore = usePromptStore();
const authDialogState = computed(() => promptStore.auth);

const isLoggedIn = computed(() => promptStore.isJutgeLoggedIn);
const userIdentifier = computed(() => promptStore.getJutgeUserIdentifier);

const email = ref('');
const password = ref('');

function submitCredentials() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise({ action: 'login', payload: { email: email.value, password: password.value } });
    }
}

function handleLogout() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise({ action: 'logout' });
    }
}

function cancelDialog() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(null);
    }
    promptStore.auth.activate = false; // Remove (no need)
}

function resetDialogFields() {
    email.value = '';
    password.value = '';
}

watch(() => authDialogState.value.activate, (isActive) => {
    if (isActive) {
        // Set initial view based on login state when dialog opens
        if (isLoggedIn.value) {
             promptStore.auth.view = 'loggedInStatus';
             promptStore.auth.messageText = `Currently logged in as: ${promptStore.getJutgeUserIdentifier}`;
        } else {
             promptStore.auth.view = 'loginForm';
             promptStore.auth.messageText = 'Please enter your Jutge credentials:';
        }
    } else {
        resetDialogFields(); // Reset fields when the dialog closes
    }
});

</script>

<style scoped>
.dialogHeader {
    font-size: 1.25rem;
    font-weight: 500;
    display: flex;
    align-items: center;
}

.primary-action-button.v-btn--variant-outlined {
    color: white !important;
    border-color: white !important;
    font-weight: bold;
}
.primary-action-button.v-btn--variant-outlined:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.logout-button.v-btn--variant-outlined {
    color: red !important;
    border-color: white !important;
    font-weight: bold;
}
.logout-button.v-btn--variant-outlined:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-btn--variant-outlined:not(.primary-action-button):not(.logout-button) {
    font-weight: bold;
}
</style>