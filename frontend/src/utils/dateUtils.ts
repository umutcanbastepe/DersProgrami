/**
 * Haftanın başlangıç tarihini (Pazartesi) hesaplar
 */
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date)
  const day = d.getDay() // 0 = Pazar, 1 = Pazartesi, ..., 6 = Cumartesi
  // Pazartesi'ye ayarla: Pazar (0) ise -6, Pazartesi (1) ise 0, Salı (2) ise -1, vb.
  const diff = day === 0 ? -6 : 1 - day
  const newDate = new Date(d)
  newDate.setDate(d.getDate() + diff)
  return newDate
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
 * Haftanın günlerini tarihleriyle birlikte döndürür (Pazartesi'den Pazar'a)
 */
export const getWeekDays = (weekStart: Date): Array<{ day: string; date: Date }> => {
  const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
  return days.map((day, index) => {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + index)
    return { day, date }
  })
}


