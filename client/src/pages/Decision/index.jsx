import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Calculateur from './Calculateur'
import Comparateur from './Comparateur'
import Bagage from './Bagage'
import AssistantIA from './AssistantIA'

const TABS = [
  { id: 'calculateur', label: 'Calculateur' },
  { id: 'comparateur', label: 'Comparateur' },
  { id: 'bagage', label: 'Bagage' },
  { id: 'ia', label: 'Assistant IA' },
]

export default function DecisionPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('onglet') ?? 'calculateur')

  useEffect(() => {
    const onglet = searchParams.get('onglet')
    if (onglet && onglet !== tab) setTab(onglet)
  }, [searchParams])

  function switchTab(id) {
    setTab(id)
    // Keep objet param if switching to calculateur
    if (id === 'calculateur') {
      const objet = searchParams.get('objet')
      setSearchParams(objet ? { onglet: id, objet } : { onglet: id })
    } else {
      setSearchParams({ onglet: id })
    }
  }

  return (
    <div className="px-4 pt-4">
      {/* Onglets */}
      <div className="flex gap-1 bg-gray-100 rounded-2xl p-1 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => switchTab(t.id)}
            className={`flex-1 py-2 px-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.id ? 'bg-white text-ink shadow-sm' : 'text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'calculateur' && <Calculateur />}
      {tab === 'comparateur' && <Comparateur />}
      {tab === 'bagage' && <Bagage />}
      {tab === 'ia' && <AssistantIA />}
    </div>
  )
}
