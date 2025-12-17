import { useState, useEffect } from 'react'
import {
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
  Box,
  Typography,
  Button,
} from '@mui/material'
import { Delete, Save, Close } from '@mui/icons-material'
import type { Subject, Lesson } from '../types'
import { getTopicsBySubject } from '../utils/subjectStorage'

interface LessonEditDialogProps {
  open: boolean
  onClose: () => void
  onSave: (lesson: Partial<Lesson>) => void
  onDelete?: () => void
  initialLesson?: Partial<Lesson> | null
  subjects: Subject[]
  hasExistingLesson: boolean
  onFormChange?: (lesson: Partial<Lesson>) => void
}

// Tema ile uyumlu default renk (primary.main: rgb(170, 180, 240))
const DEFAULT_COLOR = '#aab4f0'

export const LessonEditDialog = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialLesson,
  subjects,
  hasExistingLesson,
  onFormChange,
}: LessonEditDialogProps) => {
  const [formData, setFormData] = useState<Partial<Lesson>>({
    subject: undefined,
    topicId: '',
    note: '',
    color: DEFAULT_COLOR,
  })

  // initialLesson değiştiğinde formData'yı güncelle
  useEffect(() => {
    if (initialLesson) {
      setFormData({
        id: initialLesson.id,
        subject: initialLesson.subject,
        topicId: initialLesson.topicId || '',
        note: initialLesson.note || '',
        color: initialLesson.color || DEFAULT_COLOR,
      })
    } else {
      setFormData({
        subject: undefined,
        topicId: '',
        note: '',
        color: DEFAULT_COLOR,
      })
    }
  }, [initialLesson])

  const handleSave = () => {
    if (!formData.subject) return
    onSave({
      ...formData,
      id: initialLesson?.id || crypto.randomUUID(),
    })
  }

  const updateFormData = (updates: Partial<Lesson>) => {
    const newData = { ...formData, ...updates }
    setFormData(newData)
    onFormChange?.(newData)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h2">Ders Bilgileri</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Ders</InputLabel>
            <Select
              value={formData.subject ?? ''}
              onChange={(e) => {
                const value = e.target.value
                updateFormData({
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

          {formData.subject && (
            <FormControl fullWidth>
              <InputLabel>Konu</InputLabel>
              <Select
                value={formData.topicId || ''}
                onChange={(e) => {
                  updateFormData({ topicId: e.target.value || undefined })
                }}
                label="Konu"
              >
                <MenuItem value="">
                  <em>Konu seçilmedi</em>
                </MenuItem>
                {getTopicsBySubject(formData.subject).map((topic) => (
                  <MenuItem key={topic.id} value={topic.id}>
                    {topic.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <Box>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
              Renk
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type="color"
                value={formData.color || DEFAULT_COLOR}
                onChange={(e) => {
                  updateFormData({ color: e.target.value })
                }}
                style={{
                  width: 60,
                  height: 40,
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label={formData.color || DEFAULT_COLOR}
                size="small"
                sx={{ fontFamily: 'monospace' }}
              />
            </Box>
          </Box>

          <TextField
            fullWidth
            label="Not"
            value={formData.note || ''}
            onChange={(e) => {
              updateFormData({ note: e.target.value })
            }}
            placeholder="Ek notlar..."
            multiline
            rows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>İptal</Button>
        {hasExistingLesson && onDelete && (
          <Button color="error" startIcon={<Delete />} onClick={onDelete}>
            Sil
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSave}
          disabled={!formData.subject}
        >
          Kaydet
        </Button>
      </DialogActions>
    </Dialog>
  )
}

