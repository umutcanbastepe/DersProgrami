import { useState } from 'react'
import {
    Box,
    Typography,
    Chip,
    IconButton,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Tooltip,
    Button,
    Badge,
} from '@mui/material'
import {
    ExpandMore,
    ExpandLess,
    DragIndicator,
    Settings,
    MenuBook,
    Palette as PaletteIcon,
    VisibilityOff,
    Visibility,
} from '@mui/icons-material'
import type { Subject, Topic, SubjectTopics } from '../types'
import { getSubjectColor } from '../utils/colors'
import type { DragData } from '../utils/colors'
import { setSubjectColor } from '../utils/subjectStorage'

interface SubjectPaletteProps {
    subjects: Subject[]
    subjectTopics: SubjectTopics
    onManageClick: () => void
}

export const SubjectPalette = ({
    subjects,
    subjectTopics,
    onManageClick,
}: SubjectPaletteProps) => {
    const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set())
    const [colorTick, setColorTick] = useState(0)
    const [listOpen, setListOpen] = useState(true)

    const allExpanded = subjects.length > 0 && subjects.every((s) => expandedSubjects.has(s))

    const toggleAll = () => {
        if (allExpanded) {
            setExpandedSubjects(new Set())
        } else {
            setExpandedSubjects(new Set(subjects))
        }
    }

    const startSubjectDrag = (e: React.DragEvent, subject: Subject) => {
        const color = getSubjectColor(subject, subjects)
        const data: DragData = { subjectName: subject, color }
        e.dataTransfer.setData('application/json', JSON.stringify(data))
        e.dataTransfer.effectAllowed = 'copy'
    }

    const startTopicDrag = (e: React.DragEvent, subject: Subject, topic: Topic) => {
        e.stopPropagation()
        const color = getSubjectColor(subject, subjects)
        const data: DragData = { subjectName: subject, topicId: topic.id, color }
        e.dataTransfer.setData('application/json', JSON.stringify(data))
        e.dataTransfer.effectAllowed = 'copy'
    }

    return (
        <Box
            data-color-version={colorTick}
            sx={{
                width: '100%',
                height: '100%',
                minWidth: 0,
                minHeight: 0,
                flex: 1,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                '@media print': { display: 'none' },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: 'primary.main',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <PaletteIcon sx={{ fontSize: 18, flexShrink: 0 }} />
                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                        Ders Paleti
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
                    <Tooltip title="Ders Yönetimi">
                        <IconButton
                            size="small"
                            sx={{ color: 'primary.main', '&:hover': { color: 'primary.main' } }}
                            onClick={onManageClick}
                        >
                            <Settings fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={allExpanded ? 'Tüm konuları kapat' : 'Tüm konuları aç'}>
                        <IconButton
                            size="small"
                            sx={{ color: 'primary.main', '&:hover': { color: 'primary.main' } }}
                            onClick={toggleAll}
                            aria-expanded={allExpanded}
                            aria-label={allExpanded ? 'Tüm dersleri kapat' : 'Tüm dersleri aç'}
                        >
                            {allExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={listOpen ? 'Dersleri gizle' : 'Dersleri göster'}>
                        <IconButton
                            size="small"
                            sx={{ color: 'primary.main', '&:hover': { color: 'primary.main' } }}
                            onClick={() => setListOpen((v) => !v)}
                            aria-expanded={listOpen}
                            aria-label={listOpen ? 'Ders listesini gizle' : 'Ders listesini göster'}
                        >
                            {listOpen ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Subject list — CSS grid trick ile smooth açılıp kapanır */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateRows: listOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                    flex: 1,
                    minHeight: 0,
                }}
            >
                <Box
                    sx={{
                        minHeight: 0,
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                    }}
                >
                    {subjects.length === 0 ? (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <MenuBook sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                                Henüz ders eklenmemiş.
                            </Typography>
                            <Button size="small" variant="outlined" onClick={onManageClick}>
                                Ders Ekle
                            </Button>
                        </Box>
                    ) : (
                        subjects.map((subject) => {
                            const color = getSubjectColor(subject, subjects)
                            const topics: Topic[] = subjectTopics[subject] ?? []

                            return (
                                <Accordion
                                    key={subject}
                                    expanded={expandedSubjects.has(subject)}
                                    onChange={(_, isExpanded) =>
                                        setExpandedSubjects((prev) => {
                                            const next = new Set(prev)
                                            if (isExpanded) next.add(subject)
                                            else next.delete(subject)
                                            return next
                                        })
                                    }
                                    disableGutters
                                    elevation={0}
                                    sx={{
                                        '&:before': { display: 'none' },
                                        borderBottom: '1px solid',
                                        borderColor: 'divider',
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={topics.length > 0 ? <ExpandMore sx={{ fontSize: 18 }} /> : undefined}
                                        draggable
                                        onDragStart={(e) => startSubjectDrag(e, subject)}
                                        sx={{
                                            px: 1.5,
                                            minHeight: 44,
                                            cursor: 'grab',
                                            '&:hover': { bgcolor: 'action.hover' },
                                            '&:active': { cursor: 'grabbing' },
                                            '& .MuiAccordionSummary-content': { margin: '8px 0' },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                                flex: 1,
                                                minWidth: 0,
                                            }}
                                        >
                                            <DragIndicator
                                                sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }}
                                            />
                                            <Tooltip title="Renk seçmek için tıklayın" placement="top">
                                                <Box
                                                    component="label"
                                                    htmlFor={`subject-color-${encodeURIComponent(subject)}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onMouseDown={(e) => e.stopPropagation()}
                                                    sx={{
                                                        position: 'relative',
                                                        width: 18,
                                                        height: 18,
                                                        flexShrink: 0,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <input
                                                        type="color"
                                                        id={`subject-color-${encodeURIComponent(subject)}`}
                                                        value={color}
                                                        onChange={(e) => {
                                                            setSubjectColor(subject, e.target.value)
                                                            setColorTick((t) => t + 1)
                                                            window.dispatchEvent(new Event('subject-colors-changed'))
                                                        }}
                                                        style={{
                                                            position: 'absolute',
                                                            opacity: 0,
                                                            width: '100%',
                                                            height: '100%',
                                                            cursor: 'pointer',
                                                            zIndex: 1,
                                                        }}
                                                    />
                                                    <Box
                                                        sx={{
                                                            width: 10,
                                                            height: 10,
                                                            borderRadius: '50%',
                                                            bgcolor: color,
                                                            pointerEvents: 'none',
                                                            boxShadow: `0 0 0 2px ${color}44`,
                                                        }}
                                                    />
                                                </Box>
                                            </Tooltip>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 600,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flex: 1,
                                                }}
                                            >
                                                {subject}
                                            </Typography>
                                            {topics.length > 0 && (
                                                <Badge
                                                    badgeContent={topics.length}
                                                    sx={{
                                                        mr: 0.5,
                                                        flexShrink: 0,
                                                        '& .MuiBadge-badge': {
                                                            position: 'static',
                                                            transform: 'none',
                                                            fontSize: '0.65rem',
                                                            minWidth: 18,
                                                            height: 18,
                                                            bgcolor: `${color}33`,
                                                            color: 'text.secondary',
                                                            borderRadius: 4,
                                                        },
                                                    }}
                                                />
                                            )}
                                        </Box>
                                    </AccordionSummary>

                                    {topics.length > 0 && (
                                        <AccordionDetails
                                            sx={{
                                                px: 1.5,
                                                py: 1,
                                                bgcolor: 'grey.50',
                                                borderTop: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                {topics.map((topic) => (
                                                    <Chip
                                                        key={topic.id}
                                                        label={topic.name}
                                                        size="small"
                                                        draggable
                                                        onDragStart={(e) => startTopicDrag(e, subject, topic)}
                                                        sx={{
                                                            bgcolor: `${color}1a`,
                                                            border: `1px solid ${color}66`,
                                                            cursor: 'grab',
                                                            fontSize: '0.7rem',
                                                            height: 22,
                                                            transition: 'transform 0.1s, box-shadow 0.1s',
                                                            '&:hover': {
                                                                bgcolor: `${color}33`,
                                                                boxShadow: `0 2px 6px ${color}44`,
                                                                transform: 'translateY(-1px)',
                                                            },
                                                            '&:active': { cursor: 'grabbing' },
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </AccordionDetails>
                                    )}
                                </Accordion>
                            )
                        })
                    )}
                </Box>
                </Box>
            </Box>
        </Box>
    )
}
