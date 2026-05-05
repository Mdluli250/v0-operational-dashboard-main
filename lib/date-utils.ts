/**
 * Format date to European DD/MM/YYYY format
 */
export function formatDateEuropean(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * Format date and time to European DD/MM/YYYY, HH:MM:SS format
 */
export function formatDateTimeEuropean(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const dateStr = formatDateEuropean(d)
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  return `${dateStr}, ${hours}:${minutes}:${seconds}`
}
