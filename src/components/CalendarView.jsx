import { useState } from 'react'
import { Calendar, Trophy, Award, Target, TrendingUp, Activity, Medal, Zap } from 'lucide-react'

const medalClass = {
  gold: 'cal-day held',
  silver: 'cal-day silver',
  bronze: 'cal-day bronze',
  fail: 'cal-day fail',
}

const medalEmoji = {
  gold: '🥇',
  silver: '🥈',
  bronze: '🥉',
  fail: '💀',
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay()
}

export default function CalendarView({ cumulative, date, goldNotifiedDate }) {
  const [view, setView] = useState('month')
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()
  const currentDay = now.getDate()

  const year = currentYear
  const month = currentMonth

  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDay(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const [today, setToday] = useState(date)

  const handlePrev = () => {
    if (month === 0) {
      setToday(new Date(year - 1, 11, 1).toISOString().slice(0, 10))
      setView('month')
    } else {
      setToday(new Date(year, month - 1, 1).toISOString().slice(0, 10))
      setView('month')
    }
  }

  const handleNext = () => {
    if (month === 11) {
      setToday(new Date(year + 1, 0, 1).toISOString().slice(0, 10))
      setView('month')
    } else {
      setToday(new Date(year, month + 1, 1).toISOString().slice(0, 10))
      setView('month')
    }
  }

  const handleDayClick = (day) => {
    const d = new Date(year, month, day)
    setToday(d.toISOString().slice(0, 10))
  }

  const getDayMedal = (day) => {
    const key = today === new Date(year, month, day).toISOString().slice(0, 10) ? 'current' : 'historical'
    // For simplicity, return null - we'd need full history
    return null
  }

  const medalFromTotal = (total) => {
    if (total >= 99.99) return 'gold'
    if (total >= 75) return 'silver'
    if (total >= 50) return 'bronze'
    return 'fail'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">
          {new Date(year, month).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={handlePrev}>←</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setToday(new Date().toISOString().slice(0, 10))}>Hoy</button>
          <button className="btn btn-secondary btn-sm" onClick={handleNext}>→</button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4 text-sm">
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#ffd700]/20 border border-[#ffd700]/40 text-[#ffd700]" /> Oro</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#c0c0c0]/20 border border-[#c0c0c0]/30 text-[#c0c0c0]" /> Plata</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#cd7f32]/20 border border-[#cd7f32]/40 text-[#cd7f32]" /> Bronce</span>
        <span className="flex items-center gap-2"><span className="w-4 h-4 rounded-full bg-[#ff453a]/20 border border-[#ff453a]/40 text-[#ff453a]" /> Fallido</span>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1.5 mb-2">
        {['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'].map((d) => (
          <div key={d} className="text-center text-xs font-bold text-[#6a6a7a] py-1">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="cal-day disabled"></div>
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const todayKey = new Date(year, month, day).toISOString().slice(0, 10)
          const isToday = todayKey === today
          // Use cumulative as proxy for medal status
          const total = cumulative && cumulative.totalDays > 0 ? cumulative.totalDays : 0
          return (
            <button
              key={day}
              className={`cal-day ${isToday ? 'today' : ''} ${medalClass[medalFromTotal(total)] || ''}`}
              onClick={() => handleDayClick(day)}
            >
              <span className="day-num">{day}</span>
              {total > 0 && (
                <span className="medal-dot">{medalEmoji[medalFromTotal(total)]}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="stat-card">
          <div className="stat-label">Días totales</div>
          <div className="stat-value">{cumulative?.totalDays || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Racha activa</div>
          <div className="stat-value text-[#00ff88] text-xl">{cumulative?.activeStreak || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Récord de racha</div>
          <div className="stat-value text-[#ffd700] text-xl">{cumulative?.bestStreak || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Días con Oro</div>
          <div className="stat-value text-[#ffd700] text-xl">{cumulative?.goldDays || 0}</div>
        </div>
      </div>

      {/* Vitrina de logros */}
      <div className="mt-6 p-4 bg-[#141418] rounded-2xl border border-[#23232e]">
        <div className="text-sm font-bold text-[#00ff88] mb-3">🏆 Vitrina de logros</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-[#1c1c24] rounded-xl text-center">
            <Target size={24} className="mx-auto mb-2 text-[#00ff88]" />
            <div className="font-bold">1.000 Flexiones</div>
            <div className="text-xs text-[#6a6a7a]">Acumuladas</div>
          </div>
          <div className="p-3 bg-[#1c1c24] rounded-xl text-center">
            <TrendingUp size={24} className="mx-auto mb-2 text-[#00d4b8]" />
            <div className="font-bold">50 km</div>
            <div className="text-xs text-[#6a6a7a]">Recorridos</div>
          </div>
          <div className="p-3 bg-[#1c1c24] rounded-xl text-center">
            <Trophy size={24} className="mx-auto mb-2 text-[#ffd700]" />
            <div className="font-bold">7 días seguidos de Oro</div>
            <div className="text-xs text-[#6a6a7a]">Racha múltiple</div>
          </div>
          <div className="p-3 bg-[#1c1c24] rounded-xl text-center">
            <Medal size={24} className="mx-auto mb-2 text-[#cd7f32]" />
            <div className="font-bold">30 días Operación Verano</div>
            <div className="text-xs text-[#6a6a7a]">Dedicación</div>
          </div>
        </div>
      </div>
    </div>
  )
}
