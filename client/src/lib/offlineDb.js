const DB_NAME = 'sourcing-offline'
const DB_VERSION = 1
const CACHE_STORE = 'cache'
const QUEUE_STORE = 'queue'

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(CACHE_STORE)) {
        db.createObjectStore(CACHE_STORE)
      }
      if (!db.objectStoreNames.contains(QUEUE_STORE)) {
        db.createObjectStore(QUEUE_STORE, { keyPath: 'id', autoIncrement: true })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

function tx(db, store, mode = 'readonly') {
  return db.transaction(store, mode).objectStore(store)
}

// --- Cache (key-value: url -> response data) ---

export async function cacheGet(key) {
  const db = await open()
  return new Promise((resolve) => {
    const req = tx(db, CACHE_STORE).get(key)
    req.onsuccess = () => resolve(req.result ?? null)
    req.onerror = () => resolve(null)
  })
}

export async function cacheSet(key, value) {
  const db = await open()
  return new Promise((resolve) => {
    const store = tx(db, CACHE_STORE, 'readwrite')
    store.put(value, key)
    store.transaction.oncomplete = () => resolve()
  })
}

export async function cacheClear() {
  const db = await open()
  return new Promise((resolve) => {
    const store = tx(db, CACHE_STORE, 'readwrite')
    store.clear()
    store.transaction.oncomplete = () => resolve()
  })
}

// --- Queue (pending offline actions) ---

export async function queueAdd(action) {
  const db = await open()
  return new Promise((resolve) => {
    const store = tx(db, QUEUE_STORE, 'readwrite')
    const req = store.add({ ...action, createdAt: Date.now() })
    req.onsuccess = () => resolve(req.result)
    store.transaction.oncomplete = () => resolve(req.result)
  })
}

export async function queueGetAll() {
  const db = await open()
  return new Promise((resolve) => {
    const req = tx(db, QUEUE_STORE).getAll()
    req.onsuccess = () => resolve(req.result ?? [])
    req.onerror = () => resolve([])
  })
}

export async function queueRemove(id) {
  const db = await open()
  return new Promise((resolve) => {
    const store = tx(db, QUEUE_STORE, 'readwrite')
    store.delete(id)
    store.transaction.oncomplete = () => resolve()
  })
}

export async function queueClear() {
  const db = await open()
  return new Promise((resolve) => {
    const store = tx(db, QUEUE_STORE, 'readwrite')
    store.clear()
    store.transaction.oncomplete = () => resolve()
  })
}

export async function queueCount() {
  const db = await open()
  return new Promise((resolve) => {
    const req = tx(db, QUEUE_STORE).count()
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => resolve(0)
  })
}
