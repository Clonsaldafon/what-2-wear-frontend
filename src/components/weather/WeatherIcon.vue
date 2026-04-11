<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  iconCode: string
  description: string
}>()

const iconSrc = computed(() => {
  if (!props.iconCode) return ''

  return `/icons/weather/${props.iconCode}.svg`
})

const onError = (e: Event) => {
  console.warn(`Icon ${props.iconCode} not found`)
}
</script>

<template>
  <img
    :src="iconSrc"
    :alt="description"
    @error="onError"
  />
</template>

<style scoped lang="scss"></style>