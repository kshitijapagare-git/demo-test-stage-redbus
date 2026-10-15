export const TODAY_OFFSET = 0
export const TOMORROW_OFFSET = 1

export interface DayOption {
  offset: number
  label: string
}

export const DAY_OPTIONS: DayOption[] = [
  { offset: TODAY_OFFSET, label: 'Today' },
  { offset: TOMORROW_OFFSET, label: 'Tomorrow' },
]

export interface JourneyDay {
  date: Date
  label: string
}

export function getJourneyDay(today: Date, offset: number): JourneyDay {
  const option = DAY_OPTIONS.find((dayOption) => dayOption.offset === offset)
  return { date: addDays(today, offset), label: option?.label ?? '' }
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(date.getDate() + days)
  return result
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })
  const year = date.getFullYear()

  return `${day} ${month}, ${year}`
}

export function toISODate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const [, yearText, monthText, dayText] = match
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)

  const date = new Date(year, month - 1, day)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null
  }

  return date
}

export function isBeforeToday(date: Date, today: Date): boolean {
  return toDateKey(date) < toDateKey(today)
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}

function toDateKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate()
}

export function formatShortDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0')
  const month = date.toLocaleString('en-US', { month: 'short' })

  return `${day} ${month}`
}
