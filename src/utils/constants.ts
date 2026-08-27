export const ROUTES = {
  WEATHER: 'weather',
  CLOTHES: 'clothes',
  PROFILE: 'profile',
  SETTINGS: 'settings'
}

export const CATEGORY_OPTIONS = [
  { value: 'outerwear', label: 'Верхняя одежда' },
  { value: 'top', label: 'Верх' },
  { value: 'bottom', label: 'Низ' },
  { value: 'footwear', label: 'Обувь' },
  { value: 'headwear', label: 'Головной убор' },
  { value: 'accessory', label: 'Аксессуар' }
]

export const COLOR_OPTIONS = [
  { value: 'black', label: 'Чёрный' },
  { value: 'white', label: 'Белый' },
  { value: 'red', label: 'Красный' },
  { value: 'blue', label: 'Синий' },
  { value: 'green', label: 'Зелёный' },
  { value: 'yellow', label: 'Жёлтый' },
  { value: 'gray', label: 'Серый' },
  { value: 'brown', label: 'Коричневый' },
  { value: 'beige', label: 'Бежевый' },
  { value: 'orange', label: 'Оранжевый' },
  { value: 'pink', label: 'Розовый' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'multicolor', label: 'Разноцветный' }
]

export const SEASON_OPTIONS = [
  { value: 'winter', label: 'Зима' },
  { value: 'spring', label: 'Весна' },
  { value: 'summer', label: 'Лето' },
  { value: 'autumn', label: 'Осень' },
  { value: 'any', label: 'Все сезоны' }
]

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Мужская' },
  { value: 'female', label: 'Женская' },
  { value: 'unisex', label: 'Унисекс' }
]

export const ITEM_TYPE_OPTIONS: Record<string, { value: string, label: string }[]> = {
  outerwear: [
    { value: 'puffer_jacket', label: 'Пуховик' },
    { value: 'parka', label: 'Парка' },
    { value: 'sheepskin_coat', label: 'Дублёнка' },
    { value: 'fur_coat', label: 'Шуба' },
    { value: 'coat', label: 'Плащ' },
    { value: 'trench_coat', label: 'Тренч' },
    { value: 'windbreaker', label: 'Ветровка' },
    { value: 'leather_jacket', label: 'Кожаная куртка' },
    { value: 'demi_season_jacket', label: 'Демисезонная куртка' },
    { value: 'raincoat', label: 'Дождевик' },
    { value: 'hoodie', label: 'Худи' },
    { value: 'light_jacket', label: 'Лёгкая куртка' },
    { value: 'cardigan', label: 'Кардиган' },
    { value: 'none', label: 'Без верхней одежды' }
  ],
  top: [
    { value: 't_shirt', label: 'Футболка' },
    { value: 'longsleeve', label: 'Лонгслив' },
    { value: 'shirt', label: 'Рубашка' },
    { value: 'sweater', label: 'Свитер' },
    { value: 'thermal', label: 'Термобельё' },
    { value: 'turtleneck', label: 'Водолазка' },
    { value: 'fleece', label: 'Флис' },
    { value: 'thin_sweater', label: 'Тонкий свитер' },
    { value: 'blouse', label: 'Блуза' },
    { value: 'polo', label: 'Поло' },
    { value: 'short_sleeve_shirt', label: 'Рубашка с коротким рукавом' },
    { value: 'tank_top', label: 'Майка' },
    { value: 'top', label: 'Топ' },
    { value: 'hoodie', label: 'Худи' }
  ],
  bottom: [
    { value: 'jeans', label: 'Джинсы' },
    { value: 'trousers', label: 'Брюки' },
    { value: 'thermal_trousers', label: 'Утеплённые брюки' },
    { value: 'insulated_jeans', label: 'Утеплённые джинсы' },
    { value: 'winter_trousers', label: 'Зимние брюки' },
    { value: 'insulated_leggings', label: 'Утеплённые леггинсы' },
    { value: 'insulated_skirt', label: 'Юбка с утеплителем' },
    { value: 'leggings', label: 'Леггинсы' },
    { value: 'skirt', label: 'Юбка средней длины' },
    { value: 'shorts', label: 'Шорты' },
    { value: 'light_trousers', label: 'Лёгкие брюки' },
    { value: 'linen_trousers', label: 'Льняные штаны' },
    { value: 'sundress', label: 'Сарафан' },
    { value: 'chinos', label: 'Чиносы' }
  ],
  footwear: [
    { value: 'sneakers', label: 'Кроссовки' },
    { value: 'demi_boots', label: 'Демисезонные ботинки' },
    { value: 'winter_boots', label: 'Зимние ботинки' },
    { value: 'waterproof_boots', label: 'Непромокаемая обувь' },
    { value: 'felt_boots', label: 'Унты' },
    { value: 'combat_boots', label: 'Берцы' },
    { value: 'winter_high_boots', label: 'Зимние сапоги' },
    { value: 'ugg_boots', label: 'Угги' },
    { value: 'fur_ankle_boots', label: 'Ботильоны на меху' },
    { value: 'ankle_boots', label: 'Ботильоны' },
    { value: 'dress_shoes', label: 'Туфли' },
    { value: 'ballet_flats', label: 'Балетки' },
    { value: 'sandals', label: 'Сандалии' },
    { value: 'loafers', label: 'Мокасины' },
    { value: 'canvas_shoes', label: 'Кеды' },
    { value: 'slip_ons', label: 'Слипоны' }
  ],
  headwear: [
    { value: 'hat', label: 'Шапка' },
    { value: 'ushanka', label: 'Ушанка' },
    { value: 'beret', label: 'Берет' },
    { value: 'bonnet', label: 'Капор' },
    { value: 'baseball_cap', label: 'Бейсболка' },
    { value: 'cap', label: 'Кепка' },
    { value: 'panama', label: 'Панама' },
    { value: 'wide_hat', label: 'Шляпа' },
    { value: 'headscarf', label: 'Косынка' },
    { value: 'bandana', label: 'Бандана' }
  ],
  accessory: [
    { value: 'scarf', label: 'Шарф' },
    { value: 'thin_scarf', label: 'Тонкий шарф' },
    { value: 'snood', label: 'Снуд' },
    { value: 'gloves', label: 'Перчатки' },
    { value: 'mittens', label: 'Варежки' },
    { value: 'umbrella', label: 'Зонт' },
    { value: 'sun_umbrella', label: 'Зонт от солнца' },
    { value: 'sunglasses', label: 'Солнцезащитные очки' }
  ]
}
