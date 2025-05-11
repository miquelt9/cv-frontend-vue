<template>
    <Navbar />
    <ContextMenu />
    <Extra />
    <Helper />
    <AuthDialog />
    <SendCircuitDialog />
</template>

<script setup lang="ts">
import Navbar from '@/Navbar/Navbar.vue'
import ContextMenu from '@/ContextMenu/ContextMenu.vue'
import Extra from '@/Extra.vue'
import { onMounted } from 'vue'
import { setup as setupSimulator } from '../simulator/src/setup'
import Helper from '#/components/helpers/Helper.vue'
import AuthDialog from '#/components/DialogBox/AuthDialog.vue';
import SendCircuitDialog from '#/components/DialogBox/SendCircuitDialog.vue';
import { usePromptStore } from '#/store/promptStore';
import { initializeJutgeApiClientAuthWatcher } from '../simulator/src/jutge';

onMounted(() => {

    setupSimulator();

    try {
        const promptStore = usePromptStore();
        promptStore.initializeJutgeAuth();
        console.log('[Simulator.vue] Jutge auth state initialized from localStorage.');
        // Now, set up the watcher for the API client
        initializeJutgeApiClientAuthWatcher(promptStore);
        console.log('[Simulator.vue] Jutge API client auth watcher initialized.');
    } catch (e) {
        console.error("Error during Jutge auth initialization in simulator.vue onMounted:", e);
    }

})
</script>