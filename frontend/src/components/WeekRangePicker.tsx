import { useState } from 'react'
import { Box, Popover, Button, Typography, IconButton } from '@mui/material'
import { ChevronLeft, ChevronRight, CalendarMonth } from '@mui/icons-material'

interface WeekRangePickerProps {
  startDate: Date
  onChange: (newStart: Date) => void
}

const WEEKDAY_LABELS = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']

const isSameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const isInRange = (date: Date, rangeStart: Date): boolean => {
  const s = new Date(rangeStart)
  s.setHours(0, 0, 0, 0)
  const e = new Date(s)
  e.setDate(e.getDate() + 6)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d >= s && d <= e
}

export const WeekRangePicker = ({ startDate, onChange }: WeekRangePickerProps) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const [viewYear, setViewYear] = useState(startDate.getFullYear())
  const [viewMonth, setViewMonth] = useState(startDate.getMonth())
  const [hoverDate, setHoverDate] = useState<Date | null>(null)

  const open = Boolean(anchorEl)

  const endDate = new Date(startDate)
  endDate.setDate(endDate.getDate() + 6)

  const handleOpen = (e: React.MouseEvent<HTMLElement>) => {
    setViewYear(startDate.getFullYear())
    setViewMonth(startDate.getMonth())
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setHoverDate(null)
  }

  const handleDayClick = (date: Date) => {
    onChange(new Date(date))
    handleClose()
  }

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const buildCalendarDays = (): (Date | null)[] => {
    const firstDay = new Date(viewYear, viewMonth, 1)
    const startOffset = (firstDay.getDay() + 6) % 7 // Mon=0 ... Sun=6
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const cells: (Date | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(viewYear, viewMonth, d))
    }
    return cells
  }

  const cells = buildCalendarDays()
  const activeStart = hoverDate ?? startDate

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('tr-TR', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<CalendarMonth />}
        onClick={handleOpen}
        sx={{ minWidth: 230 }}
      >
        {startDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        {' – '}
        {endDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
      >
        <Box sx={{ p: 2, width: 300, userSelect: 'none' }}>
          {/* Month navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
            <IconButton size="small" onClick={prevMonth}>
              <ChevronLeft />
            </IconButton>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, textTransform: 'capitalize' }}
            >
              {monthLabel}
            </Typography>
            <IconButton size="small" onClick={nextMonth}>
              <ChevronRight />
            </IconButton>
          </Box>

          {/* Day-of-week headers */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', mb: 0.5 }}>
            {WEEKDAY_LABELS.map((label) => (
              <Typography
                key={label}
                variant="caption"
                sx={{
                  textAlign: 'center',
                  fontWeight: 700,
                  color: 'text.secondary',
                  py: 0.5,
                }}
              >
                {label}
              </Typography>
            ))}
          </Box>

          {/* Calendar day cells */}
          <Box
            sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}
            onMouseLeave={() => setHoverDate(null)}
          >
            {cells.map((date, i) => {
              if (!date) return <Box key={`empty-${i}`} />

              const inActiveRange = isInRange(date, activeStart)
              const activeEnd = new Date(activeStart)
              activeEnd.setDate(activeEnd.getDate() + 6)
              const isStart = isSameDay(date, activeStart)
              const isEnd = isSameDay(date, activeEnd)

              let borderRadius = '0'
              if (isStart && isEnd) borderRadius = '50%'
              else if (isStart) borderRadius = '50% 0 0 50%'
              else if (isEnd) borderRadius = '0 50% 50% 0'

              return (
                <Box
                  key={date.toISOString()}
                  onClick={() => handleDayClick(date)}
                  onMouseEnter={() => setHoverDate(new Date(date))}
                  sx={{
                    textAlign: 'center',
                    py: 0.75,
                    cursor: 'pointer',
                    bgcolor: inActiveRange ? 'primary.main' : 'transparent',
                    color: inActiveRange ? 'primary.contrastText' : 'text.primary',
                    borderRadius,
                    fontWeight: isStart ? 700 : 400,
                    fontSize: 13,
                    transition: 'background-color 0.08s',
                    '&:hover': { opacity: 0.85 },
                  }}
                >
                  {date.getDate()}
                </Box>
              )
            })}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1.5, display: 'block', textAlign: 'center' }}
          >
            Başlangıç gününe tıklayın · 7 günlük aralık seçilir
          </Typography>
        </Box>
      </Popover>
    </>
  )
}
