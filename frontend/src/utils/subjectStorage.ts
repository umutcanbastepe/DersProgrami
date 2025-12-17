import type { SubjectTopics, Topic, Subject } from '../types'

const STORAGE_KEY_TOPICS = 'subject-topics'
const STORAGE_KEY_SUBJECTS = 'subjects'

// Varsayılan dersler
const DEFAULT_SUBJECTS: Subject[] = [
    'Matematik',
    'Türkçe',
    'Fizik',
    'Kimya',
    'Biyoloji',
    'Tarih',
    'Coğrafya',
    'Edebiyat',
    'İngilizce',
    'Almanca',
    'Fransızca',
    'Felsefe',
    'Beden Eğitimi',
    'Müzik',
    'Resim',
    'Bilgisayar',
    'Din Kültürü',
]

/**
 * Tüm dersleri yükle
 */
export const loadSubjects = (): Subject[] => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_SUBJECTS)
        if (!stored) {
            // İlk yüklemede varsayılan dersleri kaydet
            saveSubjects(DEFAULT_SUBJECTS)
            return DEFAULT_SUBJECTS
        }
        return JSON.parse(stored) as Subject[]
    } catch (error) {
        console.error('Failed to load subjects:', error)
        return DEFAULT_SUBJECTS
    }
}

/**
 * Tüm dersleri kaydet
 */
export const saveSubjects = (subjects: Subject[]): void => {
    try {
        localStorage.setItem(STORAGE_KEY_SUBJECTS, JSON.stringify(subjects))
    } catch (error) {
        console.error('Failed to save subjects:', error)
    }
}

/**
 * Yeni ders ekle
 */
export const addSubject = (subjectName: string): Subject | null => {
    const subjects = loadSubjects()

    // Aynı isimde ders var mı kontrol et
    if (subjects.includes(subjectName as Subject)) {
        return null
    }

    const newSubject = subjectName.trim() as Subject
    subjects.push(newSubject)
    saveSubjects(subjects)
    return newSubject
}

/**
 * Ders sil (ve o derse ait tüm konuları da sil)
 */
export const deleteSubject = (subject: Subject): boolean => {
    const subjects = loadSubjects()
    const index = subjects.indexOf(subject)

    if (index === -1) return false

    // Dersi listeden çıkar
    subjects.splice(index, 1)
    saveSubjects(subjects)

    // O derse ait tüm konuları sil
    const allTopics = loadSubjectTopics()
    delete allTopics[subject]
    saveSubjectTopics(allTopics)

    return true
}

/**
 * Ders adını güncelle
 */
export const updateSubject = (oldSubject: Subject, newSubjectName: string): boolean => {
    const subjects = loadSubjects()
    const index = subjects.indexOf(oldSubject)

    if (index === -1) return false

    const newSubject = newSubjectName.trim() as Subject

    // Yeni isim zaten var mı kontrol et
    if (subjects.includes(newSubject) && newSubject !== oldSubject) {
        return false
    }

    // Ders adını güncelle
    subjects[index] = newSubject
    saveSubjects(subjects)

    // Konuları da güncelle
    const allTopics = loadSubjectTopics()
    if (allTopics[oldSubject]) {
        // Eski ders adındaki konuları yeni ders adına taşı
        allTopics[newSubject] = allTopics[oldSubject].map(topic => ({
            ...topic,
            subject: newSubject,
        }))
        delete allTopics[oldSubject]
        saveSubjectTopics(allTopics)
    }

    return true
}

/**
 * Tüm ders konularını yükle
 */
export const loadSubjectTopics = (): SubjectTopics => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_TOPICS)
        if (!stored) return {}
        return JSON.parse(stored) as SubjectTopics
    } catch (error) {
        console.error('Failed to load subject topics:', error)
        return {}
    }
}

/**
 * Tüm ders konularını kaydet
 */
export const saveSubjectTopics = (topics: SubjectTopics): void => {
    try {
        localStorage.setItem(STORAGE_KEY_TOPICS, JSON.stringify(topics))
    } catch (error) {
        console.error('Failed to save subject topics:', error)
    }
}

/**
 * Belirli bir dersin konularını al
 */
export const getTopicsBySubject = (subject: Subject): Topic[] => {
    const allTopics = loadSubjectTopics()
    return allTopics[subject] || []
}

/**
 * Bir derse konu ekle
 */
export const addTopicToSubject = (subject: Subject, topicName: string): Topic => {
    const allTopics = loadSubjectTopics()
    const newTopic: Topic = {
        id: crypto.randomUUID(),
        name: topicName,
        subject,
    }

    if (!allTopics[subject]) {
        allTopics[subject] = []
    }

    allTopics[subject].push(newTopic)
    saveSubjectTopics(allTopics)
    return newTopic
}

/**
 * Bir konuyu güncelle
 */
export const updateTopic = (topicId: string, newName: string): boolean => {
    const allTopics = loadSubjectTopics()

    for (const subject in allTopics) {
        const topicIndex = allTopics[subject].findIndex((t) => t.id === topicId)
        if (topicIndex !== -1) {
            allTopics[subject][topicIndex].name = newName
            saveSubjectTopics(allTopics)
            return true
        }
    }

    return false
}

/**
 * Bir konuyu sil
 */
export const deleteTopic = (topicId: string): boolean => {
    const allTopics = loadSubjectTopics()

    for (const subject in allTopics) {
        const topicIndex = allTopics[subject].findIndex((t) => t.id === topicId)
        if (topicIndex !== -1) {
            allTopics[subject].splice(topicIndex, 1)
            saveSubjectTopics(allTopics)
            return true
        }
    }

    return false
}

/**
 * Bir konuyu ID ile bul
 */
export const getTopicById = (topicId: string): Topic | null => {
    const allTopics = loadSubjectTopics()

    for (const subject in allTopics) {
        const topic = allTopics[subject].find((t) => t.id === topicId)
        if (topic) return topic
    }

    return null
}
