import axios from 'axios'
import { cacheGet, cacheSet, queueAdd } from '../lib/offlineDb.js'
import { syncQueue, initAutoSync } from '../lib/offlineSync.js'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// --- Offline-aware wrappers ---

const CACHEABLE = ['/achats', '/vendeurs', '/voyages', '/objets', '/ateliers', '/market/dashboard']

function isCacheable(url) {
  return CACHEABLE.some(p => url === p || url.startsWith(p + '/'))
}

function isNetworkError(err) {
  return !err.response && (err.code === 'ERR_NETWORK' || err.message === 'Network Error')
}

// Wrap GET: try network first, fallback to cache, always update cache on success
const originalGet = api.get.bind(api)
api.get = async function offlineGet(url, config) {
  try {
    const res = await originalGet(url, config)
    // Cache successful responses for offline use
    if (isCacheable(url)) {
      cacheSet(url, res.data).catch(() => {})
    }
    return res
  } catch (err) {
    if (isNetworkError(err) && isCacheable(url)) {
      const cached = await cacheGet(url)
      if (cached !== null) {
        return { data: cached, status: 200, _fromCache: true }
      }
    }
    throw err
  }
}

// Wrap POST: queue if offline
const originalPost = api.post.bind(api)
api.post = async function offlinePost(url, data, config) {
  try {
    const res = await originalPost(url, data, config)
    return res
  } catch (err) {
    if (isNetworkError(err) && isCacheable(url)) {
      await queueAdd({ method: 'post', url, data })
      return { data: { _offline: true, ...data }, status: 201, _queued: true }
    }
    throw err
  }
}

// Wrap PUT: queue if offline
const originalPut = api.put.bind(api)
api.put = async function offlinePut(url, data, config) {
  try {
    const res = await originalPut(url, data, config)
    return res
  } catch (err) {
    if (isNetworkError(err) && isCacheable(url)) {
      await queueAdd({ method: 'put', url, data })
      return { data: { _offline: true, ...data }, status: 200, _queued: true }
    }
    throw err
  }
}

// Wrap DELETE: queue if offline
const originalDelete = api.delete.bind(api)
api.delete = async function offlineDelete(url, config) {
  try {
    const res = await originalDelete(url, config)
    return res
  } catch (err) {
    if (isNetworkError(err)) {
      await queueAdd({ method: 'delete', url })
      return { data: null, status: 204, _queued: true }
    }
    throw err
  }
}

// Init auto-sync on reconnect + sync on load if online
initAutoSync(api)
if (navigator.onLine) {
  setTimeout(() => syncQueue(api), 2000)
}

export default api
