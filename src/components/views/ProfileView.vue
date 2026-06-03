<script setup lang="ts">
import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'

import Button from '../buttons/Button.vue'
import Header from '../header/Header.vue'
import Overlay from '../Overlay.vue'
import UserCard from '../profile/UserCard.vue'
import AddWardrobeItemModal from '../profile/AddWardrobeItemModal.vue'
import WardrobeItemCard from '../profile/WardrobeItemCard.vue'

import { useErrorStore } from '@/stores/error.ts'
import { useAuthStore } from '@/stores/auth.ts'
import { useWardrobeStore } from '@/stores/wardrobes.ts'

const errorStore = useErrorStore()
const authStore = useAuthStore()
const wardrobeStore = useWardrobeStore()

const { isAuthenticated, messenger, username, telegramPhoto } = storeToRefs(authStore)

const userPhoto = computed(() => messenger.value === 'telegram' ? telegramPhoto.value : undefined)

type ModalView = 'wardrobe-item' | null

const activeModal = ref<ModalView>(null)

const onAddWardrobeItemOpen = () => {
  activeModal.value = 'wardrobe-item'
}

const onModalClose = () => {
  activeModal.value = null
}

const handleDeleteWardrobeItem = async (itemId: number) => {
  if (!confirm('Удалить эту вещь из гардероба?')) return

  try {
    await wardrobeStore.deleteItem(itemId)
  } catch (err) {
    errorStore.setError('Ошибка', 'Не удалось удалить вещь. Попробуйте позже.')
  }
}
</script>

<template>
  <Header />
  <section v-if="authStore.isAuthenticated" class="profile section container">
    <h1 class="visually-hidden h1">Мой профиль</h1>
    <UserCard
      :username="username || 'Пользователь'"
      :email="'Почта не указана'"
      :photoUrl="userPhoto || undefined"
    />
  </section>
  <section v-if="authStore.isAuthenticated" class="wardrobe container">
    <header class="wardrobe__header">
      <h2 class="wardrobe__title h2">Мой гардероб</h2>
      <Button
        :type="'button'"
        :hasIcon="true"
        :hasText="false"
        :accent="true"
        @click="onAddWardrobeItemOpen"
      >
        <template #icon>
          <svg
            width="24" height="24" viewBox="0 0 24 24"
            fill="none"
          >
            <path d="M12 4C12.2652 4 12.5196 4.10536 12.7071 4.29289C12.8946 4.48043 13 4.73478 13 5V11H19C19.2652 11 19.5196 11.1054 19.7071 11.2929C19.8946 11.4804 20 11.7348 20 12C20 12.2652 19.8946 12.5196 19.7071 12.7071C19.5196 12.8946 19.2652 13 19 13H13V19C13 19.2652 12.8946 19.5196 12.7071 19.7071C12.5196 19.8946 12.2652 20 12 20C11.7348 20 11.4804 19.8946 11.2929 19.7071C11.1054 19.5196 11 19.2652 11 19V13H5C4.73478 13 4.48043 12.8946 4.29289 12.7071C4.10536 12.5196 4 12.2652 4 12C4 11.7348 4.10536 11.4804 4.29289 11.2929C4.48043 11.1054 4.73478 11 5 11H11V5C11 4.73478 11.1054 4.48043 11.2929 4.29289C11.4804 4.10536 11.7348 4 12 4Z" fill="#FCFAF7"/>
          </svg>
        </template>
      </Button>
    </header>
    <div class="wardrobe__search">
      <!-- TODO: Поиск и фильтрация гардероба -->
    </div>
    <div class="wardrobe__clothes">
      <ul class="wardrobe__clothes-list">
        <li
          v-for="item in wardrobeStore.items"
          class="wardrobe__clothes-item"
          :key="item.id"
          :value="item.image_url"
        >
          <WardrobeItemCard
            :isProfile="true"
            :photoUrl="item.image_url"
            :type="item.item_type_display"
            :color="item.color_display"
            @delete="handleDeleteWardrobeItem(item.id)"
          />
        </li>
      </ul>
    </div>
  </section>
  <Overlay
    v-if="activeModal"
    :onClose="onModalClose"
  >
    <template
      v-if="activeModal === 'wardrobe-item'"
      #modal
    >
      <AddWardrobeItemModal
        @close="onModalClose"
        @success="onModalClose"
      />
    </template>
  </Overlay>
</template>

<style scoped lang="scss">
@use '../../assets/styles/helpers/' as *;

.wardrobe {
  display: flex;
  flex-direction: column;
  row-gap: rem(10);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: rem(10);
  }

  &__clothes {
    &-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      column-gap: rem(12);
      row-gap: rem(10);
    }
  }
}
</style>
