import { useState } from 'react'
import Voyages from './Voyages'
import Vendeurs from './Vendeurs'
import Achats from './Achats'
import Ateliers from './Ateliers'
import NotionSync from '../Preparation/NotionSync'

const TABS = [
  { id: 'voyages', label: 'Voyages' },
  { id: 'vendeurs', label: 'Vendeurs' },
  { id: 'ateliers', label: 'Ateliers' },
  { id: 'achats', label: 'Achats' },
  { id: 'sync', label: 'Sync' },
]

export default function GestionPage() {
  const [tab, setTab] = useState('voyages')

  return (
    <div className="px-4 pt-4">
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5 overflow-x-auto scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 py-2 px-3 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'voyages' && <Voyages />}
      {tab === 'vendeurs' && <Vendeurs />}
      {tab === 'ateliers' && <Ateliers />}
      {tab === 'achats' && <Achats />}
      {tab === 'sync' && <NotionSync />}
    </div>
  )
}
