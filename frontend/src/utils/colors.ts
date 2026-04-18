import type { Subject } from '../types'
import { loadSubjectColors } from './subjectStorage'

export const SUBJECT_PALETTE_COLORS = [
    '#e57373', // red
    '#f06292', // pink
    '#ce93d8', // purple
    '#7986cb', // indigo
    '#64b5f6', // blue
    '#4fc3f7', // light blue
    '#4dd0e1', // cyan
    '#4db6ac', // teal
    '#81c784', // green
    '#aed581', // lime
    '#ffb74d', // orange
    '#ff8a65', // deep orange
    '#ff7043', // deep orange dark
    '#a1887f', // brown
    '#90a4ae', // blue grey
    '#ffd54f', // amber
    '#26a69a', // teal dark
    '#ec407a', // pink dark
]

export const getSubjectColor = (subject: Subject | string, subjects: (Subject | string)[]): string => {
    const custom = loadSubjectColors()[subject]
    if (custom) return custom
    const index = subjects.indexOf(subject)
    if (index === -1) return SUBJECT_PALETTE_COLORS[0]
    return SUBJECT_PALETTE_COLORS[index % SUBJECT_PALETTE_COLORS.length]
}

export interface DragData {
    subjectName: string
    topicId?: string
    color: string
}
