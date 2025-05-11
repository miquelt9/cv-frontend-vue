<template>
    <v-dialog v-model="authDialogState.activate" :persistent="authDialogState.isPersistent" max-width="500px">
        <v-card class="messageBoxContent">
            <template v-if="isLoggedIn && authDialogState.view === 'loggedInStatus'">
                <v-card-title class="dialogHeader">Jutge Session</v-card-title>
                <v-card-text>
                    <p>Currently logged in as: {{ userIdentifier }}</p>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="warning" @click="handleLogout">Logout</v-btn>
                    <v-btn @click="cancelDialog">Close</v-btn>
                </v-card-actions>
            </template>

            <template v-else>
                <v-card-title class="dialogHeader">Jutge Login</v-card-title>
                <v-card-text>
                    <p>{{ authDialogState.messageText }}</p>
                    <v-text-field v-model="email" label="Email" type="email" required class="mt-4" variant="outlined"
                        density="compact"></v-text-field>
                    <v-text-field v-model="password" label="Password" type="password" required class="mt-2"
                        variant="outlined" density="compact" @keyup.enter="submitCredentials"></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click="submitCredentials" :disabled="!email || !password">
                        Login
                    </v-btn>
                    <v-btn @click="cancelDialog">Cancel</v-btn>
                </v-card-actions>
            </template>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePromptStore } from '#/store/promptStore'; // Adjust the path if necessary

const promptStore = usePromptStore();
const authDialogState = computed(() => promptStore.auth);

// Use getters for login state and user identifier
const isLoggedIn = computed(() => promptStore.isJutgeLoggedIn);
const userIdentifier = computed(() => promptStore.getJutgeUserIdentifier); // This accesses the getter's value

const email = ref('');
const password = ref('');

function submitCredentials() {
    if (promptStore.resolvePromise) {
        // Returns an object identifying the action as 'login' and the credentials
        promptStore.resolvePromise({ action: 'login', payload: { email: email.value, password: password.value } });
    }
    // No need to reset here if `jutgeLogin` handles `activate = false`
}

function handleLogout() {
    if (promptStore.resolvePromise) {
        // Returns an object identifying the action as 'logout'
        promptStore.resolvePromise({ action: 'logout' });
    }
}

function cancelDialog() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(null); // Indicates cancellation
    }
}

function resetDialogFields() {
    email.value = '';
    password.value = '';
}

watch(() => authDialogState.value.activate, (isActive) => {
    if (isActive) {
        // If the dialog activates and the user is already logged in,
        // ensure the view is correct.
        // `jutgeLogin` in `jutge.js` should set `auth.view` appropriately.
        if (isLoggedIn.value) {
            promptStore.auth.view = 'loggedInStatus';
        } else {
            promptStore.auth.view = 'loginForm';
        }
    } else {
        resetDialogFields(); // Reset fields when the dialog closes
    }
});

// If the login state changes while the dialog is open (e.g., token expires),
// this could force a view change, although `jutgeLogin` should primarily handle this upon opening.
watch(isLoggedIn, (loggedIn) => {
    if (authDialogState.value.activate) {
        promptStore.auth.view = loggedIn ? 'loggedInStatus' : 'loginForm';
    }
});

</script>

<style scoped>
.dialogHeader {
    font-size: 1.25rem;
    font-weight: 500;
    padding: 16px 24px 10px;
}
</style>