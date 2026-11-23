import { useState } from 'react'
import { TrendingUp, Weight, Scale, Download, Upload, BarChart3, Plus, Trash2, CheckCircle } from 'lucide-react'

export default function StatsSettings({ cumulative, weight, weights, onWeightChange, onAddWeight, onExport, onImport }) {
  const [showWeightInput, setShowWeightInput] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const totalFlections = cumulative?.flexions || 0
  const totalKm = cumulative?.km || 0
  const totalAbs = cumulative?.abSeries || 0
  const totalBra = cumulative?.braSeries || 0
  const totalMedalDays = (cumulative?.goldDays || 0) + (cumulative?.silverDays || 0) + (cumulative?.bronzeDays || 0)
  const avgPct = totalKm > 0 ? ((totalFlections / 100) * 25 + Math.min(25, (totalKm / 5) * 25) + (totalAbs / 9) * 25 + (totalBra / 3) * 25) / 4 : 0

  return (
    <div>
      {/* Historial de peso */}
      <div className="goal-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale size={20} className="text-[#00d4b8]" />
            <h2 className="font-bold text-lg">Peso corporal (semanal)</h2>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary btn-sm" onClick={() => setShowWeightInput(true)}>+ Añadir</button>
            {weight !== null && (
              <button className="btn btn-ghost btn-sm" onClick={() => onAddWeight(weight)}>Guardar este peso</button>
            )}
          </div>
        </div>
        {weights.length === 0 ? (
          <div className="text-center text-[#6a6a7a] py-4">
            Aún no hay registros de peso. Añade tu peso semanal para controlar la bajada de 2 kg.
          </div>
        ) : (
          <div className="space-y-2">
            {weights.slice(-12).reverse().map((w) => (
              <div key={w.date} className="weight-row">
                <span className="text-sm font-bold text-[#00ff88]">{w.date}</span>
                <span className="text-sm font-bold text-[#e8e8ee]">{w.value} kg</span>
                <span className={`text-sm ${w.value < 80 ? 'text-[#00ff88]' : w.value < 90 ? 'text-[#ffb020]' : 'text-[#ffd700]'}`}>
                  {w.value < 80 ? '🔥' : w.value < 90 ? '💪' : '🌟'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totales históricos */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="stat-card">
          <div className="stat-label">Flexiones totales</div>
          <div className="stat-value count-up">{totalFlections}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Kilómetros totales</div>
          <div className="stat-value count-up">{totalKm.toFixed(1)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Series abdominales</div>
          <div className="stat-value count-up">{totalAbs}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Series brazo</div>
          <div className="stat-value count-up">{totalBra}</div>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="stat-card">
          <div className="stat-label">Días con medal</div>
          <div className="stat-value text-[#ffd700]">{totalMedalDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Días con Oro</div>
          <div className="stat-value text-[#ffd700]">{cumulative?.goldDays || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Promedio diario</div>
          <div className="stat-value text-[#00ff88]">{(totalKm > 0 ? avgPct : 0).toFixed(1)}%</div>
        </div>
      </div>

      {/* Botón de backup */}
      <div className="goal-card mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <Download size={20} className="text-[#00ff88] mr-2" />
          <h3 className="font-bold">Backup / Restaurar</h3>
          <button className="btn btn-secondary btn-sm" onClick={onExport}>
            <Download size={16} /> Exportar JSON
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => setShowImport(true)}>
            <Upload size={16} /> Importar JSON
          </button>
        </div>
      </div>

      {/* Import modal */}
      {showImport && (
        <div className="goal-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg">Restaurar backup</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowImport(false)}>Cerrar</button>
          </div>
          <div className="text-sm text-[#6a6a7a] mb-3">
            Selecciona un archivo JSON de backup para restaurar los datos.
          </div>
          <label className="btn btn-primary btn-sm">
            Seleccionar archivo
            <input type="file" accept=".json" onChange={onImport} className="hidden" />
          </label>
        </div>
      )}
    </div>
  )
}
