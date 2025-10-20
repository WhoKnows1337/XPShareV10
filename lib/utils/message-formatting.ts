import { formatDistanceToNow, isToday, isYesterday, format } from 'date-fns'
import { de, enUS, fr, es } from 'date-fns/locale'

/**
 * Message Formatting Utilities
 * Provides timestamp formatting and message grouping logic
 */

const locales = {
  de,
  en: enUS,
  fr,
  es,
}

export function getRelativeTimestamp(
  timestamp: string | Date,
  locale: string = 'en'
): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
  const localeObj = locales[locale as keyof typeof locales] || enUS

  // For today: "2m ago", "Just now"
  if (isToday(date)) {
    const distance = formatDistanceToNow(date, {
      addSuffix: true,
      locale: localeObj,
    })
    // "less than a minute ago" → "Just now"
    if (distance.includes('less than')) {
      return 'Just now'
    }
    return distance
  }

  // For yesterday: "Yesterday at 14:30"
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'HH:mm')}`
  }

  // For this week: "Monday at 14:30"
  const daysDiff = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  )
  if (daysDiff < 7) {
    return format(date, 'EEEE \'at\' HH:mm', { locale: localeObj })
  }

  // For older: "Jan 15, 2025"
  return format(date, 'MMM d, yyyy', { locale: localeObj })
}

export function shouldShowDateSeparator(
  currentDate: Date | string,
  previousDate?: Date | string
): boolean {
  if (!previousDate) return true

  const current = typeof currentDate === 'string' ? new Date(currentDate) : currentDate
  const previous = typeof previousDate === 'string' ? new Date(previousDate) : previousDate

  // Show separator if different day
  return (
    current.getDate() !== previous.getDate() ||
    current.getMonth() !== previous.getMonth() ||
    current.getFullYear() !== previous.getFullYear()
  )
}

export function getDateSeparatorText(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const localeObj = locales[locale as keyof typeof locales] || enUS

  if (isToday(d)) {
    return 'Today'
  }

  if (isYesterday(d)) {
    return 'Yesterday'
  }

  // Within last week: "Monday, Jan 15"
  const daysDiff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (daysDiff < 7) {
    return format(d, 'EEEE, MMM d', { locale: localeObj })
  }

  // Older: "January 15, 2025"
  return format(d, 'MMMM d, yyyy', { locale: localeObj })
}

/**
 * Determines if a message should be grouped with the previous message
 * Messages are grouped if:
 * - They are from the same sender (role)
 * - They are within 2 minutes of each other
 */
export function isMessageGrouped(
  currentMessage: { role: string; createdAt?: string | Date },
  previousMessage?: { role: string; createdAt?: string | Date }
): boolean {
  if (!previousMessage) return false
  if (currentMessage.role !== previousMessage.role) return false

  const currentTime = currentMessage.createdAt
    ? new Date(currentMessage.createdAt).getTime()
    : Date.now()
  const previousTime = previousMessage.createdAt
    ? new Date(previousMessage.createdAt).getTime()
    : Date.now()

  const timeDiff = currentTime - previousTime
  const TWO_MINUTES = 2 * 60 * 1000

  return timeDiff < TWO_MINUTES
}
