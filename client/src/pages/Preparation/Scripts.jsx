const SCRIPTS = [
  {
    id: 'A',
    titre: 'Script A — Particulier pressé (OLX / Facebook Marketplace)',
    blocs: [
      {
        label: 'Message principal',
        pl: 'Dzień dobry, widziałem Pana/Pani ogłoszenie. Jestem bardzo zainteresowany. Będę w Warszawie w ten weekend i mogę zapłacić gotówką przy odbiorze. Czy możemy się spotkać w sobotę lub niedzielę?',
        fr: 'Bonjour, j\'ai vu votre annonce. Je suis très intéressé. Je serai à Varsovie ce weekend et peux payer en cash à la récupération. Pouvons-nous nous retrouver samedi ou dimanche ?',
      },
      {
        label: 'Relance',
        pl: 'Czy przedmiot jest jeszcze dostępny? Płacę od ręki.',
        fr: 'L\'objet est-il encore disponible ? Je paye sur place immédiatement.',
      },
    ],
  },
  {
    id: 'B',
    titre: 'Script B — Semi-pro avec entrepôt',
    blocs: [
      {
        label: 'Prise de contact',
        pl: 'Dzień dobry, interesuję się lampami PRL i plakatami polskiej szkoły. Wracam do Warszawy regularnie co 2-3 miesiące i szukam stałego dostawcy. Czy mógłbym zobaczyć Pana/Pani pełny magazyn podczas mojej wizyty w ten weekend?',
        fr: 'Bonjour, je m\'intéresse aux lampes PRL et aux affiches de l\'école polonaise. Je reviens à Varsovie régulièrement tous les 2-3 mois et cherche un fournisseur régulier. Pourrais-je voir votre stock complet lors de ma visite ce weekend ?',
      },
      {
        label: 'Négociation lot',
        pl: 'Jeśli wezmę kilka sztuk, czy możemy porozmawiać o cenie za całość?',
        fr: 'Si je prends plusieurs pièces, peut-on parler d\'un prix pour l\'ensemble ?',
      },
    ],
  },
  {
    id: 'C',
    titre: 'Script C — Antiquaire de quartier',
    blocs: [
      {
        label: 'Message',
        pl: 'Dzień dobry. Szukam lamp przemysłowych i plakatów z lat 60-70. Regularnie przyjeżdżam z Francji. Czy ma Pan/Pani coś w zapleczu?',
        fr: 'Bonjour. Je cherche des lampes industrielles et des affiches des années 60-70. Je viens régulièrement de France. Avez-vous quelque chose en réserve ?',
      },
    ],
  },
  {
    id: 'D',
    titre: 'Script D — Vendeur débarras / succession',
    blocs: [
      {
        label: 'Message',
        pl: 'Dzień dobry, widzę że opróżnia Pan/Pani mieszkanie. Kupuję stare lampy, plakaty i meble z epoki PRL. Czy mogę rzucić okiem przed wywozem?',
        fr: 'Bonjour, je vois que vous videz un appartement. J\'achète les vieilles lampes, affiches et meubles de l\'époque PRL. Puis-je jeter un œil avant l\'évacuation ?',
      },
    ],
  },
]

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  })
}

function BlocScript({ bloc }) {
  const [copiedPl, setCopiedPl] = useState(false)
  const [copiedFr, setCopiedFr] = useState(false)

  function copy(text, setCopied) {
    copyText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="mb-4">
      <div className="text-xs font-semibold text-gray-400 uppercase mb-2">{bloc.label}</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-blue-50 rounded-xl p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-blue-600">PL</span>
            <button onClick={() => copy(bloc.pl, setCopiedPl)} className={`text-xs px-2 py-0.5 rounded transition-colors ${copiedPl ? 'bg-blue-200 text-blue-700' : 'bg-blue-100 text-blue-500'}`}>
              {copiedPl ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed">{bloc.pl}</p>
        </div>
        <div className="bg-card rounded-xl p-3 border border-gray-200">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500">FR</span>
            <button onClick={() => copy(bloc.fr, setCopiedFr)} className={`text-xs px-2 py-0.5 rounded transition-colors ${copiedFr ? 'bg-gray-300 text-gray-700' : 'bg-gray-100 text-gray-500'}`}>
              {copiedFr ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">{bloc.fr}</p>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

export default function Scripts() {
  return (
    <div className="space-y-6">
      {SCRIPTS.map(script => (
        <div key={script.id}>
          <h3 className="font-semibold text-ink mb-3 text-sm">{script.titre}</h3>
          {script.blocs.map((bloc, i) => <BlocScript key={i} bloc={bloc} />)}
        </div>
      ))}
    </div>
  )
}
