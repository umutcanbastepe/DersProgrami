// Ders tipi (string olarak kullanılacak)
export type Subject = string

// Haftanın günleri
export const DAYS = [

    'Pazartesi',
    'Salı',
    'Çarşamba',
    'Perşembe',
    'Cuma',
    'Cumartesi',
    'Pazar',
] as const

export type Day = (typeof DAYS)[number]

/**
 * Saat aralığı oluşturur (08:00 - 24:00 arası, 1 saatlik aralıklarla)
 * @param startHour Başlangıç saati (8)
 * @param endHour Bitiş saati (24)
 */
export function generateTimeSlots(
    startHour: number = 8,
    endHour: number = 24
): TimeSlot[] {
    const slots: TimeSlot[] = []

    for (let hour = startHour; hour < endHour; hour++) {
        const startTime = `${hour.toString().padStart(2, '0')}:00`
        const nextHour = hour + 1
        const endTime = nextHour === 24
            ? '00:00'
            : `${nextHour.toString().padStart(2, '0')}:00`

        slots.push({
            start: startTime,
            end: endTime,
        })
    }

    return slots
}

// Ders saati (örn: 08:00-08:40)
export interface TimeSlot {
    start: string // "08:00"
    end: string // "08:40"
}

// Konu bilgisi
export interface Topic {
    id: string
    name: string
    subject: Subject
}

// Ders-Konu eşleştirmesi (her ders için konular)
export interface SubjectTopics {
    [subject: string]: Topic[] // subject -> topics array
}

// Ders bilgisi
export interface Lesson {
    id: string
    subject: Subject
    topicId?: string // Konu ID'si
    teacher?: string
    classroom?: string
    note?: string
    color?: string
}

// Haftalık program girişi (gün + saat + ders)
export interface TimetableEntry {
    day: Day
    timeSlot: TimeSlot
    lesson: Lesson | null
}

// Haftalık program verisi
export interface TimetableData {
    weekStart: string // ISO date string
    entries: TimetableEntry[]
}


