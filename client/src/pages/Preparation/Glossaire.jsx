import { useState } from 'react'

const GLOSSAIRE = [
  { fr: 'Lampe industrielle', pl: 'lampa przemysłowa / lampa loftowa' },
  { fr: 'Lampe de bureau vintage', pl: 'lampa biurkowa vintage / lampa PRL' },
  { fr: 'Lampe champignon', pl: 'lampa grzybek' },
  { fr: 'Lampe d\'atelier', pl: 'lampa warsztatowa' },
  { fr: 'Suspension', pl: 'lampa wisząca' },
  { fr: 'Affiche polonaise', pl: 'plakat polski / plakat filmowy' },
  { fr: 'Lot d\'affiches', pl: 'plakaty zestaw' },
  { fr: 'Débarras appartement', pl: 'opróżnianie mieszkań / likwidacja mieszkania' },
  { fr: 'Fauteuil 366', pl: 'fotel 366 Chierowski' },
  { fr: 'Fauteuil renard', pl: 'fotel 300-190 Lis' },
  { fr: 'Retrait en main propre', pl: 'odbiór osobisty Warszawa' },
  { fr: 'Entrepôt / stock', pl: 'magazyn' },
  { fr: 'En réserve', pl: 'w zapleczu' },
  { fr: 'Je paye en cash', pl: 'płacę gotówką' },
  { fr: 'L\'objet est-il disponible ?', pl: 'Czy przedmiot jest dostępny?' },
  { fr: 'Bonjour', pl: 'Dzień dobry' },
  { fr: 'Pouvons-nous nous retrouver ?', pl: 'Czy możemy się spotkać?' },
  { fr: 'Je suis intéressé', pl: 'Jestem zainteresowany' },
  { fr: 'Prix', pl: 'cena' },
  { fr: 'Négocier', pl: 'negocjować' },
  { fr: 'Ancien / époque PRL', pl: 'z epoki PRL / stary' },
  { fr: 'Marché aux puces', pl: 'pchli targ / giełda staroci' },
]

export default function Glossaire() {
  const [q, setQ] = useState('')

  const filtered = q.trim()
    ? GLOSSAIRE.filter(e =>
        e.fr.toLowerCase().includes(q.toLowerCase()) ||
        e.pl.toLowerCase().includes(q.toLowerCase())
      )
    : GLOSSAIRE

  return (
    <div className="space-y-3">
      <input
        type="search"
        value={q}
        onChange={e => setQ(e.target.value)}
        placeholder="Rechercher…"
        className="w-full rounded-xl border-gray-200 text-base py-3 px-4 focus:ring-primary focus:border-primary"
      />
      <div className="text-xs text-gray-400">{filtered.length} entrée{filtered.length !== 1 ? 's' : ''}</div>
      <div className="space-y-2">
        {filtered.map((e, i) => (
          <div key={i} className="grid grid-cols-2 gap-2 bg-card rounded-xl p-3 border border-gray-100">
            <div className="text-sm text-ink font-medium">{e.fr}</div>
            <div className="text-sm text-blue-700 font-medium">{e.pl}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
