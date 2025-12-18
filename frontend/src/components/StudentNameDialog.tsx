import { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
} from '@mui/material'

interface StudentNameDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: (studentName: string) => void
    weekRange: string
}

export const StudentNameDialog = ({ open, onClose, onConfirm, weekRange }: StudentNameDialogProps) => {
    const [studentName, setStudentName] = useState('')
    const [error, setError] = useState(false)

    const handleConfirm = () => {
        const trimmedName = studentName.trim()
        if (!trimmedName) {
            setError(true)
            return
        }
        onConfirm(trimmedName)
        setStudentName('')
        setError(false)
    }

    const handleClose = () => {
        setStudentName('')
        setError(false)
        onClose()
    }

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Öğrenci Adı</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    PDF dosyası için öğrenci adını girin
                </Typography>
                <TextField
                    autoFocus
                    fullWidth
                    label="Öğrenci Adı"
                    value={studentName}
                    onChange={(e) => {
                        setStudentName(e.target.value)
                        setError(false)
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleConfirm()
                        }
                    }}
                    error={error}
                    helperText={error ? 'Öğrenci adı gereklidir' : ''}
                    placeholder="Örn: Umut"
                />
                <Typography variant="caption" sx={{ mt: 2, display: 'block', color: 'text.secondary' }}>
                    Dosya adı: {weekRange}_{studentName || 'öğrenci'}_calisma_programi.pdf
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>İptal</Button>
                <Button onClick={handleConfirm} variant="contained">
                    PDF Oluştur
                </Button>
            </DialogActions>
        </Dialog>
    )
}

