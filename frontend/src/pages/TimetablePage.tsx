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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
  Chip,
} from '@mui/material'
import {
  ChevronLeft,
  ChevronRight,
  Print,
  Person,
  School,
  Delete,
  Save,
  Close,
} from '@mui/icons-material'
import { DAYS, type Day, type Subject, type TimetableData, type Lesson, type TimeSlot, generateTimeSlots } from '../types'
import { getWeekStart, toISODateString, fromISODateString, getWeekDays } from '../utils/dateUtils'
import { saveTimetable, loadTimetable } from '../utils/storage'
import { loadSubjects, getTopicsBySubject, getTopicById } from '../utils/subjectStorage'

// Varsayılan ders saatleri (08:00 - 24:00 arası, saatlik aralıklarla)
const DEFAULT_TIME_SLOTS: TimeSlot[] = generateTimeSlots(8, 24)

export const TimetablePage = () => {
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart())
  const [timeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS)
  const [timetable, setTimetable] = useState<Map<string, Lesson | null>>(new Map())
  const [editingCell, setEditingCell] = useState<{ day: Day; timeSlot: TimeSlot } | null>(null)
  const [editForm, setEditForm] = useState<Partial<Lesson>>({})
  const [subjects, setSubjects] = useState<Subject[]>(loadSubjects())

  // Yükleme
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

  // Kaydetme
  useEffect(() => {
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
  }, [timetable, weekStart, timeSlots])

  const handleCellClick = (day: Day, timeSlot: TimeSlot) => {
    const key = `${day}-${timeSlot.start}`
    const existing = timetable.get(key)
    setEditingCell({ day, timeSlot })
    setEditForm({
      id: existing?.id || crypto.randomUUID(),
      subject: existing?.subject || undefined,
      topicId: existing?.topicId || '',
      teacher: existing?.teacher || '',
      classroom: existing?.classroom || '',
      note: existing?.note || '',
      color: existing?.color || '#3b82f6',
    })
  }

  const handleSaveLesson = () => {
    if (!editingCell || !editForm.subject) return

    const key = `${editingCell.day}-${editingCell.timeSlot.start}`
    const lesson: Lesson = {
      id: editForm.id!,
      subject: editForm.subject as Subject,
      topicId: editForm.topicId || undefined,
      teacher: editForm.teacher,
      classroom: editForm.classroom,
      note: editForm.note,
      color: editForm.color || '#3b82f6',
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

  const handlePrint = () => {
    window.print()
  }

  const weekDays = getWeekDays(weekStart)

  return (
    <Box sx={{ p: 3 }}>
      <Container maxWidth="xl">
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
            <Typography variant="body1" sx={{ fontWeight: 600, minWidth: 250, textAlign: 'center' }}>
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
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: 'grey.100',
                    fontWeight: 700,
                    textAlign: 'center',
                    width: 120,
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
                            {lesson.teacher && (
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                <Person sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{lesson.teacher}</Typography>
                              </Stack>
                            )}
                            {lesson.classroom && (
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 0.5 }}>
                                <School sx={{ fontSize: 14 }} />
                                <Typography variant="caption">{lesson.classroom}</Typography>
                              </Stack>
                            )}
                            {lesson.note && (
                              <Typography variant="caption" sx={{ fontStyle: 'italic', opacity: 0.9 }}>
                                {lesson.note}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ textAlign: 'center', display: 'block' }}>
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
        <Dialog
          open={!!editingCell}
          onClose={() => setEditingCell(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h2">Ders Bilgileri</Typography>
              <IconButton onClick={() => setEditingCell(null)} size="small">
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel>Ders</InputLabel>
                <Select
                  value={editForm.subject ?? ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setEditForm({
                      ...editForm,
                      subject: value ? (value as Subject) : undefined,
                      topicId: '', // Ders değiştiğinde konuyu sıfırla
                    })
                  }}
                  label="Ders"
                >
                  {subjects.map((subj) => (
                    <MenuItem key={subj} value={subj}>
                      {subj}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {editForm.subject && (
                <FormControl fullWidth>
                  <InputLabel>Konu</InputLabel>
                  <Select
                    value={editForm.topicId || ''}
                    onChange={(e) => {
                      setEditForm({ ...editForm, topicId: e.target.value || undefined })
                    }}
                    label="Konu"
                  >
                    <MenuItem value="">
                      <em>Konu seçilmedi</em>
                    </MenuItem>
                    {getTopicsBySubject(editForm.subject).map((topic) => (
                      <MenuItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <TextField
                fullWidth
                label="Öğretmen"
                value={editForm.teacher || ''}
                onChange={(e) => setEditForm({ ...editForm, teacher: e.target.value })}
                placeholder="Öğretmen adı"
                InputProps={{
                  startAdornment: <Person sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                fullWidth
                label="Derslik"
                value={editForm.classroom || ''}
                onChange={(e) => setEditForm({ ...editForm, classroom: e.target.value })}
                placeholder="Derslik numarası"
                InputProps={{
                  startAdornment: <School sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Renk
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <input
                    type="color"
                    value={editForm.color || '#3b82f6'}
                    onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                    style={{
                      width: 60,
                      height: 40,
                      border: '1px solid #e2e8f0',
                      borderRadius: 8,
                      cursor: 'pointer',
                    }}
                  />
                  <Chip
                    label={editForm.color || '#3b82f6'}
                    size="small"
                    sx={{ fontFamily: 'monospace' }}
                  />
                </Box>
              </Box>

              <TextField
                fullWidth
                label="Not"
                value={editForm.note || ''}
                onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                placeholder="Ek notlar..."
                multiline
                rows={3}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditingCell(null)}>İptal</Button>
            {editingCell && timetable.get(`${editingCell.day}-${editingCell.timeSlot.start}`) && (
              <Button
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteLesson}
              >
                Sil
              </Button>
            )}
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSaveLesson}
              disabled={!editForm.subject}
            >
              Kaydet
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  )
}
