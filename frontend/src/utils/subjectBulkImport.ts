/**
 * Öğretmenlerin Excel / Notepad ile hazırlayabileceği basit iki sütunlu dosya formatı.
 * Ayraç: virgül, noktalı virgül veya sekme (TSV). İlk satır isteğe bağlı başlık: Ders, Konu
 */

export interface BulkImportRow {
    subject: string
    topic: string
}

function isLikelyHeaderRow(a: string, b: string): boolean {
    const x = a.trim().toLowerCase()
    const y = b.trim().toLowerCase()
    return (x === 'ders' && y === 'konu') || (x === 'subject' && y === 'topic')
}

function detectDelimiter(line: string): ',' | ';' | '\t' {
    if (line.includes('\t')) return '\t'
    const semi = (line.match(/;/g) || []).length
    const comma = (line.match(/,/g) || []).length
    return semi > comma ? ';' : ','
}

/** Tırnaklı alanları ve seçilen ayırıcıyı dikkate alır */
function splitCsvLine(line: string, delim: ',' | ';' | '\t'): string[] {
    const out: string[] = []
    let cur = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"') {
            inQuotes = !inQuotes
            continue
        }
        if (!inQuotes && c === delim) {
            out.push(cur.trim())
            cur = ''
            continue
        }
        cur += c
    }
    out.push(cur.trim())
    return out.map((s) => s.replace(/^"|"$/g, '').trim())
}

/**
 * Dosya metnini iki sütunlu ders–konu satırlarına çevirir.
 */
export function parseBulkImportText(raw: string): {
    rows: BulkImportRow[]
    errors: string[]
} {
    const errors: string[] = []
    const text = raw.replace(/^\uFEFF/, '').trim()
    if (!text) {
        errors.push('Dosya boş.')
        return { rows: [], errors }
    }

    const lines = text.split(/\r?\n/).map((l) => l.trimEnd()).filter((l) => l.length > 0)
    if (lines.length === 0) {
        errors.push('Okunacak satır yok.')
        return { rows: [], errors }
    }

    const delim = detectDelimiter(lines[0])
    const firstParts = splitCsvLine(lines[0], delim)
    let startIndex = 0
    if (firstParts.length >= 2 && isLikelyHeaderRow(firstParts[0], firstParts[1])) {
        startIndex = 1
    }

    const rows: BulkImportRow[] = []
    for (let i = startIndex; i < lines.length; i++) {
        const parts = splitCsvLine(lines[i], delim)
        if (parts.length < 2) {
            errors.push(`Satır ${i + 1}: En az iki sütun gerekli (Ders ve Konu).`)
            continue
        }
        const subject = parts[0]
        const joiner = delim === '\t' ? '\t' : delim === ';' ? ';' : ','
        const topic = parts.slice(1).join(joiner)
        if (!subject.trim() || !topic.trim()) {
            errors.push(`Satır ${i + 1}: Ders veya konu boş olamaz.`)
            continue
        }
        rows.push({ subject: subject.trim(), topic: topic.trim() })
    }

    if (rows.length === 0 && errors.length === 0) {
        errors.push('Geçerli veri satırı bulunamadı.')
    }

    return { rows, errors }
}

/** Excel’de Türkçe sütun başlıklarıyla örnek (UTF-8) */
export const BULK_IMPORT_TEMPLATE_CSV = `Ders,Konu
Matematik,Fonksiyonlar
Matematik,Türev
Fizik,Hareket ve Kuvvet
`

export function downloadBulkImportTemplate(): void {
    const blob = new Blob(['\uFEFF', BULK_IMPORT_TEMPLATE_CSV], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ders-konu-ornek.csv'
    a.click()
    URL.revokeObjectURL(url)
}
