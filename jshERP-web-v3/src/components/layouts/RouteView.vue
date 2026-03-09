<script setup lang="ts">
/**
 * RouteView - Route view container with keep-alive support
 * Wraps router-view with keep-alive, using cached component names from tab store
 */
import { useTabStore } from '@/stores/tab'

const tabStore = useTabStore()
</script>

<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="tabStore.cachedComponents">
      <component :is="Component" />
    </keep-alive>
  </router-view>
</template>
