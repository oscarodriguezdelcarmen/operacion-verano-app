import { useState } from 'react'
import { Target, Route, Dumbbell, TrendingUp, CheckCircle, Zap, Bell, BellOff, Moon, Sun, Activity, ChevronDown, ChevronUp } from 'lucide-react'

export default function TodayPanel({
  state, totalPct, pctFlexion, pctKm, pctAbs, pctBra, medalEmoji, medalLabel, medalColor,
  completed, currentWarning, onAddFlexion, onSetFlexion, onAddKm, onSetKm,
  onToggleAbs, onToggleBra, onReset, onGold, onRegisterPush,
  pushRegistered, registrationLoading, notificationsSupported, notifPermission
}) {
  const flexionProgress = Math.min(100, (state.flexions / 100) * 100)
  const kmProgress = Math.min(100, (state.km / 5) * 100)
  const absProgress = state.seriesAbs >= 9 ? 100 : Math.min(100, (state.seriesAbs / 9) * 100)
  const braProgress = state.seriesBra >= 3 ? 100 : Math.min(100, (state.seriesBra / 3) * 100)

  return (
    <div>
      {/* Medal Banner */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-4 ${medalColor()} border ${medalColor().replace('medal-', 'border-')}`}>
        <span className="text-3xl">{medalEmoji()}</span>
        <div>
          <div className="text-sm font-bold">{medalLabel()}</div>
          <div className="text-xs text-[#6a6a7a] font-medium">
            {totalPct.toFixed(1)}% del día · {state.flexions}/100 · {state.km.toFixed(1)}/{state.km >= 5 ? '≥5' : '5.0'} km · {state.seriesAbs}/9 · {state.seriesBra}/3
          </div>
        </div>
      </div>

      {completed && (
        <div className="mb-4 p-4 bg-gradient-to-r from-[#0e1a12] to-[#1a1a24] border border-[#ffd700] rounded-2xl text-center">
          <div className="text-3xl">🎉 MISIÓN CUMPLIDA 🎉</div>
          <div className="text-sm text-[#ffd700] font-bold mt-1">Medalla de ORO otorgada · Notificaciones silenciadas hasta mañana</div>
        </div>
      )}

      {/*Flexiones*/}
      <div className="goal-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#00ff88]" />
            <h2 className="font-bold text-lg">FLEXIONES</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => onAddFlexion(-5)}>−5</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddFlexion(25)}>+25</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddFlexion(20)}>+20</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddFlexion(15)}>+15</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddFlexion(10)}>+10</button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6a6a7a]">Progreso</span>
          <span className="text-sm font-bold">{state.flexions}/100</span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${flexionProgress >= 100 ? 'completed' : flexionProgress >= 75 ? 'warning' : ''}`} style={{ width: `${flexionProgress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <button className="btn btn-secondary btn-sm" onClick={() => onSetFlexion(state.flexions - 1)}>−1</button>
          <button className="btn btn-secondary btn-sm" onClick={() => onSetFlexion(0)}>Reiniciar</button>
          <button className="btn btn-secondary btn-sm" onClick={() => onSetFlexion(state.flexions + 1)}>+1</button>
        </div>
      </div>

      {/*5 km*/}
      <div className="goal-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Route size={20} className="text-[#ffb020]" />
            <h2 className="font-bold text-lg">5 KILÓMETROS</h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => onAddKm(-0.5)}>−0.5</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddKm(5)}>+5</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddKm(2.5)}>+2.5</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddKm(1)}>+1</button>
            <button className="btn btn-ghost btn-sm" onClick={() => onAddKm(0.5)}>+0.5</button>
          </div>
        </div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-[#6a6a7a]">Progreso</span>
          <span className="text-sm font-bold">{state.km.toFixed(1)}/{state.km >= 5 ? '5.0' : '5.0'} km</span>
        </div>
        <div className="progress-track">
          <div className={`progress-fill ${kmProgress >= 100 ? 'completed' : kmProgress >= 75 ? 'warning' : ''}`} style={{ width: `${kmProgress}%` }} />
        </div>
        <div className="flex justify-between mt-2">
          <button className="btn btn-secondary btn-sm" onClick={() => onSetKm(state.km - 0.1)}>−0.1</button>
          <button className="btn btn-secondary btn-sm" onClick={() => onSetKm(0)}>Reiniciar</button>
          <button className="btn btn-secondary btn-sm" onClick={() => onSetKm(state.km + 0.1)}>+0.1</button>
        </div>
      </div>

      {/*Abdominales*/}
      <div className="goal-card">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={20} className="text-[#cd7f32]" />
          <h2 className="font-bold text-lg">ABDOMINALES</h2>
          <span className="text-sm text-[#6a6a7a] ml-auto">{state.seriesAbs}/9 series</span>
        </div>
        <div className="space-y-2">
          {state.absExercises.map((ex, i) => (
            <div key={i} className="custom-checkbox">
              <input
                type="checkbox"
                checked={ex.done}
                onChange={() => onToggleAbs(i)}
              />
              <span className="checkbox-mark" />
              <span className="flex-1 text-sm font-medium">{ex.name}</span>
              <span className="text-xs text-[#6a6a7a]">{i < 3 ? 'Serie ' + (i + 1) : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/*Brazo*/}
      <div className="goal-card">
        <div className="flex items-center gap-2 mb-3">
          <Dumbbell size={20} className="text-[#cd7f32]" />
          <h2 className="font-bold text-lg">BRAZO / ANTEBRAZO</h2>
          <span className="text-sm text-[#6a6a7a] ml-auto">{state.seriesBra}/3 series</span>
        </div>
        <div className="space-y-2">
          {state.braExercises.map((ex, i) => (
            <div key={i} className="custom-checkbox">
              <input
                type="checkbox"
                checked={ex.done}
                onChange={() => onToggleBra(i)}
              />
              <span className="checkbox-mark" />
              <span className="flex-1 text-sm font-medium">{ex.name}</span>
              <span className="text-xs text-[#6a6a7a]">{i < 3 ? 'Serie ' + (i + 1) : ''}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gold button */}
      {!completed && (
        <div className="mt-4 text-center">
          <button
            className="btn btn-success btn-xl"
            onClick={onGold}
          >
            <Zap size={20} /> Finalizar Día y Obtener Medalla de Oro
          </button>
        </div>
      )}

      {/* Notification registration */}
      {notificationsSupported && (
        <div className="mt-4 p-4 bg-[#141418] rounded-2xl border border-[#23232e]">
          <div className="flex items-center gap-2 mb-2">
            {notifPermission === 'default' ? (
              <Bell size={18} className="text-[#ffb020]" />
            ) : notifPermission === 'granted' ? (
              <Bell size={18} className="text-[#00ff88]" />
            ) : (
              <BellOff size={18} className="text-[#ff453a]" />
            )}
            <span className="text-sm font-bold">
              {notifPermission === 'granted' ? '✅ Avisos activados' : notifPermission === 'denied' ? '⚠️ Avisos denegados' : '🔔 Activar recordatorios cada 1h'}
            </span>
          </div>
          <div className="text-xs text-[#6a6a7a] mt-1">
            {notifPermission === 'denied' ? 'Pulsa Configuración del iPhone para habilitar avisos.' : notifPermission === 'default' ? 'Pulsar el botón para activar los recordatorios de cada 1 hora.' : 'Avisos activos. Recibirás la frase motivadora cada hora.'}
          </div>
          <button
            className={`register-btn mt-3 ${notifPermission === 'granted' ? 'registered' : ''}`}
            onClick={onRegisterPush}
            disabled={registrationLoading}
          >
            {registrationLoading && pushPhase === 'permisos' && '⏳ 1/3 Pidiendo permisos de notificación...'}
            {registrationLoading && pushPhase === 'registro' && '⏳ 2/3 Registrando iPhone...'}
            {registrationLoading && pushPhase === 'api' && '⏳ 3/3 Conectando con GitHub...'}
            {registrationLoading && pushPhase === 'done' && '⏳...' }
            {!registrationLoading && pushPhase === 'done' && '✅ Recordatorios activados'}
            {!registrationLoading && pushPhase === 'error' && '❌ Error'}
            {!registrationLoading && !pushPhase && 'Activar avisos'}
          </button>
          {pushError && (
            <div className="mt-2 text-xs text-red-400 bg-[#2a0a0a] rounded p-2 border border-red-500/30">
              {pushError}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
