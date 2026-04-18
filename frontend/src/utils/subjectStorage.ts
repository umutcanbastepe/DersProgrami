import type { SubjectTopics, Topic, Subject } from '../types'

const STORAGE_KEY_TOPICS = 'subject-topics'
const STORAGE_KEY_SUBJECTS = 'subjects'
const STORAGE_KEY_SUBJECT_COLORS = 'subject-colors'

export const loadSubjectColors = (): Record<string, string> => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY_SUBJECT_COLORS)
        if (!raw) return {}
        return JSON.parse(raw) as Record<string, string>
    } catch {
        return {}
    }
}

const saveSubjectColors = (colors: Record<string, string>): void => {
    try {
        localStorage.setItem(STORAGE_KEY_SUBJECT_COLORS, JSON.stringify(colors))
    } catch (error) {
        console.error('Failed to save subject colors:', error)
    }
}

/** Kullanıcı tanımlı ders rengi (palet ve sürükle-bırak için). */
export const setSubjectColor = (subject: string, color: string): void => {
    const map = loadSubjectColors()
    map[subject] = color
    saveSubjectColors(map)
}

/**
 * Türkiye Yüzyılı Maarif Modeli — ortaöğretim (lise) çerçevesinde yaygın ders adları.
 * Konu başlıkları ünite/tema düzeyinde; öğretim programındaki yapıya yaklaştırılmıştır.
 * İlk yüklemede localStorage'a yazılır; kullanıcı sonra düzenleyebilir.
 */
const DEFAULT_SUBJECTS: Subject[] = [
    'Türk Dili ve Edebiyatı',
    'Matematik',
    'Fizik',
    'Kimya',
    'Biyoloji',
    'Tarih',
    'Coğrafya',
    'T.C. İnkılap Tarihi ve Atatürkçülük',
    'Felsefe',
    'Din Kültürü ve Ahlak Bilgisi',
    'İngilizce',
    'Almanca',
]

const DEFAULT_TOPIC_NAMES_BY_SUBJECT: Record<string, string[]> = {
    'Türk Dili ve Edebiyatı': [
        'Dil ve İletişim',
        'Sözcükte ve Cümlede Anlam',
        'Paragraf',
        'Anlatım Türleri',
        'Yazım ve Noktalama',
        'Şiir Bilgisi ve Nazım Biçimleri',
        'Halk Edebiyatı',
        'Divan Edebiyatı',
        'Tanzimat ve Servet-i Fünûn',
        'Milli Edebiyat ve Cumhuriyet Dönemi',
        'Roman ve Hikâye',
        'Tiyatro',
        'Deneme ve Öykü',
        'Dünya Edebiyatından Seçmeler',
        'Sözlü ve Yazılı Anlatım',
        'Soru Çözümü',
    ],
    Matematik: [
        'Sayılar ve Temsiller',
        'Temel Kavramlar ve Cebirsel İfadeler',
        'Üslü ve Köklü İfadeler',
        'Denklem ve Eşitsizlikler',
        'Fonksiyonlar',
        'Üçgenler ve Çokgenler',
        'Çember ve Daire',
        'Analitik Geometri',
        'Trigonometri',
        'Diziler',
        'Limit ve Süreklilik',
        'Türev',
        'İntegral',
        'Olasılık ve İstatistik',
        'Veri ve Modelleme',
        'Soru Çözümü',
    ],
    Fizik: [
        'Fizik Bilimine Giriş ve Ölçme',
        'Madde ve Özellikleri',
        'Hareket ve Kuvvet',
        'İş, Enerji ve Güç',
        'Basit Makineler',
        'Isı ve Sıcaklık',
        'Elektrostatik ve Elektrik Akımı',
        'Manyetizma ve Elektromanyetizma',
        'Basınç ve Kaldırma Kuvveti',
        'Dalgalar',
        'Optik',
        'Atom ve Modern Fizik',
        'Soru Çözümü',
    ],
    Kimya: [
        'Kimya Bilimine Giriş',
        'Atom ve Periyodik Sistem',
        'Kimyasal Türler Arası Etkileşimler',
        'Maddenin Halleri',
        'Kimyasal Hesaplamalar',
        'Karışımlar ve Çözünmeler',
        'Asitler, Bazlar ve Tuzlar',
        'Kimya ve Enerji',
        'Tepkimelerde Hız ve Denge',
        'Kimya ve Elektrik',
        'Karbon Kimyası ve Organik Bileşikler',
        'Güncel Kimya Uygulamaları',
        'Soru Çözümü',
    ],
    Biyoloji: [
        'Canlıların Ortak Özellikleri',
        'Hücre ve Bölünmeler',
        'Kalıtım ve Evrim',
        'Ekosistem Ekolojisi',
        'Canlıların Sınıflandırılması ve Çeşitliliği',
        'Fotosentez ve Solunum',
        'İnsan Fizyolojisi',
        'Sinir ve Endokrin Sistemleri',
        'Üreme ve Gelişim',
        'Popülasyon ve Komünite Ekolojisi',
        'Çevre ve Biyoteknoloji',
        'Soru Çözümü',
    ],
    Tarih: [
        'Tarih Bilimi',
        'İlk Çağ Uygarlıkları',
        'İslam Tarihi ve Türkler',
        'Yerleşme ve Devletler',
        'Osmanlı Beylikten İmparatorluğa',
        'Değişen Dünya Dengeleri ve Osmanlı',
        'Sermaye ve Emperyalizm',
        '20. Yüzyıl Başlarında Osmanlı',
        'Milli Mücadele',
        'Atatürk Dönemi ve Türkiye Cumhuriyeti',
        'İkinci Dünya Savaşı ve Soğuk Savaş',
        'Küreselleşen Dünya',
        'Soru Çözümü',
    ],
    Coğrafya: [
        'Coğrafya Bilimi ve Doğal Sistemler',
        'İklim ve Yer Şekilleri',
        'İç ve Dış Kuvvetler',
        'Su Kaynakları',
        'Nüfus ve Yerleşme',
        'Ekonomik Faaliyetler',
        'Türkiye\'nin Fiziki Coğrafyası',
        'Türkiye\'nin Beşeri ve Ekonomik Coğrafyası',
        'Çevre ve Sürdürülebilirlik',
        'Küresel Ortam ve Bölgeler',
        'Harita ve Veri Okuma',
        'Soru Çözümü',
    ],
    'T.C. İnkılap Tarihi ve Atatürkçülük': [
        'Osmanlı Devleti\'nin Son Dönemi',
        'Mondros Ateşkesi ve İşgaller',
        'Milli Mücadele Dönemi',
        'Atatürk İlke ve İnkılapları',
        'Atatürk Dönemi Türk Dış Politikası',
        'İnönü Dönemi ve İkinci Dünya Savaşı',
        'Çok Partili Hayata Geçiş',
        'Atatürkçülük ve Türkiye Cumhuriyeti\'nin Temel İlkeleri',
        'Güncel Türkiye ve Dünya',
        'Soru Çözümü',
    ],
    Felsefe: [
        'Felsefeye Giriş',
        'Bilgi Felsefesi',
        'Varlık Felsefesi',
        'Ahlak Felsefesi',
        'Siyaset Felsefesi',
        'Din Felsefesi',
        'Sanat Felsefesi',
        'Bilim Felsefesi',
        'Felsefe Tarihi',
        'Mantık',
        'Psikoloji ve Sosyolojiye Giriş',
        'Soru Çözümü',
    ],
    'Din Kültürü ve Ahlak Bilgisi': [
        'İlahiyat Bilimine Giriş',
        'İman Esasları',
        'İbadet',
        'Kur\'an-ı Kerim ve Temel Kavramlar',
        'Hz. Muhammed\'in Hayatı',
        'Ahlak ve Erdem',
        'İslam Düşüncesi ve Yorumlar',
        'Dünya Dinleri',
        'Güncel Dini ve Ahlaki Meseleler',
        'Hoşgörü ve Vatandaşlık',
        'Soru Çözümü',
    ],
    İngilizce: [
        'Communication and Interaction',
        'School and Daily Life',
        'Past and Future Experiences',
        'Science, Technology and Innovation',
        'Environment and Sustainability',
        'Global Issues and Culture',
        'Reading Comprehension Strategies',
        'Listening and Note-taking',
        'Writing (Paragraph, Essay, E-mail)',
        'Speaking and Presentation',
        'Grammar in Context',
        'Soru Çözümü',
    ],
    Almanca: [
        'Kommunikation und Alltag',
        'Schule, Beruf und Zukunft',
        'Familie, Freunde und Gesundheit',
        'Reisen und Freizeit',
        'Grammatik: Artikel, Kasus, Zeitformen',
        'Modalverben und Nebensätze',
        'Leseverstehen',
        'Hörverstehen',
        'Mündliche und schriftliche Produktion',
        'Kultur und Länderkunde',
        'Soru Çözümü',
    ],
}

function buildDefaultSubjectTopics(): SubjectTopics {
    const result: SubjectTopics = {}
    for (const subject of DEFAULT_SUBJECTS) {
        const names = DEFAULT_TOPIC_NAMES_BY_SUBJECT[subject] ?? []
        result[subject] = names.map((name) => ({
            id: crypto.randomUUID(),
            name,
            subject,
        }))
    }
    return result
}

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

    const colors = loadSubjectColors()
    if (colors[subject] !== undefined) {
        delete colors[subject]
        saveSubjectColors(colors)
    }

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

    const colors = loadSubjectColors()
    if (colors[oldSubject] !== undefined) {
        colors[newSubject] = colors[oldSubject]
        delete colors[oldSubject]
        saveSubjectColors(colors)
    }

    return true
}

/**
 * Tüm ders konularını yükle
 */
export const loadSubjectTopics = (): SubjectTopics => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY_TOPICS)
        if (!stored) {
            const defaults = buildDefaultSubjectTopics()
            saveSubjectTopics(defaults)
            return defaults
        }
        const parsed = JSON.parse(stored) as SubjectTopics
        // Eski kurulumlar: boş obje ise varsayılanları yaz
        if (Object.keys(parsed).length === 0) {
            const defaults = buildDefaultSubjectTopics()
            saveSubjectTopics(defaults)
            return defaults
        }
        return parsed
    } catch (error) {
        console.error('Failed to load subject topics:', error)
        const defaults = buildDefaultSubjectTopics()
        saveSubjectTopics(defaults)
        return defaults
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

export interface BulkImportSubjectsResult {
    addedSubjects: number
    addedTopics: number
    skippedDuplicateTopics: number
    skippedEmptyRows: number
}

/**
 * CSV/TSV’den gelen satırları işler: yeni dersleri ekler, mevcut derslere konu ekler (aynı isimli konuyu atlar).
 */
export function bulkImportSubjectsAndTopics(
    rows: Array<{ subject: string; topic: string }>
): BulkImportSubjectsResult {
    let addedSubjects = 0
    let addedTopics = 0
    let skippedDuplicateTopics = 0
    let skippedEmptyRows = 0

    for (const { subject: rawS, topic: rawT } of rows) {
        const subject = rawS.trim()
        const topic = rawT.trim()
        if (!subject || !topic) {
            skippedEmptyRows++
            continue
        }

        if (!loadSubjects().includes(subject as Subject)) {
            const created = addSubject(subject)
            if (created) addedSubjects++
        }

        const existing = getTopicsBySubject(subject as Subject)
        if (existing.some((t) => t.name.trim().toLowerCase() === topic.toLowerCase())) {
            skippedDuplicateTopics++
            continue
        }
        addTopicToSubject(subject as Subject, topic)
        addedTopics++
    }

    return {
        addedSubjects,
        addedTopics,
        skippedDuplicateTopics,
        skippedEmptyRows,
    }
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
