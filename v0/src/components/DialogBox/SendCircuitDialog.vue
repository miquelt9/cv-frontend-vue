<template>
    <v-dialog v-model="sendCircuitDialogState.activate" :persistent="sendCircuitDialogState.isPersistent" max-width="500px">
        <v-card class="messageBoxContent">
            <v-card-title class="dialogHeader pa-4">
                <span>Send Circuit to Jutge</span>
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
            <v-card-text class="pt-2">
                <p>{{ sendCircuitDialogState.messageText }}</p>
                <v-text-field
                    v-model="problemId"
                    label="Problem ID (e.g., X12345)"
                    required
                    class="mt-4"
                    variant="outlined"
                    density="compact"
                    @keyup.enter="submitProblem"
                ></v-text-field>
            </v-card-text>
            <v-card-actions class="pa-4">
                <v-btn
                    @click="submitProblem"
                    :disabled="!problemId.trim()"
                    block
                    class="mb-2 primary-action-button"
                    variant="outlined"
                >
                    Submit
                </v-btn>
                <v-btn @click="cancelDialog" block variant="outlined">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
// ... script content remains the same as previous version
import { ref, computed, watch } from 'vue';
import { usePromptStore } from '#/store/promptStore';

const promptStore = usePromptStore();
const sendCircuitDialogState = computed(() => promptStore.sendCircuitPrompt);

const problemId = ref('');

function submitProblem() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(problemId.value.trim());
    }
}

function cancelDialog() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(null);
    }
    promptStore.sendCircuitPrompt.activate = false;
}

function resetDialogFields() {
    problemId.value = '';
}

watch(() => sendCircuitDialogState.value.activate, (isActive) => {
    if (!isActive) {
        resetDialogFields();
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
    color: white !important; /* Text color */
    border-color: white !important; /* Border color */
    font-weight: bold;
}
.primary-action-button.v-btn--variant-outlined:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
}

.v-btn--variant-outlined:not(.primary-action-button) {
    font-weight: bold;
}
</style>
