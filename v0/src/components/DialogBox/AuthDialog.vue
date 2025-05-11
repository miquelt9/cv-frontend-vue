<template>
    <v-dialog v-model="authDialogState.activate" :persistent="authDialogState.isPersistent" max-width="500px">
        <v-card class="messageBoxContent">
            <v-card-title class="dialogHeader">Jutge Login</v-card-title>
            <v-card-text>
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
                ></v-text-field>
            </v-card-text>
            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="primary"
                    @click="submitCredentials"
                    :disabled="!email || !password"
                >
                    Login
                </v-btn>
                <v-btn @click="cancelDialog">Cancel</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { usePromptStore } from '#/store/promptStore'; // Ajusta la ruta a tu store

const promptStore = usePromptStore();
// Usamos computed para obtener una referencia reactiva al estado 'auth' del store
const authDialogState = computed(() => promptStore.auth);

const email = ref('');
const password = ref('');

function submitCredentials() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise({ email: email.value, password: password.value });
    }
    // No es necesario llamar a resetDialog() aquí si `jutge.js` se encarga de
    // poner `promptStore.auth.activate = false;` lo cual debería activar el watch.
    // Opcionalmente, puedes mantener el reset aquí para una limpieza inmediata.
    // resetDialog(); // Opcional
}

function cancelDialog() {
    if (promptStore.resolvePromise) {
        promptStore.resolvePromise(null); // Resuelve con null para indicar cancelación
    }
    // resetDialog(); // Opcional
}

function resetDialogFields() {
    email.value = '';
    password.value = '';
}

// Observa el estado 'activate' del diálogo. Si se desactiva externamente,
// resetea los campos del formulario.
watch(() => authDialogState.value.activate, (isActive) => {
    if (!isActive) {
        resetDialogFields();
    }
});

</script>

<style scoped>
.dialogHeader {
    font-size: 1.25rem; /* 20px */
    font-weight: 500;
    padding: 16px 24px 10px; /* Ajusta el padding si es necesario */
}
.messageBoxContent {
    /* padding: 10px; // El padding de v-card-text y v-card-actions suele ser suficiente */
}
/* Asegúrate que los estilos de Vuetify se aplican correctamente */
</style>