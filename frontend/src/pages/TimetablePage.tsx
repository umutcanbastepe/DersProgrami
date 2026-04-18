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
  TextField,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  Print,
  Save,
  Delete,
  School,
  DragIndicator,
  Clear,
} from '@mui/icons-material'
import { DAYS, type Day, type Subject, type TimetableData, type Lesson, type TimeSlot, generateTimeSlots } from '../types'
import { getWeekStart, toISODateString, fromISODateString, getWeekDays } from '../utils/dateUtils'
import { saveTimetable, loadTimetable, saveStudentName, loadStudentName } from '../utils/storage'
import { getTopicById } from '../utils/subjectStorage'
import { WeekRangePicker } from '../components/WeekRangePicker'
import { useNotification } from '../contexts/NotificationContext'
import type { DragData } from '../utils/colors'

const DEFAULT_TIME_SLOTS: TimeSlot[] = generateTimeSlots(8, 24)

export const TimetablePage = () => {
  const { showNotification } = useNotification()
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart())
  const [timeSlots] = useState<TimeSlot[]>(DEFAULT_TIME_SLOTS)
  const [timetable, setTimetable] = useState<Map<string, Lesson | null>>(new Map())
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [studentName, setStudentName] = useState<string>(loadStudentName())

  // Drag state
  const [dragOverKey, setDragOverKey] = useState<string | null>(null)

  /** Sağ tık: tek hücreyi temizle */
  const [cellContextMenu, setCellContextMenu] = useState<{
    mouseX: number
    mouseY: number
    cellKey: string
  } | null>(null)

  const handleCellContextMenu = (e: React.MouseEvent, key: string, hasLesson: boolean) => {
    if (!hasLesson) return
    e.preventDefault()
    setCellContextMenu({ mouseX: e.clientX, mouseY: e.clientY, cellKey: key })
  }

  const handleCloseCellContextMenu = () => setCellContextMenu(null)

  const handleClearCell = () => {
    if (!cellContextMenu) return
    const { cellKey } = cellContextMenu
    setTimetable((prev) => {
      const next = new Map(prev)
      next.delete(cellKey)
      return next
    })
    setCellContextMenu(null)
  }

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
    setStudentName(loadStudentName())
  }, [])

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
    if (studentName.trim()) {
      saveStudentName(studentName.trim())
    }
    showNotification('Çalışma başarıyla kaydedildi!', 'success')
  }

  const handleClearWork = () => {
    setTimetable(new Map())
    setWeekStart(getWeekStart())
    setStudentName('')
    localStorage.removeItem('timetable-data')
    localStorage.removeItem('student-name')
    setDeleteConfirmOpen(false)
    showNotification('Çalışma başarıyla silindi!', 'success')
  }

  // --- Drag & drop handlers ---
  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setDragOverKey(key)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the cell entirely (not entering a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverKey(null)
    }
  }

  const handleDrop = (e: React.DragEvent, day: Day, timeSlot: TimeSlot) => {
    e.preventDefault()
    setDragOverKey(null)
    try {
      const raw = e.dataTransfer.getData('application/json')
      if (!raw) return
      const data = JSON.parse(raw) as DragData
      if (!data.subjectName) return
      const key = `${day}-${timeSlot.start}`
      const lesson: Lesson = {
        id: crypto.randomUUID(),
        subject: data.subjectName as Subject,
        topicId: data.topicId || undefined,
        color: data.color,
      }
      setTimetable((prev) => new Map(prev).set(key, lesson))
    } catch {
      // invalid drag data — ignore
    }
  }

  const handleDragEnd = () => setDragOverKey(null)

  // Hafta içi 08:00–17:00 arası boş hücreleri "Okul Vakti" ile doldur
  const WEEKDAY_NAMES: Day[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma']
  const SCHOOL_COLOR = '#7986cb'

  const handleFillWeekdays = () => {
    setTimetable((prev) => {
      const next = new Map(prev)
      WEEKDAY_NAMES.forEach((day) => {
        timeSlots
          .filter((slot) => {
            const hour = parseInt(slot.start.split(':')[0], 10)
            return hour >= 8 && hour < 17
          })
          .forEach((slot) => {
            const key = `${day}-${slot.start}`
            if (!next.get(key)) {
              next.set(key, {
                id: crypto.randomUUID(),
                subject: 'Okul Vakti',
                color: SCHOOL_COLOR,
              })
            }
          })
      })
      return next
    })
    showNotification('Hafta içi okul saatleri dolduruldu!', 'success')
  }

  const weekDays = getWeekDays(weekStart)
  const startDayIndex = (weekStart.getDay() + 6) % 7
  const activeDays = Array.from({ length: 7 }, (_, i) => DAYS[(startDayIndex + i) % 7]) as Day[]

  const formatFileName = (name: string): string => {
    const startDate = weekDays[0].date
    const endDate = weekDays[weekDays.length - 1].date
    const startDay = startDate.getDate()
    const endDay = endDate.getDate()
    const monthName = startDate.toLocaleDateString('tr-TR', { month: 'long' })
    const normalize = (str: string) =>
      str.toLowerCase()
        .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ç/g, 'c')
        .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ı/g, 'i')
        .replace(/[^a-z0-9]/g, '')
    return `${startDay}-${endDay}${normalize(monthName)}_${normalize(name)}_calisma_programi.pdf`
  }

  const handlePrint = async () => {
    if (!studentName.trim()) {
      showNotification('Lütfen öğrenci adını girin', 'warning')
      return
    }
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const fileName = formatFileName(studentName.trim())
        const result = await window.electronAPI.printToPDF(fileName)
        if (result.success) {
          showNotification(`PDF başarıyla kaydedildi: ${fileName}`, 'success')
        } else if (!result.canceled) {
          showNotification(`PDF kaydedilirken hata oluştu: ${result.error || 'Bilinmeyen hata'}`, 'error')
        }
      } else {
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
        p: { xs: 1, sm: 2, md: 3 },
        '@media print': { p: 0, m: 0 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          '@media print': { maxWidth: '100%', padding: 0, margin: 0 },
        }}
      >
        {/* Toolbar */}
        <Paper
          elevation={2}
          sx={{
            p: 2,
            mb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 1,
            '@media print': { display: 'none' },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" gap={1}>
            <WeekRangePicker
              startDate={weekStart}
              onChange={(newStart) => setWeekStart(newStart)}
            />
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleManualSave}
              size="small"
            >
              Kaydet
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteConfirmOpen(true)}
              size="small"
            >
              Çalışmayı Sil
            </Button>
            <TextField
              label="Öğrenci Adı"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              size="small"
              sx={{ minWidth: 140 }}
              placeholder="Örn: Gamze"
            />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Pazartesi–Cuma, 08:00–17:00 boş hücreleri Okul Vakti ile doldur">
              <Button
                variant="outlined"
                startIcon={<School />}
                onClick={handleFillWeekdays}
                size="small"
              >
                Hafta İçlerini Doldur
              </Button>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              size="small"
            >
              Yazdır / PDF
            </Button>
          </Stack>
        </Paper>

        <TableContainer
          component={Paper}
          elevation={2}
          sx={{
            '@media print': {
              boxShadow: 'none',
              width: '100%',
              maxWidth: '100%',
              margin: 0,
              padding: 0,
            },
          }}
        >
          <Table
            sx={{
              minWidth: 700,
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
                        width: 110,
                        '@media print': {
                          bgcolor: 'grey.100',
                          printColorAdjust: 'exact',
                          WebkitPrintColorAdjust: 'exact',
                        },
                      }}
                    >
                      Saat
                    </TableCell>
                    {activeDays.map((day, i) => (
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
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {day}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {weekDays[i].date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                        </Typography>
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
                      {activeDays.map((day) => {
                        const key = `${day}-${timeSlot.start}`
                        const lesson = timetable.get(key)
                        const isDragTarget = dragOverKey === key

                        return (
                          <TableCell
                            key={key}
                            onDragOver={(e) => handleDragOver(e, key)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, day, timeSlot)}
                            onDragEnd={handleDragEnd}
                            onContextMenu={(e) => handleCellContextMenu(e, key, Boolean(lesson))}
                            title={lesson ? 'Sağ tık: hücreyi temizle' : undefined}
                            sx={{
                              minHeight: 80,
                              minWidth: 130,
                              cursor: 'default',
                              position: 'relative',
                              verticalAlign: 'top',
                              transition: 'all 0.15s ease',

                              // Background
                              bgcolor: isDragTarget
                                ? 'primary.light'
                                : lesson
                                  ? lesson.color
                                  : 'transparent',

                              // Border
                              border: isDragTarget
                                ? '2px solid'
                                : lesson
                                  ? '2px solid rgba(0,0,0,0.08)'
                                  : '2px dashed',
                              borderColor: isDragTarget
                                ? 'primary.main'
                                : lesson
                                  ? 'rgba(0,0,0,0.08)'
                                  : 'grey.300',

                              // Text color
                              color: isDragTarget
                                ? 'primary.contrastText'
                                : lesson
                                  ? 'white'
                                  : 'text.secondary',

                              transform: isDragTarget ? 'scale(1.02)' : 'none',
                              boxShadow: isDragTarget ? 3 : 0,
                              zIndex: isDragTarget ? 1 : 0,

                              '&:hover': lesson
                                ? { filter: 'brightness(0.93)' }
                                : { bgcolor: 'grey.50', borderColor: 'grey.400' },

                              '@media print': {
                                pageBreakInside: 'avoid',
                                WebkitPrintColorAdjust: 'exact',
                                printColorAdjust: 'exact',
                              },
                            }}
                          >
                            {isDragTarget && !lesson && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  pointerEvents: 'none',
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.8 }}>
                                  Bırak
                                </Typography>
                              </Box>
                            )}
                            {lesson ? (
                              <Box sx={{ p: 0.25 }}>
                                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25, lineHeight: 1.3 }}>
                                  {lesson.subject}
                                </Typography>
                                {lesson.topicId && (() => {
                                  const topic = getTopicById(lesson.topicId)
                                  return topic ? (
                                    <Typography
                                      variant="caption"
                                      sx={{ opacity: 0.9, display: 'block', mb: 0.25, lineHeight: 1.3 }}
                                    >
                                      📚 {topic.name}
                                    </Typography>
                                  ) : null
                                })()}
                                {lesson.note && (
                                  <Typography
                                    variant="caption"
                                    sx={{ fontStyle: 'italic', opacity: 0.85, display: 'block', lineHeight: 1.3 }}
                                  >
                                    {lesson.note}
                                  </Typography>
                                )}
                              </Box>
                            ) : !isDragTarget ? (
                              <Typography
                                variant="caption"
                                sx={{
                                  textAlign: 'center',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 0.5,
                                  opacity: 0.45,
                                  height: '100%',
                                  minHeight: 48,
                                  '@media print': { display: 'none' },
                                }}
                              >
                                <DragIndicator sx={{ fontSize: 12 }} />
                                Paletten sürükleyin
                              </Typography>
                            ) : null}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

        <Menu
          open={cellContextMenu !== null}
          onClose={handleCloseCellContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            cellContextMenu !== null
              ? { top: cellContextMenu.mouseY, left: cellContextMenu.mouseX }
              : undefined
          }
          slotProps={{
            root: {
              onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
            },
          }}
        >
          <MenuItem onClick={handleClearCell} dense>
            <ListItemIcon>
              <Clear fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Hücreyi temizle" secondary="Bu saati boşaltır" />
          </MenuItem>
        </Menu>

        {/* Silme Onay Dialog'u */}
        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
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
      </Container>
    </Box>
  )
}
