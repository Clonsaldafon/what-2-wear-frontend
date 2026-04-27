import { AxiosError } from 'axios'

type ApiErrorPayload = Record<string, unknown> | string | null | undefined

const FIELD_LABELS: Record<string, string> = {
  username: 'Логин',
  password: 'Пароль',
  email: 'Email',
  city: 'Город',
  hours: 'Количество часов',
  weather_request_id: 'Запрос погоды',
  score: 'Оценка',
  rating: 'Причина',
  comment: 'Комментарий',
  init_data: 'Данные Telegram',
  messenger_user_id: 'Пользователь мессенджера',
}

const MESSAGE_MAP: Record<string, string> = {
  'Invalid username or password': 'Неверный логин или пароль.',
  'Invalid password': 'Неверный пароль.',
  'User not found': 'Пользователь не найден.',
  'Password is required for this user': 'Для этого пользователя нужен пароль.',
  'Must provide either username/password or messenger_user_id': 'Введите логин и пароль.',
  'This field may not be blank.': 'Поле не может быть пустым.',
  'This field is required.': 'Заполните обязательное поле.',
  'This field is required for Telegram': 'Не удалось получить данные Telegram.',
  'The value is incorrect': 'Некорректное значение.',
  'Invalid or expired init data': 'Сессия Telegram устарела. Откройте приложение заново.',
  'Telegram user id is missing': 'Не удалось определить пользователя Telegram.',
  'Telegram user id does not match init data': 'Данные пользователя Telegram не совпадают.',
  'Weather request not found.': 'Не удалось найти прогноз для оценки. Обновите погоду и попробуйте снова.',
  'Rating or score is required.': 'Выберите оценку перед отправкой.',
  'Corrected targets are required for corrected feedback.': 'Заполните исправленный комплект.',
  'Ensure this value is greater than or equal to 1.': 'Оценка должна быть от 1 до 10.',
  'Ensure this value is less than or equal to 10.': 'Оценка должна быть от 1 до 10.',
  'A user with that username already exists.': 'Пользователь с таким логином уже существует.',
  'пользователь with this Имя пользователя already exists.': 'Пользователь с таким логином уже существует.',
  'Enter a valid email address.': 'Введите корректный email.',
}

const normalizeMessage = (message: unknown, fallbackMessage: string, field?: string) => {
  if (typeof message !== 'string' || !message.trim()) {
    return fallbackMessage
  }

  const trimmed = message.trim()

  if (MESSAGE_MAP[trimmed]) {
    return MESSAGE_MAP[trimmed]
  }

  if (/with this .+ already exists\./i.test(trimmed)) {
    if (field === 'username') {
      return 'Пользователь с таким логином уже существует.'
    }

    if (field === 'email') {
      return 'Пользователь с таким email уже существует.'
    }

    if (field === 'messenger_user_id') {
      return 'Этот аккаунт мессенджера уже привязан к другому пользователю.'
    }

    return 'Такая запись уже существует.'
  }

  if (trimmed.startsWith('Missing target columns:')) {
    return 'В исправленном комплекте не хватает обязательных полей.'
  }

  if (trimmed.startsWith('Allowed values:')) {
    return 'Выбрано неподдерживаемое значение.'
  }

  if (trimmed.startsWith('Сервис погоды вернул ошибку')) {
    return 'Сервис погоды временно недоступен. Попробуйте позже.'
  }

  return trimmed
}

const firstMessageFromPayload = (payload: ApiErrorPayload): { field?: string; message?: unknown } => {
  if (!payload) return {}

  if (typeof payload === 'string') {
    return { message: payload }
  }

  const directMessage = payload.message || payload.error || payload.detail
  if (directMessage) {
    return { message: directMessage }
  }

  const firstEntry = Object.entries(payload)[0]
  if (!firstEntry) return {}

  const [field, value] = firstEntry
  const message = Array.isArray(value) ? value[0] : value

  return { field, message }
}

export const getReadableApiErrorMessage = (error: unknown, fallbackMessage: string) => {
  if (!(error instanceof AxiosError)) {
    return fallbackMessage
  }

  if (error.code === 'ERR_NETWORK' || error.code === 'ERR_CONNECTION_REFUSED') {
    return 'Нет соединения с сервером. Проверьте подключение к интернету.'
  }

  if (error.code === 'ECONNABORTED') {
    return 'Сервер долго не отвечает. Попробуйте еще раз.'
  }

  const { field, message } = firstMessageFromPayload(error.response?.data as ApiErrorPayload)
  const readableMessage = normalizeMessage(message, fallbackMessage, field)
  const fieldLabel = field ? FIELD_LABELS[field] : null

  return fieldLabel ? `${fieldLabel}: ${readableMessage}` : readableMessage
}
