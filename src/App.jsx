import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Minus, RotateCcw, Flame, DollarSign, Scale, TrendingUp, Target, Calendar, Award, Zap, Bell, BellOff, Settings, Trash2, Download, Upload, CheckCircle, XCircle, AlertTriangle, Clock, TrendingDown, Activity, Weight, Target as TargetIcon, Heart } from 'lucide-react'
import TodayPanel from './components/TodayPanel.jsx'
import CalendarView from './components/CalendarView.jsx'
import StatsSettings from './components/StatsSettings.jsx'

// ---------- DATE HELPERS ----------
const TODAY = new Date()
const EUROPE_MADRID = 'Europe/Madrid'

// Custom date formatter: yyyy-MM-dd (compatible with all browsers)
function formatDate(date) {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, 0)
  return `${yyyy}-${mm}-${dd}`
}

function getMadridTime() {
  return new Date()
}

// ---------- STORAGE ----------
const LS = {
  get(key) { try { return localStorage.getItem(key) } catch { return null } },
  set(key, val) { try { localStorage.setItem(key, val) } catch {} },
  del(key) { try { localStorage.removeItem(key) } catch {} },
}

const STORAGE_KEYS = {
  state: 'ov_state',
  weight: 'ov_weight',
  weightHistory: 'ov_weight_history',
  goldNotified: 'ov_gold_notified',
  goldRevoked: 'ov_gold_revoked',
  cumulative: 'ov_cumulative',
  lastGoldDate: 'ov_last_gold_date',
  notificationsSupported: 'ov_notifications_supported',
}

function loadState() {
  const raw = LS.get(STORAGE_KEYS.state)
  if (raw) {
    try {
      let s = JSON.parse(raw)
      // MIGRACIÓN: formato anterior (v1) tenía absExercises y braExercises como arrays de booleans
      // [false, false, false] en vez de [{name, series: [false, false, false]}, ...]
      if (Array.isArray(s.absExercises) && s.absExercises.length === 3 && typeof s.absExercises[0] === 'boolean') {
        s.absExercises = [
          { name: '1. Crunch abdominal 3x25', series: [s.absExercises[0], false, false] },
          { name: '2. Elevaciones de piernas 3x15', series: [s.absExercises[1], false, false] },
          { name: '3. Plancha abdominal 3x45s', series: [s.absExercises[2], false, false] },
        ]
      }
      if (Array.isArray(s.braExercises) && s.braExercises.length === 3 && typeof s.braExercises[0] === 'boolean') {
        s.braExercises = [
          { name: '1. Agarre / hand-grip 3x30s', series: [s.braExercises[0], false, false] },
          { name: '2. Fondos 3x12', series: [s.braExercises[1], false, false] },
          { name: '3. Curl bíceps 3x15', series: [s.braExercises[2], false, false] },
        ]
      }
      // Also merge with cumulative if present (compatibilidad con versiones anteriores)
      if (!s.cumulative && LS.get(STORAGE_KEYS.cumulative)) {
        s.cumulative = JSON.parse(LS.get(STORAGE_KEYS.cumulative))
      }
      return s
    } catch { return null }
  }
  return null
}

function saveState(state) {
  LS.set(STORAGE_KEYS.state, JSON.stringify(state))
}

function loadCumulative() {
  const raw = LS.get(STORAGE_KEYS.cumulative)
  if (raw) {
    try { return JSON.parse(raw) } catch { return null }
  }
  return { flexions: 0, km: 0, abSeries: 0, braSeries: 0, goldDays: 0, silverDays: 0, bronzeDays: 0, failDays: 0, goldStreak: 0, bestStreak: 0, activeStreak: 0, totalDays: 0 }
}

function saveCumulative(c) {
  LS.set(STORAGE_KEYS.cumulative, JSON.stringify(c))
}

function loadWeight() {
  const raw = LS.get(STORAGE_KEYS.weight)
  return raw ? parseFloat(raw) : null
}

function loadWeightHistory() {
  const raw = LS.get(STORAGE_KEYS.weightHistory)
  return raw ? JSON.parse(raw) : []
}

function saveWeightHistory(arr) {
  LS.set(STORAGE_KEYS.weightHistory, JSON.stringify(arr))
}

// ---------- ERROR BOUNDARY ----------
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('OPERACIÓN VERANO | Error capturado:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="app-container min-h-screen flex flex-col items-center justify-center bg-[#0a0a0c] text-[#e8e8ee] p-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold mb-2">La app falló inesperadamente</h1>
            <p className="text-[#6a6a7a] mb-6">
              Ha ocurrido un error inesperado. Recarga la página o reinicia la app.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="btn btn-primary btn-xl"
            >
              🔄 Recargar aplicación
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

// ---------- INITIAL STATE ----------
function App() {
  const [activeTab, setActiveTab] = useState('today')
  const [state, setState] = useState(() => {
    const s = loadState()
    if (s) return s
    return {
      flexions: 0,
      km: 0,
      seriesAbs: 0,
      seriesBra: 0,
      absExercises: [
        { name: '1. Crunch abdominal 3x25', series: [false, false, false] },
        { name: '2. Elevaciones de piernas 3x15', series: [false, false, false] },
        { name: '3. Plancha abdominal 3x45s', series: [false, false, false] },
      ],
      braExercises: [
        { name: '1. Agarre / hand-grip 3x30s', series: [false, false, false] },
        { name: '2. Fondos 3x12', series: [false, false, false] },
        { name: '3. Curl bíceps 3x15', series: [false, false, false] },
      ],
      date: formatDate(TODAY),
      completed: false,
      medal: null,
      medalObtained: null,
      warning: null,
      tempo: 'normal',
      weight: loadWeight(),
      weights: loadWeightHistory(),
      goldNotifiedDate: loadState()?.goldNotifiedDate || '',
      cumulative: loadCumulative(),
    }
  })

  // Persist state
  useEffect(() => {
    saveState(state)
  }, [state])

  // Persist cumulative
  useEffect(() => {
    saveCumulative(state.cumulative)
  }, [state.cumulative])

  // Update date at midnight
  useEffect(() => {
    const checkDate = () => {
      const today = formatDate(getMadridTime())
      if (today !== state.date) {
        handleNewDay(today)
      }
    }
    checkDate()
    const id = setInterval(() => {
      const today = formatDate(getMadridTime())
      if (today !== state.date) {
        handleNewDay(today)
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [state.date])

  const handleNewDay = (newDate) => {
    const prevFlections = state.flexions
    const prevKm = state.km
    const prevAbs = state.seriesAbs
    const prevBra = state.seriesBra
    setState((prev) => ({
      ...prev,
      date: newDate,
      flexions: 0,
      km: 0,
      seriesAbs: 0,
      seriesBra: 0,
      completed: false,
      medal: null,
      medalObtained: null,
      warning: null,
      absExercises: [
        { name: '1. Crunch abdominal 3x25', series: [false, false, false] },
        { name: '2. Elevaciones de piernas 3x15', series: [false, false, false] },
        { name: '3. Plancha abdominal 3x45s', series: [false, false, false] },
      ],
      braExercises: [
        { name: '1. Agarre / hand-grip 3x30s', series: [false, false, false] },
        { name: '2. Fondos 3x12', series: [false, false, false] },
        { name: '3. Curl bíceps 3x15', series: [false, false, false] },
      ],
      goldNotifiedDate: '',
    }))
    // Update cumulative
    setState((prev) => ({
      ...prev,
      cumulative: {
        ...prev.cumulative,
        totalDays: prev.cumulative.totalDays + 1,
        flexions: prev.cumulative.flexions,
        km: prev.cumulative.km,
        abSeries: prev.cumulative.abSeries,
        braSeries: prev.cumulative.braSeries,
      }
    }))
  }

  // ---------- GOAL HELPERS ----------
  const addFlexion = (n) => {
    setState((prev) => ({ ...prev, flexions: prev.flexions + n }))
  }

  const setFlexion = (v) => {
    setState((prev) => ({ ...prev, flexions: Math.max(0, Math.min(1000, v)) }))
  }

  const addKm = (n) => {
    setState((prev) => ({ ...prev, km: Math.round((prev.km + n) * 10) / 10 }))
  }

  const setKm = (v) => {
    setState((prev) => ({ ...prev, km: Math.max(0, Math.min(100, v)) }))
  }

  const toggleAbsSeries = (exerciseIndex, seriesIndex) => {
    setState((prev) => {
      const newAbs = prev.absExercises.map((ex, idx) =>
        idx === exerciseIndex
          ? { ...ex, series: ex.series.map((s, j) => j === seriesIndex ? !s : s) }
          : ex
      )
      const newCount = newAbs.reduce((sum, ex) => sum + ex.series.filter(Boolean).length, 0)
      return { ...prev, absExercises: newAbs, seriesAbs: newCount }
    })
  }

  const toggleBraSeries = (exerciseIndex, seriesIndex) => {
    setState((prev) => {
      const newBra = prev.braExercises.map((ex, idx) =>
        idx === exerciseIndex
          ? { ...ex, series: ex.series.map((s, j) => j === seriesIndex ? !s : s) }
          : ex
      )
      const newCount = newBra.reduce((sum, ex) => sum + ex.series.filter(Boolean).length, 0)
      return { ...prev, braExercises: newBra, seriesBra: newCount }
    })
  }

  const resetDay = () => {
    setState((prev) => ({
      ...prev,
      flexions: 0,
      km: 0,
      seriesAbs: 0,
      seriesBra: 0,
      completed: false,
      medal: null,
      warning: null,
      absExercises: [
        { name: '1. Crunch abdominal 3x25', series: [false, false, false] },
        { name: '2. Elevaciones de piernas 3x15', series: [false, false, false] },
        { name: '3. Plancha abdominal 3x45s', series: [false, false, false] },
      ],
      braExercises: [
        { name: '1. Agarre / hand-grip 3x30s', series: [false, false, false] },
        { name: '2. Fondos 3x12', series: [false, false, false] },
        { name: '3. Curl bíceps 3x15', series: [false, false, false] },
      ],
    }))
  }

  // ---------- CALCULATIONS ----------
  const pctFlexion = Math.min(100, (state.flexions / 100) * 100)
  const pctKm = Math.min(100, (state.km / 5) * 100)
  const pctAbs = state.seriesAbs >= 9 ? 100 : Math.min(100, (state.seriesAbs / 9) * 100)
  const pctBra = state.seriesBra >= 3 ? 100 : Math.min(100, (state.seriesBra / 3) * 100)

  const totalPct = (pctFlexion + pctKm + pctAbs + pctBra) / 4

  const medal = () => {
    if (totalPct >= 99.99) return 'gold'
    if (totalPct >= 75) return 'silver'
    if (totalPct >= 50) return 'bronze'
    return 'fail'
  }

  const medalEmoji = () => {
    const m = medal()
    const map = { gold: '🥇', silver: '🥈', bronze: '🥉', fail: '💀' }
    return map[m]
  }

  const medalLabel = () => {
    const m = medal()
    const map = { gold: 'MEDALLA DE ORO', silver: 'MEDALLA DE PLATA', bronze: 'MEDALLA DE BRONCE', fail: 'DÍA FALLIDO' }
    return map[m]
  }

  const medalColor = () => {
    const m = medal()
    const map = { gold: 'medal-gold', silver: 'medal-silver', bronze: 'medal-bronze', fail: 'medal-fail' }
    return map[m]
  }

  // Tempo check
  const checkTempo = () => {
    const now = getMadridTime()
    const h = now.getHours()
    const m = now.getMinutes()
    const mins = h * 60 + m

    if (mins < 600) { // before 10:00
      if (state.flexions < 50 || state.km < 2.5) {
        return "🔴 Vas retrasado: deberías llevar al menos 50 flexiones y 2.5 km. ¡Los 100 flexiones y 5 km no se logran a última hora!"
      }
    } else if (mins < 900) { // 10:00-15:00
      const fNeed = Math.max(0, 100 - state.flexions)
      const kNeed = Math.max(0, 5 - state.km)
      const fRate = Math.ceil(fNeed / 4)
      const kRate = Math.ceil(kNeed / 4)
      if (fNeed > 20 || kNeed > 1) {
        return `🟡 Vas retrasado: necesitas ${fRate}/hora de flexionas y ${kRate}/hora de km. ¡Paciencia, pero ve rápido!`
      }
    } else {
      if (state.flexions < 100 || state.km < 5) {
        return "🔴 Vas retrasado: ya casi es la hora. ¡100 flexiones y 5 km te hacen la Medalla de Oro!"
      }
    }
    return null
  }

  const currentWarning = checkTempo()

  // ---------- NOTIFICATIONS ----------
  const [notifPermission, setNotifPermission] = useState(null)
  const [registrationLoading, setRegistrationLoading] = useState(false)
  const [pushRegistered, setPushRegistered] = useState(false)
  const [pushPhase, setPushPhase] = useState(null)
  const [pushError, setPushError] = useState(null)

  const checkNotifications = useCallback(async () => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission)
    }
  }, [])

  useEffect(() => {
    checkNotifications()
  }, [checkNotifications])

  const requestNotificationPermission = async () => {
    if (Notification.permission === 'default') {
      const res = await Notification.requestPermission()
      setNotifPermission(res)
    }
  }

    const registerPush = async () => {
    if (!('serviceWorker' in navigator)) {
      setPushError('Tu navegador no soporta service workers.')
      setPushPhase('error')
      return
    }
    if (Notification.permission !== 'granted') {
      setPushError(null)
      setPushPhase('permisos')
      const res = await Notification.requestPermission()
      setNotifPermission(res)
      if (Notification.permission !== 'granted') {
        setPushError('Necesitas aceptar notificaciones para recibir recordatorios.')
        setPushPhase('error')
        return
      }
    }
    setPushPhase('registro')
    setRegistrationLoading(true)
    setPushError(null)
    try {
      const sw = await navigator.serviceWorker.ready
      const sub = await sw.pushManager.getSubscription()
      if (sub) {
        setPushRegistered(true)
        setPushPhase('done')
        setRegistrationLoading(false)
        return
      }
      // VAPID fallback: la clave publica no es secreta, podemos inyectarla directo
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY ||
        import.meta.env.VAPID_PUBLIC_KEY ||
        'BD4UAnG28rBj-_O-1Xff0ZSGRWAOy4eEhxSa5fdN3tfU1NdY3pgyDA9h3dKb_DJeWCCqrbGKdVRfUckxPf0LPjA'
      const subscription = await sw.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      })
      const ghToken = import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.REACT_APP_GITHUB_TOKEN || ''
      setPushPhase('api')
      const res = await fetch('https://api.github.com/repos/oscarodriguezdelcarmen/operacion-verano-app/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${ghToken}`,
        },
        body: JSON.stringify({
          title: '[PUSH_REGISTER]',
          body: JSON.stringify({
            endpoint: sub.endpoint,
            expiration: sub.expirationTime,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.keys.p256dh))),
              auth: sub.keys.auth,
            },
          }),
          labels: ['push'],
          assignees: [],
        }),
        signals: [AbortSignal.timeout(8000)],
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(`GitHub API responded ${res.status}: ${text.substring(0, 200)}`)
      }
      setPushRegistered(true)
      setPushPhase('done')
      setRegistrationLoading(false)
      setPushError(null)
      // Solo mostrar "activado" cuando la suscripcion y el push a GitHub hayan ido bien
      alert('🔔 Avisos activados. Recibirás recordatorios cada hora.')
    } catch (err) {
      console.error('Push registration error:', err)
      setPushError(err.message || String(err))
      setPushPhase('error')
      setRegistrationLoading(false)
      // SOLO se considera "activado" si la suscripcion y el POST a GitHub dieron positivo
      // No mostrar "✅ Avisos activados" en caso de error
    }
  }
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const raw = atob(base64)
    const rawLength = raw.length
    const bytes = new Uint8Array(rawLength)
    for (let i = 0; i < rawLength; i++) {
      bytes[i] = raw.charCodeAt(i)
    }
    return bytes
  }

  // ---------- GITHUB PUSH (SILENT) ----------
  const sendSilentPush = async (title, body) => {
    try {
      const ghToken = import.meta.env.VITE_GITHUB_TOKEN || import.meta.env.REACT_APP_GITHUB_TOKEN || ''
      await fetch('https://api.github.com/repos/oscarodriguezdelcarmen/operacion-verano-app/issues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `token ${ghToken}`,
        },
        body: JSON.stringify({
          title,
          body: JSON.stringify(body),
          labels: ['silent'],
          assignees: [],
        }),
      })
    } catch (err) {
      console.error('Silent push error:', err)
    }
  }

  const handleGoldComplete = () => {
    if (state.completed) {
      if (!state.goldNotifiedDate) {
        sendSilentPush('[GOLD_COMPLETED]', { date: formatDate(getMadridTime()) })
      }
    } else {
      sendSilentPush('[GOLD_REVOKED]', { date: formatDate(getMadridTime()) })
    }
  }

  // ---------- BACKUP / RESTORE ----------
  const exportData = () => {
    const data = { state, cumulative: state.cumulative, weightHistory: state.weights, weight: state.weight }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `operacion-verano-backup-${formatDate(getMadridTime())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        if (data.state) {
          setState(data.state)
          if (data.cumulative) state.cumulative = data.cumulative
          if (data.weightHistory) state.weights = data.weightHistory
          if (data.weight) state.weight = data.weight
          alert('✅ Datos importados correctamente.')
        }
      } catch (err) {
        alert('Error al importar: ' + err.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // ---------- CALCULATE BEST STREAK ----------
  const getBestStreak = () => {
    return state.cumulative.bestStreak || 0
  }

  // ---------- RENDER ----------
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header" style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00d4b8] flex items-center justify-center text-black font-bold text-xl shrink-0">
            OV
          </div>
          <h1 className="app-title">OPERACIÓN VERANO</h1>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-[#6a6a7a]">
          <Calendar size={14} />
          {state.date} · <span className="flex items-center gap-1"><Activity size={14} /> Entrenamiento</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full">
        {/* Alert Banner */}
        {currentWarning && (
          <div className={`alert-banner ${currentWarning.includes('🔴') ? 'alert-danger' : 'alert-warning'}`}>
            <AlertTriangle size={18} />
            <span>{currentWarning}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <nav className="tab-bar">
          {[
            { id: 'today', icon: <Activity size={22} />, label: 'HOY' },
            { id: 'calendar', icon: <Calendar size={22} />, label: 'CALENDARIO' },
            { id: 'stats', icon: <TrendingUp size={22} />, label: 'ESTADÍSTICAS' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'today' && (
            <TodayPanel
              state={state}
              totalPct={totalPct}
              pctFlexion={pctFlexion}
              pctKm={pctKm}
              pctAbs={pctAbs}
              pctBra={pctBra}
              medalEmoji={medalEmoji}
              medalLabel={medalLabel}
              medalColor={medalColor}
              completed={state.completed}
              currentWarning={currentWarning}
              onAddFlexion={addFlexion}
              onSetFlexion={setFlexion}
              onAddKm={addKm}
              onSetKm={setKm}
              onToggleAbs={toggleAbsSeries}
              onToggleBra={toggleBraSeries}
              onReset={resetDay}
              onGold={handleGoldComplete}
              onRegisterPush={registerPush}
              pushRegistered={pushRegistered}
              registrationLoading={registrationLoading}
              notificationsSupported={('Notification' in window)}
              notifPermission={notifPermission}
              pushPhase={pushPhase}
              pushError={pushError}
            />
          )}

          {activeTab === 'calendar' && (
            <CalendarView
              cumulative={state.cumulative}
              date={state.date}
              goldNotifiedDate={state.goldNotifiedDate}
            />
          )}

          {activeTab === 'stats' && (
            <StatsSettings
              cumulative={state.cumulative}
              weight={state.weight}
              weights={state.weights}
              onWeightChange={(v) => setState((p) => ({ ...p, weight: parseFloat(v) || null }))}
              onAddWeight={(v) => {
                const today = formatDate(getMadridTime())
                const exists = state.weights.find((w) => w.date === today)
                setState((p) => ({
                  ...p,
                  weights: exists
                    ? p.weights.map((w) => w.date === today ? { date: today, value: v } : w)
                    : [...p.weights, { date: today, value: v }],
                }))
              }}
              onExport={exportData}
              onImport={importData}
            />
          )}
        </div>
      </main>

      {/* Bottom Tab Bar */}
      <nav className="tab-bar mt-auto">
        {[
          { id: 'today', icon: <Activity size={22} />, label: 'HOY' },
          { id: 'calendar', icon: <Calendar size={22} />, label: 'CALENDARIO' },
          { id: 'stats', icon: <TrendingUp size={22} />, label: 'ESTADÍSTICAS' },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Toast */}
      {state.toast && (
        <div className="toast show">
          <span className="toast-icon">{state.toast.icon}</span>
          {state.toast.message}
        </div>
      )}
    </div>
  )
}

function AppWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  )
}

export default AppWithErrorBoundary
