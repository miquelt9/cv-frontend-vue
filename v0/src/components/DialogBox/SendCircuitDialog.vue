<template>
    <v-dialog v-model="sendCircuitDialogState.activate" :persistent="sendCircuitDialogState.isPersistent"
        max-width="500px">
        <v-card class="messageBoxContent">
            <v-card-title class="dialogHeader">Send Circuit to Jutge</v-card-title>
            <v-card-text>
                <p>{{ sendCircuitDialogState.messageText }}</p>
                <v-text-field v-model="problemId" label="Problem ID (e.g., X12345)" required class="mt-4"
                    variant="outlined" density="compact" @keyup.enter="submitProblem"></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="primary" @click="submitProblem" :disabled="!problemId.trim()">
                    Submit
                </v-btn>
                <v-btn @click="cancelDialog">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePromptStore } from '#/store/promptStore'; // Adjust the path if necessary

const promptStore = usePromptStore();
const sendCircuitDialogState = computed(() => promptStore.sendCircuitPrompt);

const problemId = ref('');

function submitProblem() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(problemId.value.trim());
    }
    // No need to reset here if `jutgeSendCircuit` handles `activate = false`
}

function cancelDialog() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(null); // Indicates cancellation
    }
}

function resetDialogFields() {
    problemId.value = '';
}

watch(() => sendCircuitDialogState.value.activate, (isActive) => {
    if (!isActive) {
        resetDialogFields(); // Reset field when the dialog closes
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