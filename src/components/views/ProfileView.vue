<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import Button from '../buttons/Button.vue'
import Header from '../header/Header.vue'
import Overlay from '../Overlay.vue'
import UserCard from '../profile/UserCard.vue'
import AddWardrobeItemModal from '../profile/AddWardrobeItemModal.vue'
import WardrobeItemCard from '../profile/WardrobeItemCard.vue'

import { useErrorStore } from '@/stores/error.ts'
import { useAuthStore, type UserGender } from '@/stores/auth.ts'
import { useWardrobeStore } from '@/stores/wardrobes.ts'
import { ROUTES } from '@/utils/constants.ts'

const errorStore = useErrorStore()
const authStore = useAuthStore()
const wardrobeStore = useWardrobeStore()
const router = useRouter()

const { messenger, username, accountEmail, telegramPhoto, hasPasswordLogin, userGender } = storeToRefs(authStore)

const userPhoto = computed(() => messenger.value === 'telegram' ? telegramPhoto.value : undefined)
const displayName = computed(() => username.value || 'Пользователь')
const wardrobeCount = computed(() => wardrobeStore.items.length)
const isTelegramMiniApp = computed(() => Boolean(
  (window as any).Telegram?.WebApp?.initData || (window as any).Telegram?.WebApp?.initDataUnsafe?.user
))

const profileForm = reactive({
  username: username.value || '',
  email: accountEmail.value || '',
  password: '',
  gender: userGender.value
})
const profileSaving = ref(false)

watch(
  [username, accountEmail, userGender],
  ([nextUsername, nextEmail, nextGender]) => {
    profileForm.username = nextUsername || profileForm.username
    profileForm.email = nextEmail || ''
    profileForm.gender = nextGender
  },
  { immediate: true }
)

type ModalView = 'wardrobe-item' | null

const activeModal = ref<ModalView>(null)

const onAddWardrobeItemOpen = () => {
  activeModal.value = 'wardrobe-item'
}

const onModalClose = () => {
  activeModal.value = null
}

const handleLogout = () => {
  authStore.logout()
  router.push({ name: ROUTES.WEATHER })
}

const handleSaveProfile = async () => {
  if (profileForm.password && !profileForm.username.trim()) {
    errorStore.setError('Ошибка', 'Чтобы задать пароль, укажите логин.')
    return
  }

  profileSaving.value = true
  errorStore.clearError()

  const payload: { username?: string; email?: string; gender?: UserGender; password?: string } = {
    email: profileForm.email.trim(),
    gender: profileForm.gender
  }

  if (profileForm.username.trim()) {
    payload.username = profileForm.username.trim()
  }

  if (profileForm.password) {
    payload.password = profileForm.password
  }

  const result = await authStore.updateProfile(payload)

  profileSaving.value = false

  if (!result.success) {
    errorStore.setError('Ошибка', result.message || 'Не удалось сохранить профиль.')
    return
  }

  profileForm.password = ''
}

const handleDeleteWardrobeItem = async (itemId: number) => {
  if (!confirm('Удалить эту вещь из гардероба?')) return

  try {
    await wardrobeStore.deleteItem(itemId)
  } catch {
    errorStore.setError('Ошибка', 'Не удалось удалить вещь. Попробуйте позже.')
  }
}
</script>

<template>
  <Header />

  <main v-if="authStore.isAuthenticated" class="profile-page section container">
    <header class="profile-page__header">
      <div>
        <h1 class="profile-page__title h1">Профиль</h1>
      </div>
      <div class="profile-page__actions">
        <Button
          v-if="!isTelegramMiniApp"
          class="profile-page__logout"
          :outlined="true"
          :hasIcon="true"
          @click="handleLogout"
        >
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 3H19C19.5 3 20 3.2 20.4 3.6C20.8 4 21 4.5 21 5V19C21 19.5 20.8 20 20.4 20.4C20 20.8 19.5 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </template>
          <template #text>Выйти</template>
        </Button>
        <Button
          class="profile-page__add"
          :hasIcon="true"
          :accent="true"
          @click="onAddWardrobeItemOpen"
        >
          <template #icon>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </template>
          <template #text>Добавить вещь</template>
        </Button>
      </div>
    </header>

    <section class="profile-layout">
      <aside class="profile-summary">
        <UserCard
          :username="displayName"
          :email="accountEmail || 'Почта не указана'"
          :photoUrl="userPhoto || undefined"
          :messenger="messenger"
          :hasPasswordLogin="hasPasswordLogin"
        />

        <div class="profile-stats">
          <div class="profile-stats__item">
            <span>{{ wardrobeCount }}</span>
            <strong>вещей</strong>
          </div>
          <div class="profile-stats__item">
            <span>{{ userGender === 'unspecified' ? 'Не указан' : userGender === 'female' ? 'Женский' : 'Мужской' }}</span>
            <strong>пол</strong>
          </div>
        </div>

        <div
          v-if="messenger === 'telegram' && !hasPasswordLogin"
          class="access-warning"
        >
          <strong>Защитите аккаунт</strong>
          <span>Добавьте логин и пароль, чтобы входить вне Telegram.</span>
        </div>
      </aside>

      <form class="profile-editor" @submit.prevent="handleSaveProfile">
        <section class="profile-section">
          <header class="profile-section__header">
            <h2 class="profile-section__title h3">Персонализация</h2>
          </header>

          <div class="gender-control">
            <button
              type="button"
              :class="{ 'gender-control__button--active': profileForm.gender === 'unspecified' }"
              @click="profileForm.gender = 'unspecified'"
            >
              Не указывать
            </button>
            <button
              type="button"
              :class="{ 'gender-control__button--active': profileForm.gender === 'female' }"
              @click="profileForm.gender = 'female'"
            >
              Женский
            </button>
            <button
              type="button"
              :class="{ 'gender-control__button--active': profileForm.gender === 'male' }"
              @click="profileForm.gender = 'male'"
            >
              Мужской
            </button>
          </div>
        </section>

        <section class="profile-section">
          <header class="profile-section__header">
            <h2 class="profile-section__title h3">Вход в аккаунт</h2>
            <p class="profile-section__caption">Логин и пароль нужны для браузера и будущего мобильного приложения.</p>
          </header>

          <div class="profile-fields">
            <label class="profile-field">
              <span class="profile-field__label">Логин</span>
              <input
                v-model.trim="profileForm.username"
                class="profile-field__input"
                type="text"
                autocomplete="username"
                placeholder="Введите логин"
              >
            </label>
            <label class="profile-field">
              <span class="profile-field__label">Почта</span>
              <input
                v-model.trim="profileForm.email"
                class="profile-field__input"
                type="email"
                autocomplete="email"
                placeholder="Введите почту"
              >
            </label>
            <label class="profile-field profile-field--full">
              <span class="profile-field__label">Новый пароль</span>
              <input
                v-model="profileForm.password"
                class="profile-field__input"
                type="password"
                autocomplete="new-password"
                placeholder="Оставьте пустым, если не меняете"
              >
            </label>
          </div>
        </section>

        <Button
          class="profile-editor__submit"
          type="submit"
          :disabled="profileSaving"
        >
          <template #text>{{ profileSaving ? 'Сохраняем...' : 'Сохранить изменения' }}</template>
        </Button>
      </form>
    </section>

    <Button
      v-if="wardrobeStore.items.length"
      class="profile-page__mobile-add"
      :hasIcon="true"
      :accent="true"
      @click="onAddWardrobeItemOpen"
    >
      <template #icon>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </template>
      <template #text>Добавить вещь</template>
    </Button>

    <section class="wardrobe">
      <header class="wardrobe__header">
        <div>
          <h2 class="wardrobe__title h2">Мой гардероб</h2>
        </div>
      </header>

      <div v-if="!wardrobeStore.items.length" class="wardrobe-empty">
        <strong>Гардероб пока пуст</strong>
        <span>Добавьте несколько вещей, и рекомендации начнут подбирать варианты из вашего шкафа.</span>
        <Button :accent="true" @click="onAddWardrobeItemOpen">
          <template #text>Добавить первую вещь</template>
        </Button>
      </div>

      <ul v-else class="wardrobe__list">
        <li
          v-for="item in wardrobeStore.items"
          :key="item.id"
          class="wardrobe__item"
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
    </section>
  </main>

  <section v-else class="profile-page section container">
    <p>Чтобы увидеть профиль, войдите в аккаунт.</p>
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

.profile-page {
  display: flex;
  flex-direction: column;
  row-gap: rem(26);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(16);
  }

  &__title {
    margin: 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: rem(10);
  }

  &__mobile-add {
    display: none !important;
  }

  @include tablet {
    &__header {
      align-items: center;
    }

    &__actions {
      align-items: center;
      flex-direction: row;
    }

    &__add {
      display: none !important;
    }

    &__logout {
      width: rem(46);
      height: rem(46);
      padding: rem(10);

      :deep(.button__text) {
        @include visually-hidden;
      }
    }

    &__mobile-add {
      display: flex !important;
      justify-content: center;
      width: 100%;
    }
  }
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(rem(280), rem(360)) minmax(0, 1fr);
  gap: rem(18);
  align-items: start;

  @include tablet-l {
    grid-template-columns: 1fr;
  }
}

.profile-summary,
.profile-editor,
.profile-section,
.wardrobe-empty {
  background-color: var(--color-light-alt);
  border: rem(1) solid var(--color-gray);
  border-radius: rem(24);
}

.profile-summary {
  display: flex;
  flex-direction: column;
  row-gap: rem(12);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: rem(10);
  padding: 0 rem(12) rem(12);

  &__item {
    display: flex;
    flex-direction: column;
    row-gap: rem(4);
    padding: rem(12);
    background-color: var(--color-gray-alt);
    border-radius: rem(16);

    span {
      overflow-wrap: anywhere;
      font-weight: 700;
    }

    strong {
      color: var(--color-dark-alt);
      font-size: rem(13);
    }
  }
}

.access-warning {
  display: flex;
  flex-direction: column;
  row-gap: rem(6);
  margin: 0 rem(12) rem(12);
  padding: rem(12);
  color: var(--color-dark);
  background-color: rgba(224, 189, 54, 0.14);
  border: rem(1) solid rgba(224, 189, 54, 0.36);
  border-radius: rem(16);

  span {
    color: var(--color-dark-alt);
  }
}

.profile-editor {
  display: flex;
  flex-direction: column;
  row-gap: rem(14);
  padding: rem(16);
}

.profile-section {
  display: flex;
  flex-direction: column;
  row-gap: rem(14);
  padding: rem(16);
  background-color: var(--color-gray-alt);

  &__header {
    display: flex;
    flex-direction: column;
    row-gap: rem(6);
  }

  &__title {
    margin: 0;
    font-size: rem(20);
  }

  &__caption {
    color: var(--color-dark-alt);
  }
}

.gender-control {
  display: flex;
  flex-wrap: wrap;
  gap: rem(8);

  button {
    min-height: rem(40);
    padding: rem(9) rem(14);
    color: var(--color-dark);
    font-weight: 700;
    background-color: var(--color-light);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(18);

    @include hover {
      border-color: var(--color-accent);
    }
  }

  &__button--active {
    color: var(--color-light) !important;
    background-color: var(--color-accent) !important;
    border-color: var(--color-accent) !important;
  }
}

.profile-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: rem(12);

  @include mobile-l {
    grid-template-columns: 1fr;
  }
}

.profile-field {
  display: flex;
  flex-direction: column;
  row-gap: rem(8);

  &--full {
    grid-column: 1 / -1;
  }

  &__label {
    font-weight: 700;
  }

  &__input {
    min-height: rem(52);
    padding: rem(14) rem(16);
    color: var(--color-dark);
    background-color: var(--color-light);
    border: rem(1) solid var(--color-gray);
    border-radius: rem(16);
    outline: none;

    &:focus {
      border-color: var(--color-accent);
      background-color: var(--color-light-alt);
    }
  }
}

.profile-editor__submit {
  align-self: flex-end;

  @include mobile-l {
    width: 100%;
  }
}

.wardrobe {
  display: flex;
  flex-direction: column;
  row-gap: rem(14);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: rem(12);
  }

  &__title {
    margin: 0;
  }

  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(rem(190), 1fr));
    gap: rem(14);

    @include tablet {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: rem(12);
    }

    @include mobile {
      grid-template-columns: 1fr;
    }
  }
}

.wardrobe-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  row-gap: rem(10);
  padding: rem(20);

  span {
    max-width: rem(520);
    color: var(--color-dark-alt);
  }
}
</style>
