import { queueGetAll, queueRemove, queueClear, cacheClear, queueCount } from './offlineDb.js'

let syncing = false
let listeners = []

export function onSyncChange(fn) {
  listeners.push(fn)
  return () => { listeners = listeners.filter(l => l !== fn) }
}

function notify() {
  listeners.forEach(fn => fn())
}

export async function getPendingCount() {
  return queueCount()
}

export async function syncQueue(api) {
  if (syncing || !navigator.onLine) return
  syncing = true
  notify()

  try {
    const actions = await queueGetAll()
    for (const action of actions) {
      try {
        if (action.method === 'post') {
          await api.post(action.url, action.data)
        } else if (action.method === 'put') {
          await api.put(action.url, action.data)
        } else if (action.method === 'delete') {
          await api.delete(action.url)
        }
        await queueRemove(action.id)
      } catch (err) {
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          // Client error (400-499) — discard, won't succeed on retry
          await queueRemove(action.id)
        } else {
          // Network/server error — stop, retry later
          break
        }
      }
    }

    // After sync, clear stale cache so fresh data loads
    const remaining = await queueGetAll()
    if (remaining.length === 0) {
      await cacheClear()
    }
  } finally {
    syncing = false
    notify()
  }
}

export function isSyncing() {
  return syncing
}

// Auto-sync when coming back online — api instance is passed via initAutoSync
let _api = null

export function initAutoSync(api) {
  _api = api
  window.addEventListener('online', () => {
    setTimeout(() => { if (_api) syncQueue(_api) }, 1000)
  })
}
