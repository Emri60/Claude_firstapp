import { useState } from 'react'
import Checklist from './Checklist'
import RDV from './RDV'
import Scripts from './Scripts'
import Glossaire from './Glossaire'
import NotionSync from './NotionSync'

const TABS = [
  { id: 'checklist', label: 'Checklist' },
  { id: 'rdv', label: 'RDV' },
  { id: 'scripts', label: 'Scripts' },
  { id: 'glossaire', label: 'Glossaire' },
  { id: 'notion', label: 'Notion' },
]

export default function PreparationPage() {
  const [tab, setTab] = useState('checklist')

  return (
    <div className="px-4 pt-4">
      {/* Onglets */}
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

      {tab === 'checklist' && <Checklist />}
      {tab === 'rdv' && <RDV />}
      {tab === 'scripts' && <Scripts />}
      {tab === 'glossaire' && <Glossaire />}
      {tab === 'notion' && <NotionSync />}
    </div>
  )
}
