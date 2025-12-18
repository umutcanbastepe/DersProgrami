import { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Print,
  Save,
  Delete,
} from '@mui/icons-material'
import { DAYS, type Day, type Subject, type TimetableData, type Lesson, type TimeSlot, generateTimeSlots } from '../types'
import { getWeekStart, toISODateString, fromISODateString, getWeekDays } from '../utils/dateUtils'
import { saveTimetable, loadTimetable } from '../utils/storage'
import { loadSubjects, getTopicById } from '../utils/subjectStorage'
import { LessonEditDialog } from '../components/LessonEditDialog'
import { StudentNameDialog } from '../components/StudentNameDialog'
import { useNotification } from '../contexts/NotificationContext'

// Varsayılan ders saatleri (08:00 - 24:00 arası, saatlik aralıklarla)
const DEFAULT_TIME_SLOTS: TimeSlot[] = generateTimeSlots(8, 24)

// Tema ile uyumlu default renk (primary.main: rgb(170, 180, 240))
const DEFAULT_COLOR = '#aab4f0'

export const TimetablePage = () => {
  const { showNotification } = useNotification()
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart())
  const [timeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS)
  const [timetable, setTimetable] = useState<Map<string, Lesson | null>>(new Map())
  const [editingCell, setEditingCell] = useState<{ day: Day; timeSlot: TimeSlot } | null>(null)
  const [editForm, setEditForm] = useState<Partial<Lesson>>({})
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentNameDialogOpen, setStudentNameDialogOpen] = useState(false)

  // Yükleme - Sayfa açıldığında kaydedilmiş çalışmayı yükle
  useEffect(() => {
    const saved = loadTimetable()
    if (saved) {
      setWeekStart(fromISODateString(saved.weekStart))
      const map = new Map<string, Lesson | null>()
      saved.entries.forEach((entry) => {
        const key = `${entry.day}-${entry.timeSlot.start}`
        map.set(key, entry.lesson)
      })
      setTimetable(map)
    }
    // Dersleri yükle
    setSubjects(loadSubjects())
  }, [])

  // Dersler değiştiğinde güncelle
  useEffect(() => {
    const handleSubjectsChange = () => {
      setSubjects(loadSubjects())
    }
    window.addEventListener('subjects-changed', handleSubjectsChange)
    return () => {
      window.removeEventListener('subjects-changed', handleSubjectsChange)
    }
  }, [])

  // Manuel kaydetme fonksiyonu
  const handleManualSave = () => {
    const data: TimetableData = {
      weekStart: toISODateString(weekStart),
      entries: DAYS.flatMap((day) =>
        timeSlots.map((timeSlot) => ({
          day,
          timeSlot,
          lesson: timetable.get(`${day}-${timeSlot.start}`) || null,
        }))
      ),
    }
    saveTimetable(data)
    // Kullanıcıya bilgi ver
    showNotification('Çalışma başarıyla kaydedildi!', 'success')
  }

  // Çalışmayı silme fonksiyonu
  const handleClearWork = () => {
    setTimetable(new Map())
    setWeekStart(getWeekStart())
    // localStorage'dan da sil
    localStorage.removeItem('timetable-data')
    setDeleteConfirmOpen(false)
    showNotification('Çalışma başarıyla silindi!', 'success')
  }

  const handleCellClick = (day: Day, timeSlot: TimeSlot) => {
    const key = `${day}-${timeSlot.start}`
    const existing = timetable.get(key)
    setEditingCell({ day, timeSlot })
    setEditForm({
      id: existing?.id || crypto.randomUUID(),
      subject: existing?.subject || undefined,
      topicId: existing?.topicId || '',
      note: existing?.note || '',
      color: existing?.color || DEFAULT_COLOR,
    })
  }

  const handleSaveLesson = (lessonData: Partial<Lesson>) => {
    if (!editingCell || !lessonData.subject) return

    const key = `${editingCell.day}-${editingCell.timeSlot.start}`
    const lesson: Lesson = {
      id: lessonData.id!,
      subject: lessonData.subject as Subject,
      topicId: lessonData.topicId || undefined,
      note: lessonData.note,
      color: lessonData.color || DEFAULT_COLOR,
    }

    setTimetable((prev) => new Map(prev).set(key, lesson))
    setEditingCell(null)
    setEditForm({})
  }

  const handleDeleteLesson = () => {
    if (!editingCell) return
    const key = `${editingCell.day}-${editingCell.timeSlot.start}`
    setTimetable((prev) => {
      const next = new Map(prev)
      next.delete(key)
      return next
    })
    setEditingCell(null)
    setEditForm({})
  }

  const handlePreviousWeek = () => {
    setWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() - 7)
      return newDate
    })
  }

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const newDate = new Date(prev)
      newDate.setDate(newDate.getDate() + 7)
      return newDate
    })
  }

  const weekDays = getWeekDays(weekStart)

  // Dosya adını formatla: "13-19aralık_umut_calisma_programi.pdf"
  const formatFileName = (studentName: string): string => {
    const startDate = weekDays[0].date
    const endDate = weekDays[weekDays.length - 1].date

    const startDay = startDate.getDate()
    const endDay = endDate.getDate()
    const monthName = startDate.toLocaleDateString('tr-TR', { month: 'long' })

    // Türkçe karakterleri düzelt (ö -> o, ş -> s, ç -> c, ğ -> g, ü -> u, ı -> i)
    const normalize = (str: string) =>
      str
        .toLowerCase()
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ı/g, 'i')
        .replace(/[^a-z0-9]/g, '')

    const normalizedMonth = normalize(monthName)
    const normalizedStudentName = normalize(studentName)

    return `${startDay}-${endDay}${normalizedMonth}_${normalizedStudentName}_calisma_programi.pdf`
  }

  const handlePrint = () => {
    setStudentNameDialogOpen(true)
  }

  const handleStudentNameConfirm = async (studentName: string) => {
    setStudentNameDialogOpen(false)

    try {
      // Electron API kontrolü
      if (typeof window !== 'undefined' && window.electronAPI) {
        const fileName = formatFileName(studentName)
        const result = await window.electronAPI.printToPDF(fileName)

        if (result.success) {
          showNotification(`PDF başarıyla kaydedildi: ${fileName}`, 'success')
        } else if (result.canceled) {
          // Kullanıcı iptal etti, sessizce çık
          return
        } else {
          showNotification(`PDF kaydedilirken hata oluştu: ${result.error || 'Bilinmeyen hata'}`, 'error')
        }
      } else {
        // Electron yoksa normal print dialog'unu aç
        window.print()
      }
    } catch (error) {
      console.error('PDF oluşturma hatası:', error)
      showNotification('PDF oluşturulurken bir hata oluştu', 'error')
    }
  }

  return (
    <Box
      sx={{
        p: 3,
        '@media print': {
          p: 0,
          m: 0,
        },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          '@media print': {
            maxWidth: '100%',
            padding: 0,
            margin: 0,
          },
        }}
      >
        {/* Week Navigation Toolbar */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 3,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            '@media print': {
              display: 'none',
              margin: 0,
              padding: 0,
              marginBottom: 0,
            },
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              variant="outlined"
              startIcon={<ChevronLeft />}
              onClick={handlePreviousWeek}
            >
              Önceki Hafta
            </Button>
            <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 150, textAlign: 'center', mx: 1 }}>
              {weekDays[0].date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} -{' '}
              {weekDays[weekDays.length - 1].date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
            </Typography>
            <Button
              variant="outlined"
              endIcon={<ChevronRight />}
              onClick={handleNextWeek}
            >
              Sonraki Hafta
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleManualSave}
              sx={{ ml: 2 }}
            >
              Kaydet
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteConfirmOpen(true)}
            >
              Çalışmayı Sil
            </Button>
          </Stack>
          <Button
            variant="contained"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Yazdır / PDF
          </Button>
        </Paper>

        {/* Timetable */}
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            '@media print': {
              boxShadow: 'none',
              elevation: 0,
              width: '100%',
              maxWidth: '100%',
              margin: 0,
              padding: 0,
              marginTop: 0,
            },
          }}
        >
          <Table
            sx={{
              minWidth: 800,
              '@media print': {
                width: '100%',
                minWidth: '100%',
                tableLayout: 'auto',
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: 'grey.100',
                    fontWeight: 700,
                    textAlign: 'center',
                    width: 120,
                    '@media print': {
                      bgcolor: 'grey.100',
                      printColorAdjust: 'exact',
                      WebkitPrintColorAdjust: 'exact',
                    },
                  }}
                >
                  Saat
                </TableCell>
                {DAYS.map((day) => (
                  <TableCell
                    key={day}
                    sx={{
                      bgcolor: 'grey.100',
                      fontWeight: 700,
                      textAlign: 'center',
                      '@media print': {
                        bgcolor: 'grey.100',
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact',
                      },
                    }}
                  >
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {timeSlots.map((timeSlot) => (
                <TableRow key={`${timeSlot.start}-${timeSlot.end}`}>
                  <TableCell
                    sx={{
                      bgcolor: 'grey.50',
                      fontWeight: 600,
                      textAlign: 'center',
                      verticalAlign: 'top',
                      '@media print': {
                        bgcolor: 'grey.50',
                        printColorAdjust: 'exact',
                        WebkitPrintColorAdjust: 'exact',
                      },
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {timeSlot.start}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {timeSlot.end}
                    </Typography>
                  </TableCell>
                  {DAYS.map((day) => {
                    const key = `${day}-${timeSlot.start}`
                    const lesson = timetable.get(key)
                    return (
                      <TableCell
                        key={key}
                        onClick={() => handleCellClick(day, timeSlot)}
                        sx={{
                          minHeight: 100,
                          minWidth: 150,
                          cursor: 'pointer',
                          bgcolor: lesson ? lesson.color : 'transparent',
                          color: lesson ? 'white' : 'text.secondary',
                          border: lesson ? '2px solid rgba(0,0,0,0.1)' : '2px dashed',
                          borderColor: lesson ? 'rgba(0,0,0,0.1)' : 'grey.300',
                          '&:hover': {
                            bgcolor: lesson ? undefined : 'grey.50',
                            borderColor: lesson ? undefined : 'grey.400',
                          },
                          verticalAlign: 'top',
                          '@media print': {
                            pageBreakInside: 'avoid',
                            WebkitPrintColorAdjust: 'exact',
                            printColorAdjust: 'exact',
                          },
                        }}
                      >
                        {lesson ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                              {lesson.subject}
                            </Typography>
                            {lesson.topicId && (() => {
                              const topic = getTopicById(lesson.topicId)
                              return topic ? (
                                <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 0.5 }}>
                                  📚 {topic.name}
                                </Typography>
                              ) : null
                            })()}
                            {lesson.note && (
                              <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                                {lesson.note}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography
                            variant="caption"
                            sx={{
                              textAlign: 'center',
                              display: 'block',
                              '@media print': {
                                display: 'none',
                              },
                            }}
                          >
                            + Ders Ekle
                          </Typography>
                        )}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Dialog */}
        <LessonEditDialog
          open={!!editingCell}
          onClose={() => {
            setEditingCell(null)
            setEditForm({})
          }}
          onSave={handleSaveLesson}
          onDelete={handleDeleteLesson}
          initialLesson={editForm}
          subjects={subjects}
          hasExistingLesson={editingCell ? !!timetable.get(`${editingCell.day}-${editingCell.timeSlot.start}`) : false}
          onFormChange={(lesson) => setEditForm(lesson)}
        />

        {/* Silme Onay Dialog'u */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Çalışmayı Sil</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Tüm çalışmanızı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>İptal</Button>
            <Button onClick={handleClearWork} color="error" variant="contained">
              Sil
            </Button>
          </DialogActions>
        </Dialog>

        {/* Öğrenci Adı Dialog'u */}
        <StudentNameDialog
          open={studentNameDialogOpen}
          onClose={() => setStudentNameDialogOpen(false)}
          onConfirm={handleStudentNameConfirm}
          weekRange={`${weekDays[0].date.getDate()}-${weekDays[weekDays.length - 1].date.getDate()}${weekDays[0].date.toLocaleDateString('tr-TR', { month: 'long' })}`}
        />
      </Container>
    </Box>
  )
}
