import { createContext, useContext, useState, type ReactNode } from 'react'
import { Snackbar, Alert, Stack } from '@mui/material'

type NotificationSeverity = 'success' | 'error' | 'info' | 'warning'

interface NotificationItem {
  id: string
  message: string
  severity: NotificationSeverity
  open: boolean
}

interface NotificationContextType {
  showNotification: (message: string, severity: NotificationSeverity) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = (message: string, severity: NotificationSeverity) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2, 11)
    const newNotification: NotificationItem = {
      id,
      message,
      severity,
      open: true,
    }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-close after 5 seconds
    setTimeout(() => {
      handleClose(id)
    }, 5000)
  }

  const handleClose = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, open: false } : notification
      )
    )

    // Remove from array after animation completes
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, 300)
  }

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Stack
        spacing={1}
        sx={{
          position: 'fixed',
          bottom: { xs: 16, sm: 24 },
          left: '50%',
          zIndex: 9999,
          maxWidth: { xs: '90vw', sm: 400 },
          width: '100%',
          transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
          '@media print': {
            display: 'none',
          },
          '@keyframes slideUp': {
            '0%': {
              transform: 'translateX(-50%) translateY(20px)',
              opacity: 0,
            },
            '100%': {
              transform: 'translateX(-50%) translateY(0)',
              opacity: 1,
            },
          },
          animation: 'slideUp 0.7s ease-out',
        }}
      >
        {notifications.map((notification, index) => (
          <Snackbar
            key={notification.id}
            open={notification.open}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            sx={{
              position: 'static',
              transform: 'none',
              '& .MuiSnackbarContent-root': {
                transform: `translateY(${index * -8}px)`,
                transition: 'transform 0.3s ease-in-out',
              },
            }}
          >
            <Alert
              onClose={() => handleClose(notification.id)}
              severity={notification.severity}
              variant="filled"
              sx={{
                width: '100%',
                minWidth: { xs: '90vw', sm: 400 },
                boxShadow: 3,
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              {notification.message}
            </Alert>
          </Snackbar>
        ))}
      </Stack>
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

