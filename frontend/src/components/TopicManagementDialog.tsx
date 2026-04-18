import { useState, useEffect, useRef } from 'react'
import {
    Drawer,
    Box,
    Typography,
    IconButton,
    TextField,
    List,
    ListItemButton,
    ListItemText,
    ListItemSecondaryAction,
    Button,
    Divider,
    Stack,
    Chip,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Alert,
} from '@mui/material'
import {
    Add,
    Edit,
    Delete,
    Close,
    MenuBook,
    Subject as SubjectIcon,
    Check,
    Clear,
    UploadFile,
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
    bulkImportSubjectsAndTopics,
} from '../utils/subjectStorage'
import { parseBulkImportText, downloadBulkImportTemplate } from '../utils/subjectBulkImport'
import { getSubjectColor } from '../utils/colors'
import { useNotification } from '../contexts/NotificationContext'

interface TopicManagementDialogProps {
    open: boolean
    onClose: () => void
    onSubjectsChange?: () => void
}

export const TopicManagementDialog = ({
    open,
    onClose,
    onSubjectsChange,
}: TopicManagementDialogProps) => {
    const { showNotification } = useNotification()

    const [subjects, setSubjects] = useState<Subject[]>([])
    const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null)
    const [topics, setTopics] = useState<Topic[]>([])

    // Inline-edit states
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
    const [editSubjectName, setEditSubjectName] = useState('')
    const [newSubjectName, setNewSubjectName] = useState('')

    const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
    const [editTopicName, setEditTopicName] = useState('')
    const [newTopicName, setNewTopicName] = useState('')

    // Confirm delete state
    const [confirmDeleteSubject, setConfirmDeleteSubject] = useState<Subject | null>(null)
    const [confirmDeleteTopic, setConfirmDeleteTopic] = useState<Topic | null>(null)

    const [bulkImportOpen, setBulkImportOpen] = useState(false)
    const [bulkImportPreview, setBulkImportPreview] = useState<{
        rows: Array<{ subject: string; topic: string }>
        errors: string[]
    } | null>(null)
    const bulkFileInputRef = useRef<HTMLInputElement | null>(null)

    useEffect(() => {
        if (open) {
            const loaded = loadSubjects()
            setSubjects(loaded)
            if (!selectedSubject && loaded.length > 0) {
                setSelectedSubject(loaded[0])
            }
        }
    }, [open])

    useEffect(() => {
        if (selectedSubject) {
            setTopics(getTopicsBySubject(selectedSubject))
            setEditingTopic(null)
            setNewTopicName('')
        } else {
            setTopics([])
        }
    }, [selectedSubject])

    // --- Subject handlers ---
    const handleAddSubject = () => {
        const name = newSubjectName.trim()
        if (!name) return
        const created = addSubject(name)
        if (created) {
            const updated = [...subjects, created]
            setSubjects(updated)
            setNewSubjectName('')
            setSelectedSubject(created)
            onSubjectsChange?.()
        } else {
            showNotification('Bu ders zaten mevcut!', 'warning')
        }
    }

    const handleSaveSubjectEdit = () => {
        if (!editingSubject || !editSubjectName.trim()) return
        const success = updateSubject(editingSubject, editSubjectName.trim())
        if (success) {
            const updated = subjects.map((s) =>
                s === editingSubject ? (editSubjectName.trim() as Subject) : s
            )
            setSubjects(updated)
            if (selectedSubject === editingSubject) {
                setSelectedSubject(editSubjectName.trim() as Subject)
            }
            setEditingSubject(null)
            onSubjectsChange?.()
        } else {
            showNotification('Bu ders adı zaten mevcut!', 'warning')
        }
    }

    const handleDeleteSubject = (subject: Subject) => {
        setConfirmDeleteSubject(subject)
    }

    const handleConfirmDeleteSubject = () => {
        if (!confirmDeleteSubject) return
        const success = deleteSubject(confirmDeleteSubject)
        if (success) {
            const updated = subjects.filter((s) => s !== confirmDeleteSubject)
            setSubjects(updated)
            if (selectedSubject === confirmDeleteSubject) {
                setSelectedSubject(updated[0] ?? null)
            }
            onSubjectsChange?.()
            showNotification(`"${confirmDeleteSubject}" silindi`, 'success')
        }
        setConfirmDeleteSubject(null)
    }

    // --- Topic handlers ---
    const handleAddTopic = () => {
        if (!selectedSubject || !newTopicName.trim()) return
        const created = addTopicToSubject(selectedSubject, newTopicName.trim())
        setTopics([...topics, created])
        setNewTopicName('')
    }

    const handleSaveTopicEdit = () => {
        if (!editingTopic || !editTopicName.trim()) return
        const success = updateTopic(editingTopic.id, editTopicName.trim())
        if (success) {
            setTopics(topics.map((t) =>
                t.id === editingTopic.id ? { ...t, name: editTopicName.trim() } : t
            ))
            setEditingTopic(null)
        }
    }

    const handleDeleteTopic = (topic: Topic) => {
        setConfirmDeleteTopic(topic)
    }

    const handleConfirmDeleteTopic = () => {
        if (!confirmDeleteTopic) return
        const success = deleteTopic(confirmDeleteTopic.id)
        if (success) {
            setTopics(topics.filter((t) => t.id !== confirmDeleteTopic.id))
            showNotification(`"${confirmDeleteTopic.name}" konusu silindi`, 'success')
        }
        setConfirmDeleteTopic(null)
    }

    const handleOpenBulkImport = () => {
        setBulkImportPreview(null)
        setBulkImportOpen(true)
    }

    const handleCloseBulkImport = () => {
        setBulkImportOpen(false)
        setBulkImportPreview(null)
        if (bulkFileInputRef.current) bulkFileInputRef.current.value = ''
    }

    const handleBulkFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        void file
            .text()
            .then((text) => {
                const { rows, errors } = parseBulkImportText(text)
                setBulkImportPreview({ rows, errors })
                if (rows.length === 0) {
                    showNotification(errors[0] ?? 'Dosyadan geçerli satır okunamadı.', 'error')
                }
            })
            .catch(() => {
                showNotification('Dosya okunamadı.', 'error')
            })
        e.target.value = ''
    }

    const handleApplyBulkImport = () => {
        if (!bulkImportPreview?.rows.length) return
        const result = bulkImportSubjectsAndTopics(bulkImportPreview.rows)
        const parts = [
            result.addedSubjects ? `${result.addedSubjects} yeni ders` : '',
            result.addedTopics ? `${result.addedTopics} yeni konu` : '',
            result.skippedDuplicateTopics ? `${result.skippedDuplicateTopics} yinelenen atlandı` : '',
        ].filter(Boolean)
        showNotification(parts.join(' · ') || 'Yeni ekleme yapılmadı (tümü zaten vardı).', 'success')
        const nextSubjects = loadSubjects()
        setSubjects(nextSubjects)
        if (selectedSubject) {
            setTopics(getTopicsBySubject(selectedSubject))
        }
        onSubjectsChange?.()
        handleCloseBulkImport()
    }

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            slotProps={{
                backdrop: {
                    sx: {
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        backgroundColor: 'rgba(0, 0, 0, 0.18)',
                    },
                },
            }}
            PaperProps={{
                sx: {
                    width: { xs: '100%', sm: 640 },
                    display: 'flex',
                    flexDirection: 'column',
                },
            }}
        >
            {/* Drawer Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexShrink: 0,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <MenuBook />
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        Ders ve Konu Yönetimi
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                    <Tooltip title="Dosyadan toplu içe aktar (CSV / metin)">
                        <IconButton onClick={handleOpenBulkImport} sx={{ color: 'white' }} aria-label="Toplu içe aktar">
                            <UploadFile />
                        </IconButton>
                    </Tooltip>
                    <IconButton onClick={onClose} sx={{ color: 'white' }} aria-label="Kapat">
                        <Close />
                    </IconButton>
                </Box>
            </Box>

            {/* Two-column body */}
            <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

                {/* ---- Left: Subjects ---- */}
                <Box
                    sx={{
                        width: 240,
                        flexShrink: 0,
                        borderRight: '1px solid',
                        borderColor: 'divider',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Box
                        sx={{
                            px: 2,
                            py: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            bgcolor: 'grey.50',
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <SubjectIcon fontSize="small" color="primary" />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            Dersler
                        </Typography>
                        <Chip
                            label={subjects.length}
                            size="small"
                            sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                        />
                    </Box>

                    {/* Add subject */}
                    <Box sx={{ px: 1.5, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" spacing={0.5}>
                            <TextField
                                size="small"
                                fullWidth
                                placeholder="Yeni ders adı..."
                                value={newSubjectName}
                                onChange={(e) => setNewSubjectName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') { e.preventDefault(); handleAddSubject() }
                                }}
                                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem' } }}
                            />
                            <Tooltip title="Ders Ekle">
                                <span>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={handleAddSubject}
                                        disabled={!newSubjectName.trim()}
                                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'primary.main' }}
                                    >
                                        <Add fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                    </Box>

                    {/* Subject list */}
                    <List
                        dense
                        disablePadding
                        sx={{ flex: 1, overflowY: 'auto' }}
                    >
                        {subjects.map((subject) => {
                            const color = getSubjectColor(subject, subjects)
                            const isSelected = selectedSubject === subject
                            const isEditing = editingSubject === subject

                            return (
                                <Box key={subject}>
                                    {isEditing ? (
                                        <Box
                                            sx={{
                                                px: 1.5,
                                                py: 0.75,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 0.5,
                                                bgcolor: 'action.selected',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: color,
                                                    flexShrink: 0,
                                                }}
                                            />
                                            <TextField
                                                size="small"
                                                fullWidth
                                                value={editSubjectName}
                                                onChange={(e) => setEditSubjectName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleSaveSubjectEdit()
                                                    if (e.key === 'Escape') setEditingSubject(null)
                                                }}
                                                autoFocus
                                                sx={{ '& .MuiInputBase-input': { fontSize: '0.8rem', py: 0.5 } }}
                                            />
                                            <IconButton size="small" color="success" onClick={handleSaveSubjectEdit}>
                                                <Check fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => setEditingSubject(null)}>
                                                <Clear fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    ) : (
                                        <ListItemButton
                                            selected={isSelected}
                                            onClick={() => setSelectedSubject(subject)}
                                            sx={{
                                                px: 1.5,
                                                py: 0.75,
                                                '&.Mui-selected': {
                                                    bgcolor: `${color}1a`,
                                                    borderRight: `3px solid ${color}`,
                                                },
                                                '&.Mui-selected:hover': { bgcolor: `${color}2a` },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: '50%',
                                                    bgcolor: color,
                                                    flexShrink: 0,
                                                    mr: 1,
                                                    boxShadow: `0 0 0 2px ${color}44`,
                                                }}
                                            />
                                            <ListItemText
                                                primary={subject}
                                                primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: isSelected ? 700 : 400 }}
                                            />
                                            <ListItemSecondaryAction sx={{ opacity: 0, '.MuiListItemButton-root:hover &': { opacity: 1 }, transition: 'opacity 0.15s' }}>
                                                <Stack direction="row" spacing={0}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingSubject(subject)
                                                            setEditSubjectName(subject)
                                                        }}
                                                    >
                                                        <Edit sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDeleteSubject(subject)
                                                        }}
                                                    >
                                                        <Delete sx={{ fontSize: 14 }} />
                                                    </IconButton>
                                                </Stack>
                                            </ListItemSecondaryAction>
                                        </ListItemButton>
                                    )}
                                    <Divider />
                                </Box>
                            )
                        })}
                    </List>
                </Box>

                {/* ---- Right: Topics ---- */}
                <Box
                    sx={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    }}
                >
                    {selectedSubject ? (
                        <>
                            <Box
                                sx={{
                                    px: 2,
                                    py: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    bgcolor: 'grey.50',
                                    borderBottom: '1px solid',
                                    borderColor: 'divider',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: '50%',
                                        bgcolor: getSubjectColor(selectedSubject, subjects),
                                    }}
                                />
                                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                                    {selectedSubject}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    — Konular
                                </Typography>
                                <Chip
                                    label={topics.length}
                                    size="small"
                                    sx={{ ml: 'auto', height: 20, fontSize: '0.7rem' }}
                                />
                            </Box>

                            {/* Add topic */}
                            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                                <Stack direction="row" spacing={1}>
                                    <TextField
                                        size="small"
                                        fullWidth
                                        placeholder="Yeni konu adı..."
                                        value={newTopicName}
                                        onChange={(e) => setNewTopicName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') { e.preventDefault(); handleAddTopic() }
                                        }}
                                    />
                                    <Button
                                        variant="contained"
                                        size="small"
                                        startIcon={<Add />}
                                        onClick={handleAddTopic}
                                        disabled={!newTopicName.trim()}
                                        sx={{ flexShrink: 0 }}
                                    >
                                        Ekle
                                    </Button>
                                </Stack>
                            </Box>

                            {/* Topic list */}
                            <List dense disablePadding sx={{ flex: 1, overflowY: 'auto' }}>
                                {topics.length === 0 ? (
                                    <Box sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            Bu ders için henüz konu eklenmemiş.
                                        </Typography>
                                    </Box>
                                ) : (
                                    topics.map((topic) => (
                                        <Box key={topic.id}>
                                            {editingTopic?.id === topic.id ? (
                                                <Box
                                                    sx={{
                                                        px: 2,
                                                        py: 0.75,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        bgcolor: 'action.selected',
                                                    }}
                                                >
                                                    <TextField
                                                        size="small"
                                                        fullWidth
                                                        value={editTopicName}
                                                        onChange={(e) => setEditTopicName(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleSaveTopicEdit()
                                                            if (e.key === 'Escape') setEditingTopic(null)
                                                        }}
                                                        autoFocus
                                                    />
                                                    <IconButton size="small" color="success" onClick={handleSaveTopicEdit}>
                                                        <Check fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => setEditingTopic(null)}>
                                                        <Clear fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            ) : (
                                                <ListItemButton
                                                    sx={{ px: 2, py: 0.75, '&:hover .topic-actions': { opacity: 1 } }}
                                                >
                                                    <ListItemText
                                                        primary={topic.name}
                                                        primaryTypographyProps={{ fontSize: '0.85rem' }}
                                                    />
                                                    <ListItemSecondaryAction
                                                        className="topic-actions"
                                                        sx={{ opacity: 0, transition: 'opacity 0.15s' }}
                                                    >
                                                        <Stack direction="row" spacing={0}>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => {
                                                                    setEditingTopic(topic)
                                                                    setEditTopicName(topic.name)
                                                                }}
                                                            >
                                                                <Edit sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDeleteTopic(topic)}
                                                            >
                                                                <Delete sx={{ fontSize: 14 }} />
                                                            </IconButton>
                                                        </Stack>
                                                    </ListItemSecondaryAction>
                                                </ListItemButton>
                                            )}
                                            <Divider />
                                        </Box>
                                    ))
                                )}
                            </List>
                        </>
                    ) : (
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                p: 4,
                                color: 'text.disabled',
                            }}
                        >
                            <MenuBook sx={{ fontSize: 56, mb: 2 }} />
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                Konularını görmek için soldaki listeden bir ders seçin.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    px: 3,
                    py: 1.5,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    flexShrink: 0,
                    bgcolor: 'grey.50',
                }}
            >
                <Button variant="contained" onClick={onClose}>
                    Kapat
                </Button>
            </Box>

            <input
                ref={bulkFileInputRef}
                type="file"
                accept=".csv,.txt,text/csv,text/plain"
                hidden
                onChange={handleBulkFileSelected}
            />

            {/* Toplu içe aktarma */}
            <Dialog
                open={bulkImportOpen}
                onClose={handleCloseBulkImport}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>Toplu ders ve konu içe aktarma</DialogTitle>
                <DialogContent>
                    <DialogContentText component="div" sx={{ mb: 2 }}>
                        Excel veya Notepad ile iki sütunlu bir dosya hazırlayın:{' '}
                        <strong>ilk sütun Ders</strong>, <strong>ikinci sütun Konu</strong>. Her satırda bir konu;
                        aynı ders birden çok satırda tekrarlanabilir. Ayraç olarak virgül, noktalı virgül veya sekme
                        (Excel’den kopyala-yapıştır) kullanılabilir. İlk satır başlık olabilir:{' '}
                        <code>Ders,Konu</code>
                    </DialogContentText>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                        <Button variant="outlined" size="small" onClick={() => downloadBulkImportTemplate()}>
                            Örnek şablon indir
                        </Button>
                        <Button variant="contained" size="small" onClick={() => bulkFileInputRef.current?.click()}>
                            Dosya seç
                        </Button>
                    </Stack>
                    {bulkImportPreview && (
                        <>
                            {bulkImportPreview.errors.length > 0 && (
                                <Alert severity="warning" sx={{ mb: 1 }}>
                                    Bazı satırlarda uyarı (yine de geçerli satırlar içe aktarılabilir):
                                    <Box
                                        component="ul"
                                        sx={{ m: 0.5, pl: 2, maxHeight: 120, overflow: 'auto', fontSize: '0.8rem' }}
                                    >
                                        {bulkImportPreview.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </Box>
                                </Alert>
                            )}
                            <Typography variant="body2" color="text.secondary">
                                Okunan geçerli satır: <strong>{bulkImportPreview.rows.length}</strong>
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseBulkImport}>İptal</Button>
                    <Button
                        variant="contained"
                        onClick={handleApplyBulkImport}
                        disabled={!bulkImportPreview?.rows.length}
                    >
                        İçe aktar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Ders silme onay diyalogu */}
            <Dialog
                open={!!confirmDeleteSubject}
                onClose={() => setConfirmDeleteSubject(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Dersi Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{confirmDeleteSubject}</strong> dersini silmek istediğinizden emin misiniz?
                    </DialogContentText>
                    <DialogContentText sx={{ mt: 1, color: 'error.main', fontSize: '0.85rem' }}>
                        ⚠️ Bu derse ait tüm konular da kalıcı olarak silinecektir.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteSubject(null)}>İptal</Button>
                    <Button onClick={handleConfirmDeleteSubject} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Konu silme onay diyalogu */}
            <Dialog
                open={!!confirmDeleteTopic}
                onClose={() => setConfirmDeleteTopic(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Konuyu Sil</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        <strong>{confirmDeleteTopic?.name}</strong> konusunu silmek istediğinizden emin misiniz?
                        Bu işlem geri alınamaz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDeleteTopic(null)}>İptal</Button>
                    <Button onClick={handleConfirmDeleteTopic} color="error" variant="contained">
                        Sil
                    </Button>
                </DialogActions>
            </Dialog>
        </Drawer>
    )
}
