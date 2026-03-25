import { useState, useEffect } from 'react'
import api from '../../api'

export default function NotionSync() {
  const [status, setStatus] = useState(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    api.get('/notion/status')
      .then(r => setStatus(r.data))
      .catch(() => setStatus({ enabled: false }))
  }, [])

  async function handleSync() {
    setSyncing(true)
    try {
      await api.post('/notion/sync-all')
      setLastSync(new Date())
    } catch {
      // erreur silencieuse
    } finally {
      setSyncing(false)
    }
  }

  if (!status) return (
    <div className="flex justify-center py-12">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!status.enabled) return (
    <div className="bg-card rounded-2xl p-6 text-center space-y-2">
      <p className="text-sm text-gray-500 font-medium">Notion non configuré</p>
      <p className="text-xs text-gray-400">Ajoute NOTION_TOKEN dans le .env du serveur.</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-ink text-sm uppercase tracking-wide">Base de données Notion</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Vendeurs PostgreSQL</span>
            <span className="font-medium text-ink">{status.postgres?.vendeurs ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Achats PostgreSQL</span>
            <span className="font-medium text-ink">{status.postgres?.achats ?? '—'}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleSync}
        disabled={syncing}
        className="w-full bg-ink text-white font-semibold py-4 rounded-xl text-sm disabled:opacity-60 transition-colors"
      >
        {syncing ? 'Synchronisation en cours…' : 'Synchroniser vers Notion'}
      </button>

      {lastSync && (
        <p className="text-xs text-gray-400 text-center">
          Synchronisation lancée à {lastSync.toLocaleTimeString('fr-FR')}
        </p>
      )}

      <div className="bg-card rounded-2xl p-4 space-y-1">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">À compléter dans Notion</p>
        {[
          'Photos des objets',
          'Frais de restauration',
          'Prix de revente et commission',
          'Frais de voyage (vol, hébergement…)',
          'Rattachement objets ↔ voyages',
        ].map(item => (
          <div key={item} className="flex items-start gap-2 text-xs text-gray-500">
            <span className="text-gray-300 mt-0.5">→</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
