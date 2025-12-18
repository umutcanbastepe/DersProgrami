import type { TimetableData } from '../types'

const STORAGE_KEY = 'timetable-data'
const STORAGE_KEY_STUDENT_NAME = 'student-name'

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

export const saveStudentName = (name: string): void => {
    try {
        localStorage.setItem(STORAGE_KEY_STUDENT_NAME, name)
    } catch (error) {
        console.error('Failed to save student name:', error)
    }
}

export const loadStudentName = (): string => {
    try {
        return localStorage.getItem(STORAGE_KEY_STUDENT_NAME) || ''
    } catch (error) {
        console.error('Failed to load student name:', error)
        return ''
    }
}

