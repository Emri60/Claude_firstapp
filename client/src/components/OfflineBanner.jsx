import { useState, useEffect } from 'react'
import { getPendingCount, onSyncChange } from '../lib/offlineSync'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const [pending, setPending] = useState(0)

  useEffect(() => {
    function goOnline() { setOnline(true); refreshCount() }
    function goOffline() { setOnline(false) }
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  function refreshCount() {
    getPendingCount().then(setPending)
  }

  useEffect(() => {
    refreshCount()
    return onSyncChange(refreshCount)
  }, [])

  // Re-check pending count periodically when offline
  useEffect(() => {
    if (online) return
    const interval = setInterval(refreshCount, 3000)
    return () => clearInterval(interval)
  }, [online])

  if (online && pending === 0) return null

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] text-center text-xs font-medium py-1.5 transition-colors ${
      online ? 'bg-green-500 text-white' : 'bg-gray-700 text-white'
    }`}>
      {!online && (
        pending > 0
          ? `Hors ligne — ${pending} action${pending > 1 ? 's' : ''} en attente`
          : 'Hors ligne — mode cache'
      )}
      {online && pending > 0 && `Synchronisation de ${pending} action${pending > 1 ? 's' : ''}...`}
    </div>
  )
}
