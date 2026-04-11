<script setup lang="ts">
const props = defineProps<{
  onClose: () => void
}>()
</script>

<template>
  <div class="overlay">
    <div class="overlay__background" @click="onClose"></div>
    <slot name="modal"></slot>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/helpers/' as *;

.overlay {
  @include flex-center;

  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: rem(40);
  z-index: 1000;

  &__background {
    position: absolute;
    width: 100%;
    height: 100%;
    animation: blurIn var(--transition-duration) forwards;
  }
}

@keyframes blurIn {
  from { backdrop-filter: blur(0px); }
  to { backdrop-filter: blur(5px); }
}
</style>