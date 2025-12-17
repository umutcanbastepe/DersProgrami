import type { TimetableData } from '../types'

const STORAGE_KEY = 'timetable-data'

export const saveTimetable = (data: TimetableData): void => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
        console.error('Failed to save timetable:', error)
    }
}

export const loadTimetable = (): TimetableData | null => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (!stored) return null
        return JSON.parse(stored) as TimetableData
    } catch (error) {
        console.error('Failed to load timetable:', error)
        return null
    }
}

