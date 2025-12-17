/**
 * Haftanın başlangıç tarihini (Pazar) hesaplar
 */
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay() // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
  const diff = d.getDate() - day // Pazar gününe ayarla
  return new Date(d.setDate(diff))
}

/**
 * Tarihi ISO string formatına çevirir (YYYY-MM-DD)
 */
export const toISODateString = (date: Date): string => {
  return date.toISOString().split('T')[0]
}

/**
 * ISO string'den Date objesi oluşturur
 */
export const fromISODateString = (isoString: string): Date => {
  return new Date(isoString + 'T00:00:00')
}

/**
 * Haftanın günlerini tarihleriyle birlikte döndürür
 */
export const getWeekDays = (weekStart: Date): Array<{ day: string; date: Date }> => {
  const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
  return days.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return { day, date }
  })
}


