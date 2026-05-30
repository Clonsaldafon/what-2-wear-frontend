<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'

const props = defineProps<{
  onClose: () => void
}>()

let previousBodyOverflow = ''

onMounted(() => {
  previousBodyOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'
})

onBeforeUnmount(() => {
  document.body.style.overflow = previousBodyOverflow
})
</script>

<template>
  <div class="overlay">
    <div class="overlay__background" @click="onClose"></div>
    <div class="overlay__modal">
      <slot name="modal"></slot>
    </div>
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

  &__modal {
    display: flex;
    justify-content: center;
    width: 100%;
    max-height: calc(100vh - #{rem(80)});
    z-index: 1001;
  }

  @include mobile {
    padding: rem(18);

    &__modal {
      max-height: calc(100vh - #{rem(36)});
    }
  }
}

@keyframes blurIn {
  from { backdrop-filter: blur(0px); }
  to { backdrop-filter: blur(5px); }
}
</style>
