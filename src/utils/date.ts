export function formatTime(
  isoString: string,
  options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' },
  locale: string = 'ru-RU'
): string {
  const date = new Date(isoString)

  if (isNaN(date.getTime())) {
    console.warn('Invalid date string:', isoString)
    return ''
  }

  return date.toLocaleTimeString(locale, options)
}

export function getHours(isoString: string): number {
  const date = new Date(isoString)

  return isNaN(date.getTime()) ? 0 : date.getHours()
}

export function getMinutes(isoString: string): number {
  const date = new Date(isoString)
  
  return isNaN(date.getTime()) ? 0 : date.getMinutes()
}

export function formatTime24(isoString: string): string {
  return formatTime(isoString, { hour: '2-digit', minute: '2-digit' }, 'ru-RU')
}