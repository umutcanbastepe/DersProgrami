import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Typography,
    Divider,
    Stack,
    Chip,
    Tabs,
    Tab,
} from '@mui/material'
import {
    Add,
    Edit,
    Delete,
    Close,
    MenuBook,
    Subject as SubjectIcon,
} from '@mui/icons-material'
import type { Subject, Topic } from '../types'
import {
    loadSubjects,
    addSubject,
    deleteSubject,
    updateSubject,
    getTopicsBySubject,
    addTopicToSubject,
    updateTopic,
    deleteTopic,
} from '../utils/subjectStorage'

interface TopicManagementDialogProps {
    open: boolean
    onClose: () => void
    onSubjectsChange?: () => void // Dersler değiştiğinde çağrılacak callback
}

export const TopicManagementDialog = ({ open, onClose, onSubjectsChange }: TopicManagementDialogProps) => {
    const [tabValue, setTabValue] = useState(0) // 0: Dersler, 1: Konular
    const [subjects, setSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState<Subject | ''>('')
    const [topics, setTopics] = useState<Topic[]>([])
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
    const [newTopicName, setNewTopicName] = useState('')
    const [newSubjectName, setNewSubjectName] = useState('')
    const [editTopicName, setEditTopicName] = useState('')
    const [editSubjectName, setEditSubjectName] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deleteSubjectDialogOpen, setDeleteSubjectDialogOpen] = useState(false)
    const [topicToDelete, setTopicToDelete] = useState<string | null>(null)
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null)

    // Dialog açıldığında dersleri yükle
    useEffect(() => {
        if (open) {
            const loadedSubjects = loadSubjects()
            setSubjects(loadedSubjects)
        }
    }, [open])

    // Seçili ders değiştiğinde konuları yükle
    useEffect(() => {
        if (selectedSubject) {
            const subjectTopics = getTopicsBySubject(selectedSubject)
            setTopics(subjectTopics)
            setEditingTopic(null)
            setNewTopicName('')
            setEditTopicName('')
        } else {
            setTopics([])
        }
    }, [selectedSubject])

    const handleAddTopic = () => {
        if (!selectedSubject || !newTopicName.trim()) return

        const newTopic = addTopicToSubject(selectedSubject, newTopicName.trim())
        setTopics([...topics, newTopic])
        setNewTopicName('')
    }

    const handleStartEdit = (topic: Topic) => {
        setEditingTopic(topic)
        setEditTopicName(topic.name)
    }

    const handleSaveEdit = () => {
        if (!editingTopic || !editTopicName.trim()) return

        const success = updateTopic(editingTopic.id, editTopicName.trim())
        if (success) {
            const updatedTopics = topics.map((t) =>
                t.id === editingTopic.id ? { ...t, name: editTopicName.trim() } : t
            )
            setTopics(updatedTopics)
            setEditingTopic(null)
            setEditTopicName('')
        }
    }

    const handleCancelEdit = () => {
        setEditingTopic(null)
        setEditTopicName('')
    }

    const handleDeleteClick = (topicId: string) => {
        setTopicToDelete(topicId)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (!topicToDelete) return

        const success = deleteTopic(topicToDelete)
        if (success) {
            setTopics(topics.filter((t) => t.id !== topicToDelete))
        }
        setDeleteDialogOpen(false)
        setTopicToDelete(null)
    }

    const handleCancelDelete = () => {
        setDeleteDialogOpen(false)
        setTopicToDelete(null)
    }

    // Ders yönetimi fonksiyonları
    const handleAddSubject = () => {
        if (!newSubjectName.trim()) return

        const newSubject = addSubject(newSubjectName.trim())
        if (newSubject) {
            setSubjects([...subjects, newSubject])
            setNewSubjectName('')
            onSubjectsChange?.() // Dersler değişti, parent component'i bilgilendir
        } else {
            alert('Bu ders zaten mevcut!')
        }
    }

    const handleStartEditSubject = (subject: Subject) => {
        setEditingSubject(subject)
        setEditSubjectName(subject)
    }

    const handleSaveEditSubject = () => {
        if (!editingSubject || !editSubjectName.trim()) return

        const success = updateSubject(editingSubject, editSubjectName.trim())
        if (success) {
            const updatedSubjects = subjects.map((s) =>
                s === editingSubject ? (editSubjectName.trim() as Subject) : s
            )
            setSubjects(updatedSubjects)

            // Eğer seçili ders güncellendiyse, seçimi de güncelle
            if (selectedSubject === editingSubject) {
                setSelectedSubject(editSubjectName.trim() as Subject)
            }

            setEditingSubject(null)
            setEditSubjectName('')
            onSubjectsChange?.() // Dersler değişti, parent component'i bilgilendir
        } else {
            alert('Bu ders adı zaten mevcut veya geçersiz!')
        }
    }

    const handleCancelEditSubject = () => {
        setEditingSubject(null)
        setEditSubjectName('')
    }

    const handleDeleteSubjectClick = (subject: Subject) => {
        setSubjectToDelete(subject)
        setDeleteSubjectDialogOpen(true)
    }

    const handleConfirmDeleteSubject = () => {
        if (!subjectToDelete) return

        const success = deleteSubject(subjectToDelete)
        if (success) {
            setSubjects(subjects.filter((s) => s !== subjectToDelete))
            if (selectedSubject === subjectToDelete) {
                setSelectedSubject('')
            }
            onSubjectsChange?.() // Dersler değişti, parent component'i bilgilendir
        }
        setDeleteSubjectDialogOpen(false)
        setSubjectToDelete(null)
    }

    const handleCancelDeleteSubject = () => {
        setDeleteSubjectDialogOpen(false)
        setSubjectToDelete(null)
    }

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h2">Ders ve Konu Yönetimi</Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Stack>
            </DialogTitle>
            <DialogContent>
                <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
                    <Tab icon={<SubjectIcon />} label="Dersler" iconPosition="start" />
                    <Tab icon={<MenuBook />} label="Konular" iconPosition="start" />
                </Tabs>

                {tabValue === 0 && (
                    <Stack spacing={3}>
                        {/* Yeni Ders Ekleme */}
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                Yeni Ders Ekle
                            </Typography>
                            <Stack direction="row" spacing={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Ders adı"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault()
                                            handleAddSubject()
                                        }
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={handleAddSubject}
                                    disabled={!newSubjectName.trim()}
                                >
                                    Ekle
                                </Button>
                            </Stack>
                        </Box>

                        {/* Ders Listesi */}
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                Dersler ({subjects.length})
                            </Typography>
                            {subjects.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    Henüz ders eklenmemiş
                                </Typography>
                            ) : (
                                <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                    {subjects.map((subject) => (
                                        <ListItem
                                            key={subject}
                                            secondaryAction={
                                                editingSubject === subject ? null : (
                                                    <Stack direction="row" spacing={0.5}>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={() => handleStartEditSubject(subject)}
                                                        >
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton
                                                            edge="end"
                                                            size="small"
                                                            onClick={() => handleDeleteSubjectClick(subject)}
                                                            color="error"
                                                        >
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Stack>
                                                )
                                            }
                                        >
                                            {editingSubject === subject ? (
                                                <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={editSubjectName}
                                                        onChange={(e) => setEditSubjectName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault()
                                                                handleSaveEditSubject()
                                                            } else if (e.key === 'Escape') {
                                                                e.preventDefault()
                                                                handleCancelEditSubject()
                                                            }
                                                        }}
                                                        autoFocus
                                                    />
                                                    <Button size="small" onClick={handleSaveEditSubject}>
                                                        Kaydet
                                                    </Button>
                                                    <Button size="small" onClick={handleCancelEditSubject}>
                                                        İptal
                                                    </Button>
                                                </Stack>
                                            ) : (
                                                <ListItemText primary={subject} />
                                            )}
                                        </ListItem>
                                    ))}
                                </List>
                            )}
                        </Box>
                    </Stack>
                )}

                {tabValue === 1 && (
                    <Stack spacing={3}>
                        {/* Ders Seçimi */}
                        <Box>
                            <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                Ders Seçiniz
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {subjects.map((subject) => (
                                    <Chip
                                        key={subject}
                                        label={subject}
                                        onClick={() => setSelectedSubject(subject)}
                                        color={selectedSubject === subject ? 'primary' : 'default'}
                                        variant={selectedSubject === subject ? 'filled' : 'outlined'}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {selectedSubject && (
                            <>
                                <Divider />

                                {/* Yeni Konu Ekleme */}
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        Yeni Konu Ekle
                                    </Typography>
                                    <Stack direction="row" spacing={1}>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            placeholder="Konu adı"
                                            value={newTopicName}
                                            onChange={(e) => setNewTopicName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()
                                                    handleAddTopic()
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            startIcon={<Add />}
                                            onClick={handleAddTopic}
                                            disabled={!newTopicName.trim()}
                                        >
                                            Ekle
                                        </Button>
                                    </Stack>
                                </Box>

                                {/* Konu Listesi */}
                                <Box>
                                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                        {selectedSubject} - Konular ({topics.length})
                                    </Typography>
                                    {topics.length === 0 ? (
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            Henüz konu eklenmemiş
                                        </Typography>
                                    ) : (
                                        <List sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                            {topics.map((topic) => (
                                                <ListItem
                                                    key={topic.id}
                                                    secondaryAction={
                                                        editingTopic?.id === topic.id ? null : (
                                                            <Stack direction="row" spacing={0.5}>
                                                                <IconButton
                                                                    edge="end"
                                                                    size="small"
                                                                    onClick={() => handleStartEdit(topic)}
                                                                >
                                                                    <Edit fontSize="small" />
                                                                </IconButton>
                                                                <IconButton
                                                                    edge="end"
                                                                    size="small"
                                                                    onClick={() => handleDeleteClick(topic.id)}
                                                                    color="error"
                                                                >
                                                                    <Delete fontSize="small" />
                                                                </IconButton>
                                                            </Stack>
                                                        )
                                                    }
                                                >
                                                    {editingTopic?.id === topic.id ? (
                                                        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                                                            <TextField
                                                                fullWidth
                                                                size="small"
                                                                value={editTopicName}
                                                                onChange={(e) => setEditTopicName(e.target.value)}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault()
                                                                        handleSaveEdit()
                                                                    } else if (e.key === 'Escape') {
                                                                        e.preventDefault()
                                                                        handleCancelEdit()
                                                                    }
                                                                }}
                                                                autoFocus
                                                            />
                                                            <Button size="small" onClick={handleSaveEdit}>
                                                                Kaydet
                                                            </Button>
                                                            <Button size="small" onClick={handleCancelEdit}>
                                                                İptal
                                                            </Button>
                                                        </Stack>
                                                    ) : (
                                                        <ListItemText primary={topic.name} />
                                                    )}
                                                </ListItem>
                                            ))}
                                        </List>
                                    )}
                                </Box>
                            </>
                        )}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Kapat</Button>
            </DialogActions>

            {/* Delete Topic Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
                <DialogTitle>Konuyu Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        Bu konuyu silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDelete}>İptal</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Subject Confirmation Dialog */}
            <Dialog open={deleteSubjectDialogOpen} onClose={handleCancelDeleteSubject}>
                <DialogTitle>Dersi Sil</DialogTitle>
                <DialogContent>
                    <Typography>
                        <strong>{subjectToDelete}</strong> dersini silmek istediğinize emin misiniz?
                    </Typography>
                    <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                        ⚠️ Bu derse ait tüm konular da silinecektir. Bu işlem geri alınamaz.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelDeleteSubject}>İptal</Button>
                    <Button onClick={handleConfirmDeleteSubject} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Dialog>
    )
}

