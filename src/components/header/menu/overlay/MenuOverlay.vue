<script setup lang="ts">
import CrossButton from '@/components/buttons/CrossButton.vue'
import Button from '@/components/buttons/Button.vue'
import MenuOverlayItem from './MenuOverlayItem.vue';

import { ROUTES } from '@/utils/constants'

const props = defineProps<{
  isAuthenticated: boolean
  messenger: string | null
  onClose: () => void
  onLogout: () => void
}>()

const emit = defineEmits(['clothesMessageOpen'])

const onClothesMessageOpen = () => {
  emit('clothesMessageOpen')
  props.onClose()
}
</script>

<template>
  <div class="menu-overlay">
    <div
      class="menu-overlay__close-button-wrapper"
      method="dialog"
    >
      <CrossButton @click="onClose" />
    </div>
    <div class="menu-overlay__body">
      <ul class="menu-overlay__list">
        <li class="menu-overlay__item">
          <MenuOverlayItem
            :route="ROUTES.WEATHER"
            :text="'Погода'"
            :selected="true"
          >
            <template #icon>
              <svg
                width="32" height="32" viewBox="0 0 32 32"
                fill="none"
              >
                <path
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                  d="M15 5V2H17V5H15ZM22.8619 21.8239C23.573 22.6875 24 23.7938 24 24.9999C24 27.7613 21.7614 29.9999 19 29.9999L18.9634 29.9998H11.5388V29.9997L11.5 29.9998C7.35787 29.9998 4 26.6419 4 22.4998C4 20.0402 5.18397 17.8571 7.01308 16.4894C7.0044 16.3274 7 16.1642 7 16C7 11.0294 11.0294 7 16 7C20.9706 7 25 11.0294 25 16C25 18.221 24.1955 20.2542 22.8619 21.8239ZM21.3082 20.5634C20.6177 20.2034 19.8326 19.9999 19 19.9999C18.1545 19.9999 17.358 20.2097 16.6598 20.5802C16.8825 21.1779 17.0042 21.8247 17.0042 22.5C17.0042 22.5891 17.0021 22.6776 16.9979 22.7657C17.5289 22.2895 18.2306 21.9999 19 21.9999C20.6569 21.9999 22 23.343 22 24.9999C22 26.6567 20.6569 27.9999 19 27.9999V27.9998H18.9716L18.9332 27.9992H11.5833C11.5556 27.9996 11.5278 27.9998 11.5 27.9998C8.46244 27.9998 6 25.5373 6 22.4998C6 19.4622 8.46244 16.9998 11.5 16.9998C13.8631 16.9998 15.878 18.49 16.6564 20.5819C17.2385 20.2725 17.889 20.0748 18.5794 20.0173C17.5548 17.0951 14.7721 14.9998 11.5 14.9998C10.6323 14.9998 9.79904 15.1471 9.02384 15.4181C9.31956 11.8244 12.3299 9 16 9C19.866 9 23 12.134 23 16C23 17.7434 22.3626 19.338 21.3082 20.5634ZM30 15H27V17H30V15ZM25.0263 9.63397L27.6243 8.13397L28.6243 9.86603L26.0263 11.366L25.0263 9.63397ZM22.134 3.37573L20.634 5.97381L22.3661 6.97381L23.8661 4.37573L22.134 3.37573ZM9.63397 6.97381L8.13397 4.37573L9.86603 3.37573L11.366 5.97381L9.63397 6.97381ZM3.37567 9.86603L5.97375 11.366L6.97375 9.63397L4.37567 8.13397L3.37567 9.86603ZM2 15H5V17H2V15ZM25.0263 22.366L27.6244 23.866L28.6244 22.134L26.0263 20.634L25.0263 22.366Z"
                  fill="currentColor"
                />
              </svg>
            </template>
          </MenuOverlayItem>
        </li>
        <li class="menu-overlay__item">
          <MenuOverlayItem
            :route="ROUTES.CLOTHES"
            :text="'Одежда'"
            :selected="false"
            @clothes="onClothesMessageOpen"
          >
            <template #icon>
              <svg
                width="24" height="24" viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 4.5c-.652 0-1.208.416-1.415 1A.75.75 0 1 1 9.171 5a3 3 0 1 1 4.588 3.43c-.301.219-.568.438-.757.667c-.186.226-.252.407-.252.563a.66.66 0 0 0 .346.58l7.607 4.112A2.473 2.473 0 0 1 19.527 19H4.473a2.473 2.473 0 0 1-1.176-4.648l6.1-3.298a.75.75 0 1 1 .713 1.32l-6.1 3.297a.973.973 0 0 0 .463 1.829h15.054a.973.973 0 0 0 .463-1.829l-7.607-4.112a2.16 2.16 0 0 1-1.133-1.9c0-.623.278-1.131.594-1.515c.314-.38.707-.69 1.035-.928A1.5 1.5 0 0 0 12 4.5"
                />
              </svg>
            </template>
          </MenuOverlayItem>
        </li>
        <li class="menu-overlay__item visually-hidden">
          <MenuOverlayItem
            v-if="isAuthenticated"
            :route="`/`"
            :text="'Профиль'"
            :selected="false"
          >
            <template #icon>
              <svg
                width="24" height="24" viewBox="0 0 24 24"
              >
                <g
                  fill="none" stroke="currentColor"
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                >
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10s10-4.477 10-10S17.523 2 12 2"/>
                  <path d="M4.271 18.346S6.5 15.5 12 15.5s7.73 2.846 7.73 2.846M12 12a3 3 0 1 0 0-6a3 3 0 0 0 0 6"/>
                </g>
              </svg>
            </template>
          </MenuOverlayItem>
        </li>
        <li class="menu-overlay__item">
          <Button
            v-if="!isAuthenticated && !messenger"
            :hasIcon="true"
          >
            <template #icon>
              <svg
                width="24" height="24" viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3"
                  stroke="#FCFAF7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                />
              </svg>
            </template>
            <template #text>Войти</template>
          </Button>
          <Button
            v-else-if="!messenger"
            :hasIcon="true"
            @click="onLogout"
          >
            <template #icon>
              <svg
                width="24" height="24" viewBox="0 0 24 24"
                fill="none">
              <path
                d="M10.504 21H17.5C18.605 21 19.5 19.849 19.5 18.429V5.57C19.5 4.151 18.605 3 17.5 3H10.5M8 15.5L4.5 12L8 8.5M14.5 11.996H4.5"
                stroke="#FCFAF7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"
              />
            </svg>
            </template>
            <template #text>Выйти</template>
          </Button>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../../assets/styles/helpers/' as *;

.menu-overlay {
  position: absolute;
  inset: 0;
  padding: rem(60) rem(40);
  background-color: var(--color-light);
  z-index: 10;

  &__close-button-wrapper {
    display: flex;
    justify-content: end;
  }

  &__list {
    @include flex-center;

    flex-direction: column;
    row-gap: rem(10);
    min-height: 80vh;
  }

  &__item {
    &:last-child {
      margin-top: rem(30);
    }
  }
}
</style>