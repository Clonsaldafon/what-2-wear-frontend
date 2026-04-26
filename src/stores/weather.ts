import { ref } from 'vue'

import { defineStore } from 'pinia'
import { AxiosError } from 'axios';

import apiClient from '@/services/api'

interface CitySuggestion {
  id: number
  name: string
  full_name: string
}

interface ClothingRecommendation {
  title: string
  summary: string
  items: string[]
  accessories: string[]
  notes: string[]
  outfit: Record<string, string>
}

const formatDisplayCity = (value: string) => {
  const parts = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  if (parts.length < 2) return value

  return `${parts[0]}, ${parts[parts.length - 1]}`
}

export interface CurrentWeather {
  city: string
  request_id?: number
  temperature: number
  feels_like: number
  humidity: number
  wind_speed: number
  description: string
  has_precipitation: boolean
  precipitation_probability?: number
  precipitation_type: string
  is_day_time: boolean
  icon: string
  recommendation_source?: string
  recommendation?: ClothingRecommendation
}

export interface HourlyForecast {
  datetime: string
  temperature: number
  phrase: string
  precipitation_probability: number
  has_precipitation: boolean
  is_daylight: boolean
  icon: string
}

export const useWeatherStore = defineStore('weather', () => {
  const city = ref(localStorage.getItem('weatherCity') || '')
  const suggestions = ref<CitySuggestion[]>([])
  const currentWeather = ref<CurrentWeather | null>(null)
  const hourlyForecast = ref<HourlyForecast[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  let abortController: AbortController | null = null

  const fetchCitySuggestions = async (query: string) => {
    if (abortController) {
      abortController.abort()
    }

    if (!query || query.length < 2) {
      suggestions.value = []
      error.value = null
      return
    }

    loading.value = true
    error.value = null
    suggestions.value = []

    abortController = new AbortController()

    try {
      const response = await apiClient.get('/weather/city-autocomplete/', {
        params: { q: query },
        signal: abortController.signal
      })

      suggestions.value = response.data
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Ошибка при загрузке городов';

      suggestions.value = []
    } finally {
      loading.value = false
      abortController = null
    }
  }

  const setCity = (cityName: string) => {
    city.value = cityName
    localStorage.setItem('weatherCity', cityName)

    clearSuggestions()
  }

  const clearCity = () => {
    console.trace('Trace clearCity')
    city.value = ''
    localStorage.removeItem('weatherCity')

    clearSuggestions()
    currentWeather.value = null
  }

  const clearSuggestions = () => {
    suggestions.value = []
    error.value = null
  }

  const fetchCurrentWeather = async () => {
    loading.value = true
    error.value = null

    try {
      const { data } = await apiClient.get<CurrentWeather>('/weather/current/', {
        params: { city: city.value }
      })

      currentWeather.value = {
        city: formatDisplayCity(data.city),
        temperature: data.temperature,
        feels_like: data.feels_like,
        humidity: data.humidity,
        wind_speed: data.wind_speed,
        description: data.description,
        icon: String(data.icon),
        precipitation_type: data.precipitation_type || 'sunny',
        precipitation_probability: data.precipitation_probability ?? 0,
        has_precipitation: data.has_precipitation ?? false,
        is_day_time: data.is_day_time,
        request_id: data.request_id,
        recommendation_source: data.recommendation_source,
        recommendation: data.recommendation
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Ошибка при загрузке прогноза погоды';

      throw error
    } finally {
      loading.value = false;
    }
  }

  const fetchHourlyForecast = async (hours: number = 12) => {
    loading.value = true
    error.value = null

    try {
      const { data } = await apiClient.get<HourlyForecast[]>('/weather/hourly/', {
        params: {
          city: city.value,
          hours: hours
        }
      })

      hourlyForecast.value = data

      hourlyForecast.value.forEach(item => {
        item.icon = item.icon.toString()
      })
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      error.value = axiosError.response?.data?.message || 'Ошибка при загрузке почасового прогноза';

      throw error
    } finally {
      loading.value = false;
    }
  }

  return {
    city,
    suggestions,
    currentWeather,
    hourlyForecast,
    loading,
    error,
    fetchCitySuggestions,
    setCity,
    clearCity,
    clearSuggestions,
    fetchCurrentWeather,
    fetchHourlyForecast
  }
})
