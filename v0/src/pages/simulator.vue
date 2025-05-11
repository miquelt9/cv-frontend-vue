<template>
    <Navbar />
    <ContextMenu />
    <Extra />
    <Helper />
    <AuthDialog />
</template>

<script setup lang="ts">
import Navbar from '@/Navbar/Navbar.vue'
import ContextMenu from '@/ContextMenu/ContextMenu.vue'
import Extra from '@/Extra.vue'
import { onMounted } from 'vue'
import { setup as setupSimulator } from '../simulator/src/setup'
import Helper from '#/components/helpers/Helper.vue'
import AuthDialog from '#/components/DialogBox/AuthDialog.vue';

onMounted(() => {
    setupSimulator()
})
</script>