import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    IconButton,
    ListItem,
    ListItemIcon,
    CssBaseline,
} from '@mui/material'
import {
    Menu as MenuIcon,
    CalendarToday,
} from '@mui/icons-material'
import type { Subject } from '../types'
import { loadSubjects, loadSubjectTopics } from '../utils/subjectStorage'
import { SubjectPalette } from './SubjectPalette'
import { TopicManagementDialog } from './TopicManagementDialog'

/** Sol çekmece genişliği */
const DRAWER_WIDTH = {
    xs: 240,
    sm: 260,
    md: 280,
    lg: 300,
}

interface LayoutProps {
    children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
    const [mobileOpen, setMobileOpen] = useState(false)
    const [currentDateTime, setCurrentDateTime] = useState(new Date())
    const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects())
    const [subjectTopics, setSubjectTopics] = useState(() => loadSubjectTopics())
    const [managementOpen, setManagementOpen] = useState(false)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date())
        }, 1000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const sync = () => {
            setSubjects(loadSubjects())
            setSubjectTopics(loadSubjectTopics())
        }
        window.addEventListener('subjects-changed', sync)
        return () => window.removeEventListener('subjects-changed', sync)
    }, [])

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen)
    }

    const drawer = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                overflow: 'hidden',
            }}
        >
            <Toolbar
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
                    bgcolor: 'primary.main',
                    color: 'white',
                    minHeight: 56,
                }}
            >
                <ListItemIcon sx={{ color: 'white' }}>
                    <CalendarToday />
                </ListItemIcon>
                <Typography variant="h6" component="div" sx={{ fontWeight: 700 }}>
                    Ders Programı
                </Typography>
            </Toolbar>
            <List
                sx={{
                    py: 0,
                    flex: 1,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {/*
                <ListItem disablePadding>
                    <ListItemButton
                        sx={{
                            '&:hover': {
                                backgroundColor: 'action.hover',
                            },
                        }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main' }}>
                            <CalendarToday />
                        </ListItemIcon>
                        <ListItemText primary="Ders Programı" />
                    </ListItemButton>
                </ListItem>
                */}
                <ListItem
                    disablePadding
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'stretch',
                        overflow: 'hidden',
                    }}
                >
                    <SubjectPalette
                        subjects={subjects}
                        subjectTopics={subjectTopics}
                        onManageClick={() => setManagementOpen(true)}
                    />
                </ListItem>
            </List>
            <Box
                sx={{
                    p: 2,
                    borderTop: '1px solid rgba(192, 14, 14, 0.12)',
                    bgcolor: 'grey.50',
                    flexShrink: 0,
                }}
            >
                <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mb: 0.5 }}>
                    {currentDateTime.toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {currentDateTime.toLocaleTimeString('tr-TR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                </Typography>
            </Box>
        </Box>
    )

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: {
                        sm: `calc(100% - ${DRAWER_WIDTH.sm}px)`,
                        md: `calc(100% - ${DRAWER_WIDTH.md}px)`,
                        lg: `calc(100% - ${DRAWER_WIDTH.lg}px)`,
                    },
                    ml: {
                        sm: `${DRAWER_WIDTH.sm}px`,
                        md: `${DRAWER_WIDTH.md}px`,
                        lg: `${DRAWER_WIDTH.lg}px`,
                    },
                    bgcolor: 'background.paper',
                    color: 'text.primary',
                    borderBottom: '1px solid rgb(226, 232, 240)',
                    boxShadow: 'none',
                    '@media print': {
                        display: 'none',
                    },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                        Haftalık Ders Programı
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{
                    width: {
                        sm: DRAWER_WIDTH.sm,
                        md: DRAWER_WIDTH.md,
                        lg: DRAWER_WIDTH.lg,
                    },
                    flexShrink: { sm: 0 },
                    '@media print': {
                        display: 'none',
                    },
                }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH.xs,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: {
                                sm: DRAWER_WIDTH.sm,
                                md: DRAWER_WIDTH.md,
                                lg: DRAWER_WIDTH.lg,
                            },
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            borderTopLeftRadius: 0,
                            borderTopRightRadius: 0,
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    pt: 1,
                    px: 3,
                    pb: 3,
                    width: {
                        sm: `calc(100% - ${DRAWER_WIDTH.sm}px)`,
                        md: `calc(100% - ${DRAWER_WIDTH.md}px)`,
                        lg: `calc(100% - ${DRAWER_WIDTH.lg}px)`,
                    },
                    bgcolor: 'background.default',
                    '@media print': {
                        width: '100%',
                        pt: 0,
                        px: 0,
                        pb: 0,
                        margin: 0,
                        padding: 0,
                    },
                }}
            >
                <Toolbar
                    sx={{
                        '@media print': {
                            display: 'none',
                            height: 0,
                            minHeight: 0,
                        },
                    }}
                />
                {children}
            </Box>

            <TopicManagementDialog
                open={managementOpen}
                onClose={() => {
                    setManagementOpen(false)
                    setSubjects(loadSubjects())
                    setSubjectTopics(loadSubjectTopics())
                }}
                onSubjectsChange={() => {
                    window.dispatchEvent(new Event('subjects-changed'))
                }}
            />
        </Box>
    )
}
