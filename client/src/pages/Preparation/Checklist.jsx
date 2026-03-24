import { useState, useEffect } from 'react'
import api from '../../api'

export default function Checklist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [newLabel, setNewLabel] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get('/checklist').then(r => setItems(r.data)).finally(() => setLoading(false))
  }, [])

  async function toggle(item) {
    const updated = { ...item, checked: !item.checked }
    setItems(items.map(i => i.id === item.id ? updated : i))
    await api.put(`/checklist/${item.id}`, { checked: !item.checked })
  }

  async function addItem() {
    if (!newLabel.trim()) return
    setAdding(true)
    try {
      const { data } = await api.post('/checklist', { label: newLabel.trim() })
      setItems(i => [...i, data])
      setNewLabel('')
    } finally {
      setAdding(false)
    }
  }

  async function deleteItem(id) {
    setItems(items.filter(i => i.id !== id))
    await api.delete(`/checklist/${id}`)
  }

  async function reset() {
    if (!window.confirm('Réinitialiser toute la checklist ?')) return
    const { data } = await api.post('/checklist/reset')
    setItems(data)
  }

  const done = items.filter(i => i.checked).length

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-4">
      {/* Progression */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{done}/{items.length} complété{done !== 1 ? 's' : ''}</span>
        <button onClick={reset} className="text-xs text-gray-400 underline">Réinitialiser</button>
      </div>

      {items.length > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-success rounded-full h-2 transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
      )}

      {/* Items */}
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${item.checked ? 'bg-green-50 border-green-100' : 'bg-white border-gray-200'}`}>
            <button onClick={() => toggle(item)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.checked ? 'bg-success border-success' : 'border-gray-300'}`}>
              {item.checked && <span className="text-white text-xs font-bold">✓</span>}
            </button>
            <span className={`flex-1 text-sm ${item.checked ? 'line-through text-gray-400' : 'text-ink'}`}>{item.label}</span>
            <button onClick={() => deleteItem(item.id)} className="text-gray-300 hover:text-gray-500 text-xs px-1">✕</button>
          </div>
        ))}
      </div>

      {/* Ajouter */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newLabel}
          onChange={e => setNewLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addItem()}
          placeholder="Nouvel élément…"
          className="flex-1 rounded-xl border-gray-200 text-sm py-3 px-4 focus:ring-primary focus:border-primary"
        />
        <button
          onClick={addItem}
          disabled={adding || !newLabel.trim()}
          className="bg-primary text-white rounded-xl px-4 text-sm font-semibold disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  )
}
