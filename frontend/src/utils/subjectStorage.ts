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
 * Her ders için varsayılan konu adları (MEB müfredatına uygun örnek başlıklar).
 * İlk yüklemede localStorage'a yazılır; kullanıcı sonra düzenleyebilir.
 */
const DEFAULT_TOPIC_NAMES_BY_SUBJECT: Record<string, string[]> = {
    Matematik: [
        'Temel Kavramlar',
        'Sayılar',
        'Rasyonel ve İrrasyonel Sayılar',
        'Üslü ve Köklü İfadeler',
        'Çarpanlara Ayırma',
        'Oran ve Orantı',
        'Denklem ve Eşitsizlikler',
        'Mutlak Değer',
        'Fonksiyonlar',
        'İkinci Dereceden Denklemler',
        'Parabol',
        'Üçgenler',
        'Çokgenler ve Dörtgenler',
        'Çember ve Daire',
        'Analitik Geometri',
        'Trigonometri',
        'Diziler',
        'Limit ve Süreklilik',
        'Türev',
        'İntegral',
        'Olasılık',
        'İstatistik',
        'Veri Analizi',
        'Soru Çözümü',
    ],
    Türkçe: [
        'Sözcükte Anlam',
        'Cümlede Anlam',
        'Paragraf',
        'Anlatım Biçimleri',
        'Sözcük Türleri',
        'Cümle Türleri',
        'Yazım Kuralları',
        'Noktalama İşaretleri',
        'Anlatım Bozuklukları',
        'Söz Sanatları',
        'Şiir Bilgisi',
        'Metin Türleri',
        'Yazılı Anlatım',
        'Sözlü Anlatım',
        'Dinleme/İzleme',
        'Okuma Stratejileri',
        'Soru Çözümü',
    ],
    Fizik: [
        'Fizik Bilimine Giriş',
        'Madde ve Özellikleri',
        'Hareket ve Kuvvet',
        'İş, Güç, Enerji',
        'Basit Makineler',
        'Isı ve Sıcaklık',
        'Genleşme',
        'Elektrostatik',
        'Elektrik Akımı',
        'Manyetizma',
        'Basınç',
        'Kaldırma Kuvveti',
        'Dalgalar',
        'Optik',
        'Atom Modelleri',
        'Modern Fizik',
        'Soru Çözümü',
    ],
    Kimya: [
        'Kimya Bilimine Giriş',
        'Atom ve Periyodik Sistem',
        'Kimyasal Türler Arası Etkileşimler',
        'Maddenin Halleri',
        'Kimyasal Hesaplamalar',
        'Karışımlar',
        'Asitler, Bazlar ve Tuzlar',
        'Kimya ve Enerji',
        'Tepkimelerde Hız ve Denge',
        'Kimya ve Elektrik',
        'Karbon Kimyasına Giriş',
        'Organik Bileşikler',
        'Güncel Kimya Konuları',
        'Soru Çözümü',
    ],
    Biyoloji: [
        'Canlıların Ortak Özellikleri',
        'Hücre Bölünmeleri',
        'Kalıtım',
        'Ekosistem Ekolojisi',
        'Güncel Çevre Sorunları',
        'Canlıların Sınıflandırılması',
        'Hücre',
        'Canlıların Çeşitliliği',
        'Fotosentez ve Solunum',
        'İnsan Fizyolojisi',
        'Sinir ve Hormon Sistemleri',
        'Üreme ve Gelişim',
        'Komünite ve Popülasyon Ekolojisi',
        'Canlılar ve Çevre',
        'Soru Çözümü',
    ],
    Tarih: [
        'Tarih ve Zaman',
        'İnsanın İlk Dönemleri',
        'Orta Çağda Dünya',
        'Yerleşme ve Devletler',
        'Beylikten Devlete Osmanlı Siyaseti',
        'Sultan ve Osmanlı Merkez Teşkilatı',
        'Klasik Çağda Osmanlı Toplumu',
        'Değişen Dünya Dengeleri Karşısında Osmanlı',
        'Devrimler Çağında Değişen Devlet–Toplum İlişkileri',
        'Sermaye ve Emperyalizm',
        '20. Yüzyıl Başlarında Osmanlı Devleti',
        'Milli Mücadele',
        'Atatürkçülük ve Türkiye Cumhuriyeti',
        'İkinci Dünya Savaşı Sürecinde Türkiye ve Dünya',
        'Soğuk Savaş Dönemi',
        'Küreselleşen Dünya',
        'Soru Çözümü',
    ],
    Coğrafya: [
        'Doğal Sistemler',
        'İklim Bilgisi',
        'Yer Şekilleri',
        'Su Kaynakları',
        'Nüfus ve Yerleşme',
        'Ekonomik Faaliyetler',
        'Bölgeler ve Ülkeler',
        'Çevre ve Sürdürülebilirlik',
        'Harita Bilgisi',
        'Türkiye\'nin Coğrafi Konumu',
        'Türkiye\'nin İklimi',
        'Türkiye\'nin Yer Şekilleri',
        'Türkiye\'nin Ekonomisi',
        'Küresel Ortam',
        'Soru Çözümü',
    ],
    Edebiyat: [
        'Şiir Bilgisi',
        'Nazım Biçimleri',
        'Divan Edebiyatı',
        'Halk Edebiyatı',
        'Tanzimat Edebiyatı',
        'Servet-i Fünun ve Fecr-i Ati',
        'Milli Edebiyat Dönemi',
        'Cumhuriyet Dönemi Türk Şiiri',
        'Roman ve Hikâye',
        'Tiyatro',
        'Deneme ve Makale',
        'Anı ve Gezi Yazısı',
        'Masal ve Fabl',
        'Dünya Edebiyatından Seçmeler',
        'Soru Çözümü',
    ],
    İngilizce: [
        'Greetings and Introductions',
        'Daily Routines',
        'School Life',
        'Hobbies and Free Time',
        'Food and Drinks',
        'Health and Body',
        'Travel and Transportation',
        'Nature and Environment',
        'Technology and Media',
        'Past Experiences',
        'Future Plans',
        'Comparisons',
        'Modal Verbs',
        'Tenses (Present, Past, Future)',
        'Reading Comprehension',
        'Writing (Paragraph, E-mail)',
        'Soru Çözümü',
    ],
    Almanca: [
        'Begrüßung und Vorstellung',
        'Familie und Freunde',
        'Schule und Beruf',
        'Freizeit und Hobbys',
        'Essen und Trinken',
        'Gesundheit',
        'Reisen',
        'Grammatik: Artikel und Kasus',
        'Präsens und Perfekt',
        'Modalverben',
        'Adjektive und Steigerung',
        'Leseverstehen',
        'Hörverstehen',
        'Schriftlicher Ausdruck',
        'Soru Çözümü',
    ],
    Fransızca: [
        'Salutations et présentations',
        'La famille et les amis',
        'À l\'école',
        'Les loisirs',
        'La nourriture',
        'La santé',
        'Les voyages',
        'Grammaire: articles et pronoms',
        'Présent et passé composé',
        'Lecture',
        'Écoute',
        'Expression écrite',
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
        'Felsefe Tarihi (Antik Çağ)',
        'Felsefe Tarihi (Orta Çağ ve Rönesans)',
        'Felsefe Tarihi (Aydınlanma)',
        'Çağdaş Felsefe',
        'Mantık',
        'Psikoloji ve Felsefe',
        'Soru Çözümü',
    ],
    'Beden Eğitimi': [
        'Isınma ve Soğuma',
        'Koordinasyon ve Denge',
        'Atletizm',
        'Takım Sporları (Futbol, Basketbol)',
        'Voleybol',
        'Hentbol',
        'Badminton',
        'Cimnastik',
        'Sağlıklı Yaşam ve Beslenme',
        'İlk Yardım Temelleri',
        'Oyun ve Rekreasyon',
        'Fitness ve Kondisyon',
        'Soru Çözümü',
    ],
    Müzik: [
        'Müzik Teorisi (Nota, Ritim)',
        'Ses ve Perde',
        'Majör ve Minör',
        'Enstrüman Bilgisi',
        'Türk Müziği',
        'Batı Müziği Tarihi',
        'Çağdaş Müzik',
        'Müzik Dinletisi ve Eleştirisi',
        'Koro ve Orkestra',
        'Besteciler ve Eserler',
        'Soru Çözümü',
    ],
    Resim: [
        'Temel Çizim ve Tasarım',
        'Renk Bilgisi',
        'Perspektif',
        'Kompozisyon',
        'Sanat Tarihi (Ön Rönesans–Rönesans)',
        'Osmanlı ve Türk Resim Sanatı',
        'Çağdaş Sanat Akımları',
        'Heykel ve Seramik',
        'Grafik Tasarım',
        'Dijital Sanat',
        'Soru Çözümü',
    ],
    Bilgisayar: [
        'Bilgisayarın Temelleri',
        'İşletim Sistemleri',
        'İnternet ve Ağ Güvenliği',
        'Ofis Programları',
        'Algoritma ve Akış Diyagramları',
        'Programlamaya Giriş',
        'Veri Yapılarına Giriş',
        'Web Tasarımı (HTML/CSS)',
        'Veritabanı Temelleri',
        'Yapay Zekâ ve Etik',
        'Siber Güvenlik',
        'Soru Çözümü',
    ],
    'Din Kültürü': [
        'İslam ve İbadet',
        'İman Esasları',
        'İbadetler (Namaz, Oruç, Zekât, Hac)',
        'Hz. Muhammed\'in Hayatı',
        'Kur\'an-ı Kerim ve Temel Kavramlar',
        'Ahlak ve Erdem',
        'Vatandaşlık ve Hoşgörü',
        'Dünya Dinleri',
        'İslam Düşüncesinde Yorumlar',
        'Güncel Dini Meseleler',
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
