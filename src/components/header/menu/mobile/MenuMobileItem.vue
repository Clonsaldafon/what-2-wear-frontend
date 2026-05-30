<script setup lang="ts">
import { useRouter } from 'vue-router'

import { ROUTES } from '@/utils/constants'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const router = useRouter()

const props = defineProps<{
  route: string
  isClothes: boolean
  selected: boolean
}>()

const emit = defineEmits(['clothes'])

const navigate = async (route: string) => {
  if (props.route === ROUTES.CLOTHES && !authStore.isAuthenticated) {
    emit('clothes')
    return
  }

  router.push(`/${route}`)
}
</script>

<template>
  <div
    :class="`menu-mobile-item ${!isClothes ? 'menu-mobile-item--square' : ''} ${selected ? 'menu-mobile-item--selected' : ''}`"
    @click="navigate(route)"
  >
    <div v-if="!isClothes" class="menu-mobile-item__icon">
      <slot name="icon"></slot>
    </div>
    <div
      v-else
      :class="`menu-mobile-item__clothes ${selected ? 'menu-mobile-item__clothes--selected' : ''}`"
      @click="navigate(route)"
    >
      <div class="menu-mobile-item__clothes-text">Что<br/>надеть?</div>
      <svg
        class="menu-mobile-item__clothes-icon"
        width="16" height="16" viewBox="0 0 16 16"
        fill="none"
      >
        <path d="M8.00005 3.00006C7.56538 3.00006 7.19472 3.27739 7.05672 3.66673C7.03562 3.72964 7.00222 3.78772 6.95846 3.83759C6.91469 3.88746 6.86144 3.92812 6.8018 3.9572C6.74216 3.98628 6.67734 4.0032 6.61109 4.00697C6.54485 4.01075 6.47852 4.0013 6.41596 3.97918C6.35341 3.95706 6.29588 3.92271 6.24674 3.87814C6.19759 3.83356 6.15781 3.77965 6.12971 3.71954C6.10161 3.65944 6.08575 3.59434 6.08306 3.52804C6.08037 3.46175 6.09091 3.39558 6.11405 3.33339C6.2186 3.03777 6.3912 2.77086 6.61792 2.55424C6.84463 2.33761 7.1191 2.17732 7.41918 2.08632C7.71925 1.99532 8.03652 1.97615 8.34537 2.03036C8.65422 2.08457 8.946 2.21065 9.19714 2.3984C9.44829 2.58616 9.65177 2.83034 9.79115 3.11123C9.93054 3.39212 10.0019 3.70185 9.99955 4.01541C9.99717 4.32897 9.92109 4.63758 9.77747 4.91632C9.63384 5.19507 9.42668 5.43613 9.17272 5.62006C8.97205 5.76606 8.79405 5.91206 8.66805 6.06473C8.54405 6.21539 8.50005 6.33606 8.50005 6.44006C8.50011 6.51931 8.52158 6.59707 8.56218 6.66513C8.60278 6.73319 8.66101 6.78902 8.73072 6.82673L13.802 9.56806C14.1246 9.74261 14.3798 10.0197 14.5272 10.3556C14.6745 10.6915 14.7057 11.0669 14.6157 11.4225C14.5258 11.778 14.3198 12.0934 14.0305 12.3188C13.7411 12.5442 13.3848 12.6666 13.0181 12.6667H2.98205C2.61528 12.6666 2.25902 12.5442 1.96965 12.3188C1.68027 12.0934 1.47431 11.778 1.38435 11.4225C1.29439 11.0669 1.32556 10.6915 1.47293 10.3556C1.62031 10.0197 1.87547 9.74261 2.19805 9.56806L6.26472 7.36939C6.3225 7.33818 6.38586 7.31866 6.45119 7.31194C6.51652 7.30521 6.58253 7.31142 6.64545 7.33021C6.70838 7.349 6.76699 7.38 6.81794 7.42144C6.86889 7.46288 6.91117 7.51395 6.94238 7.57173C6.97359 7.62951 6.99312 7.69287 6.99984 7.7582C7.00656 7.82353 7.00035 7.88954 6.98157 7.95247C6.96278 8.01539 6.93178 8.074 6.89034 8.12495C6.8489 8.1759 6.79783 8.21818 6.74005 8.24939L2.67338 10.4474C2.54636 10.516 2.44588 10.6251 2.38783 10.7573C2.32979 10.8895 2.31752 11.0373 2.35295 11.1772C2.38838 11.3172 2.46949 11.4414 2.58344 11.53C2.6974 11.6187 2.83767 11.6668 2.98205 11.6667H13.0181C13.1624 11.6668 13.3027 11.6187 13.4167 11.53C13.5306 11.4414 13.6117 11.3172 13.6472 11.1772C13.6826 11.0373 13.6703 10.8895 13.6123 10.7573C13.5542 10.6251 13.4537 10.516 13.3267 10.4474L8.25538 7.70606C8.02699 7.58262 7.83622 7.39974 7.70325 7.17676C7.57029 6.95378 7.50008 6.69901 7.50005 6.43939C7.50005 6.02406 7.68538 5.68539 7.89605 5.42939C8.10538 5.17606 8.36738 4.96939 8.58605 4.81073C8.75747 4.68691 8.88524 4.51195 8.95098 4.31097C9.01673 4.10998 9.01707 3.89333 8.95196 3.69215C8.88684 3.49096 8.75963 3.31559 8.5886 3.19124C8.41756 3.06689 8.21151 2.99996 8.00005 3.00006Z" fill="#7F8C8D" />
      </svg>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../../assets/styles/helpers/' as *;

.menu-mobile-item {
  transition-duration: var(--transition-duration);

  &--square {
    @include square(32);
    @include flex-center;
  }

  &--selected {
    color: var(--color-light-alt);
    background-color: var(--color-accent);
    box-shadow: 0 rem(4) rem(4) 0 rgba($color: #2E7D64, $alpha: 0.25);
    border-radius: 50%;

    .menu-mobile-item__icon {
      @include square(20);
      @include flex-center;
    }
  }

  &__icon {
    @include square(28);
  }

  &__clothes {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: rem(5);
    padding: rem(2) rem(2) rem(2) rem(10);
    background-color: var(--color-dark-alt);
    border-radius: rem(30);

    &--selected {
      background-color: var(--color-accent);
      box-shadow: 0 rem(4) rem(4) 0 rgba($color: #2E7D64, $alpha: 0.25);

      .menu-mobile-item__clothes-text {
        color: var(--color-light-alt);
      }
    }

    &-text {
      font-size: 10px;
      line-height: 1;
      color: var(--color-light-alt);
    }

    &-icon {
      @include square(28);

      padding: rem(6);
      color: var(--color-dark-alt);
      background-color: var(--color-light-alt);
      border-radius: 50%;
    }
  }
}
</style>