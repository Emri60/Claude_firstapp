const CONFIG = {
  priorite: {
    HAUTE:   { label: 'Priorité haute',   cls: 'bg-red-50 text-primary border-red-200' },
    MOYENNE: { label: 'Priorité moyenne', cls: 'bg-amber-50 text-secondary border-amber-200' },
    BASSE:   { label: 'Priorité basse',   cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  },
  rarete: {
    RARE:     { label: 'Rare',     cls: 'bg-amber-50 text-secondary border-amber-200' },
    MOYEN:    { label: 'Moyen',    cls: 'bg-blue-50 text-blue-600 border-blue-200' },
    ABONDANT: { label: 'Abondant', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  },
  statut: {
    A_CHERCHER: { label: 'À chercher', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
    REPERE:     { label: 'Repéré',     cls: 'bg-amber-50 text-secondary border-amber-200' },
    ACHETE:     { label: 'Acheté',     cls: 'bg-green-50 text-success border-green-200' },
  },
  confiance: {
    FIABLE:  { label: 'Fiable',  cls: 'bg-green-50 text-success border-green-200' },
    MOYEN:   { label: 'Moyen',   cls: 'bg-amber-50 text-secondary border-amber-200' },
    INCONNU: { label: 'Inconnu', cls: 'bg-gray-100 text-gray-500 border-gray-200' },
  },
}

export default function Badge({ type, value, size = 'sm' }) {
  const config = CONFIG[type]?.[value]
  if (!config) return null
  const sizeClass = size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-1'
  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${sizeClass} ${config.cls}`}>
      {config.label}
    </span>
  )
}
