<script setup lang="ts">
import MainPage from '~/pages/MainPage.vue';
import KeyCaptureProvider from '~/providers/KeyCaptureProvider.vue';
import RobotProvider from './providers/RobotProvider.vue';
</script>

<template>
  <KeyCaptureProvider>
    <RobotProvider>
      <MainPage></MainPage>
    </RobotProvider>
  </KeyCaptureProvider>
</template>

<style lang="scss" scoped>
.capture-view {
  border: 1px solid white;
  text-align: center;
}
</style>
