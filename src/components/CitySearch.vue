<script setup lang="ts">
import { ref } from 'vue'

import { storeToRefs } from 'pinia';

import { useWeatherStore } from '@/stores/weather'

const emit = defineEmits<{
  (e: 'search', cityName: string): void
}>()

const weatherStore = useWeatherStore()
const { suggestions, loading, error } = storeToRefs(weatherStore)

const searchQuery = ref(weatherStore.city || '')
const selectedCityIndex = ref(-1)

let debounceTimer: ReturnType<typeof setTimeout> | null = null
const onSearchInput = () => {
  selectedCityIndex.value = -1

  if (debounceTimer) clearTimeout(debounceTimer)

  debounceTimer = setTimeout(async () => {
    if (searchQuery.value) {
      await weatherStore.fetchCitySuggestions(searchQuery.value)
    }
  }, 300)

  if (!searchQuery.value) {
    weatherStore.clearSuggestions()
  }
}

const onSearch = () => {
  if (selectedCityIndex.value >= 0) {
    onSelectCity(selectedCityIndex.value)
  } else if (searchQuery.value) {
    emit('search', searchQuery.value)
    weatherStore.clearSuggestions()
  }
}

const onSelectCity = (index: number) => {
  if (index >= 0 && index < suggestions.value.length) {
    const selectedCity = suggestions.value[index]

    if (selectedCity) {
      searchQuery.value = selectedCity?.name

      emit('search', selectedCity?.name)

      weatherStore.clearSuggestions()
      selectedCityIndex.value = -1
    }
  }
}

const moveSelection = (direction: number) => {
  if (suggestions.value.length === 0) return

  let newIndex = selectedCityIndex.value + direction
  if (newIndex < 0) newIndex = suggestions.value.length - 1
  else if (newIndex >= suggestions.value.length) newIndex = 0

  selectedCityIndex.value = newIndex
}
</script>

<template>
  <div class="city-search">
    <div class="city-search__field">
      <svg
        class="city-search__icon"
        width="24" height="24" viewBox="0 0 24 24"
        fill="none"
      >
        <path
          fill-rule="evenodd" clip-rule="evenodd"
          d="M12 6C11.5404 6 11.0852 6.09053 10.6606 6.26642C10.236 6.44231 9.85013 6.70012 9.52513 7.02513C9.20012 7.35013 8.94231 7.73597 8.76642 8.16061C8.59053 8.58525 8.5 9.04037 8.5 9.5C8.5 9.95963 8.59053 10.4148 8.76642 10.8394C8.94231 11.264 9.20012 11.6499 9.52513 11.9749C9.85013 12.2999 10.236 12.5577 10.6606 12.7336C11.0852 12.9095 11.5404 13 12 13C12.9283 13 13.8185 12.6313 14.4749 11.9749C15.1313 11.3185 15.5 10.4283 15.5 9.5C15.5 8.57174 15.1313 7.6815 14.4749 7.02513C13.8185 6.36875 12.9283 6 12 6ZM10.5 9.5C10.5 9.10218 10.658 8.72064 10.9393 8.43934C11.2206 8.15804 11.6022 8 12 8C12.3978 8 12.7794 8.15804 13.0607 8.43934C13.342 8.72064 13.5 9.10218 13.5 9.5C13.5 9.89782 13.342 10.2794 13.0607 10.5607C12.7794 10.842 12.3978 11 12 11C11.6022 11 11.2206 10.842 10.9393 10.5607C10.658 10.2794 10.5 9.89782 10.5 9.5Z"
          fill="#7F8C8D"
        />
        <path
          fill-rule="evenodd" clip-rule="evenodd"
          d="M12 2C7.828 2 4.5 5.483 4.5 9.712C4.5 11.901 5.714 14.101 7.065 15.998C7.988 17.294 9.075 18.576 10.022 19.692C10.462 20.212 10.872 20.695 11.222 21.128L12 22.092L12.778 21.128C13.128 20.695 13.538 20.212 13.978 19.692C14.925 18.576 16.012 17.294 16.935 15.998C18.286 14.1 19.5 11.9 19.5 9.712C19.5 5.483 16.172 2 12 2ZM6.5 9.712C6.5 6.527 8.992 4 12 4C15.008 4 17.5 6.527 17.5 9.712C17.5 11.231 16.625 12.986 15.306 14.837C14.429 16.068 13.451 17.221 12.534 18.302C12.3527 18.514 12.1747 18.724 12 18.932L11.466 18.302C10.549 17.222 9.571 16.068 8.694 14.837C7.376 12.987 6.5 11.231 6.5 9.712Z"
          fill="#7F8C8D"
        />
      </svg>
      <input
        class="city-search__input"
        type="text"
        placeholder="Введите город"
        v-model="searchQuery"
        @input="onSearchInput"
        @keyup.enter="onSelectCity(selectedCityIndex)"
        @keydown.down="moveSelection(1)"
        @keydown.up="moveSelection(-1)"
      />
      <button
        class="city-search__button hidden-mobile-l"
        :disabled="loading"
        @click="onSearch"
      >
        <svg
          class="city-search__button-icon"
          width="24" height="24" viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z"
            fill="#FCFAF7"
          />
        </svg>
      </button>
    </div>
    <button
        class="city-search__button visible-mobile-l"
        :disabled="loading"
        @click="onSearch"
      >
        <svg
          class="city-search__button-icon"
          width="24" height="24" viewBox="0 0 24 24"
          fill="none"
        >
          <path
            d="M9.5 16C7.68333 16 6.146 15.3707 4.888 14.112C3.63 12.8533 3.00067 11.316 3 9.5C2.99933 7.684 3.62867 6.14667 4.888 4.888C6.14733 3.62933 7.68467 3 9.5 3C11.3153 3 12.853 3.62933 14.113 4.888C15.373 6.14667 16.002 7.684 16 9.5C16 10.2333 15.8833 10.925 15.65 11.575C15.4167 12.225 15.1 12.8 14.7 13.3L20.3 18.9C20.4833 19.0833 20.575 19.3167 20.575 19.6C20.575 19.8833 20.4833 20.1167 20.3 20.3C20.1167 20.4833 19.8833 20.575 19.6 20.575C19.3167 20.575 19.0833 20.4833 18.9 20.3L13.3 14.7C12.8 15.1 12.225 15.4167 11.575 15.65C10.925 15.8833 10.2333 16 9.5 16ZM9.5 14C10.75 14 11.8127 13.5627 12.688 12.688C13.5633 11.8133 14.0007 10.7507 14 9.5C13.9993 8.24933 13.562 7.187 12.688 6.313C11.814 5.439 10.7513 5.00133 9.5 5C8.24867 4.99867 7.18633 5.43633 6.313 6.313C5.43967 7.18967 5.002 8.252 5 9.5C4.998 10.748 5.43567 11.8107 6.313 12.688C7.19033 13.5653 8.25267 14.0027 9.5 14Z"
            fill="#FCFAF7"
          />
        </svg>
      </button>

    <ul
      v-if="searchQuery.trim() && weatherStore.suggestions.length > 0"
      class="city-search__list"
    >
      <li
        v-for="(city, index) in weatherStore.suggestions"
        :key="city.id"
        :class="`city-search__item ${ index === selectedCityIndex ? 'city-search__item--active' : '' }`"
        @click="onSelectCity(index)"
      >
        {{ city.full_name }}
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss">
@use '../assets/styles/helpers/' as *;

.city-search {
  display: grid;
  flex-direction: column;
  justify-content: center;
  position: relative;
  width: 100%;
  max-width: rem(390);

  &__field {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: rem(4);
    background: var(--color-light-alt);
    border: 1px solid var(--color-gray);
    border-radius: rem(30);
    overflow: hidden;
    transition-duration: var(--transition-duration);

    @include hover {
      border-color: var(--color-dark);
    }

    &:focus-within {
      border-color: var(--color-dark);
    }
  }

  &__icon {
    @include flex-center;

    position: absolute;
    left: rem(15);
    color: var(--color-dark-alt);
    pointer-events: none;
  }

  &__input {
    @include fluid-text(18, 14);

    flex: 1;
    padding-inline: rem(50);
    border: none;
    outline: none;
    background: transparent;
    color: var(--color-dark);
    font-weight: 500;

    @include mobile-l {
      padding-block: rem(9);
    }
  }

  &__button {
    @include square(36);
    @include flex-center;

    padding: rem(6);
    color: var(--color-light);
    background-color: var(--color-dark);
    border-radius: 50%;

    @include hover {
      &:not(:disabled) {
        opacity: 0.8;
      }
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 10;
    padding: rem(15);
    background-color: var(--color-light-alt);
    border: 1px solid var(--color-gray);
    border-radius: rem(12);
    box-shadow: 0 rem(4) rem(12) rgba(0, 0, 0, 0.1);
    overflow-y: auto;
  }

  &__item {
    padding: rem(10) rem(15);
    border: rem(1) solid transparent;
    border-radius: rem(30);
    line-height: 1.2;

    &--active {
      border-color: var(--color-accent);
    }
  }

  @include mobile-l {
    display: grid;
    grid-template-columns: 80% auto;
    align-items: center;
    column-gap: rem(10);
  }
}
</style>