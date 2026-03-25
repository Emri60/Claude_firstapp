import { Client } from '@notionhq/client'

let _client = null

function getClient() {
  if (!process.env.NOTION_TOKEN) return null
  if (!_client) _client = new Client({ auth: process.env.NOTION_TOKEN })
  return _client
}

async function findPageByAppId(dsId, appId) {
  const notion = getClient()
  if (!notion || !dsId) return null
  const res = await notion.dataSources.query({
    data_source_id: dsId,
    filter: { property: 'ID App', number: { equals: appId } },
    page_size: 1,
  })
  return res.results[0] ?? null
}

// --- Vendeurs ---

function buildVendeurProps(v) {
  const CONFIANCE_MAP = { FIABLE: '5 étoiles', MOYEN: '3 étoiles', INCONNU: '1 étoile' }
  const MARCHE_MAP = {
    'OLX': 'OLX',
    'Bazar na Kole': 'Bazar na Kole',
    'ZOO Market': 'ZOO Market',
    'Facebook': 'Facebook Marketplace',
    'Allegro': 'Allegro',
    'Antykwariat': 'Antykwariat',
  }
  const CAT_MAP = { LAMPE: 'Lampes', AFFICHE: 'Affiches', FAUTEUIL: 'Fauteuils' }

  const props = {
    'Nom': { title: [{ text: { content: v.nom } }] },
    'ID App': { number: v.id },
    'A un entrepôt': { checkbox: v.a_entrepot ?? false },
  }
  if (v.telephone) props['Téléphone'] = { phone_number: v.telephone }
  if (v.email) props['Email'] = { email: v.email }
  if (v.adresse) props['Adresse'] = { rich_text: [{ text: { content: v.adresse.slice(0, 2000) } }] }
  if (v.ville) props['Ville'] = { rich_text: [{ text: { content: v.ville.slice(0, 2000) } }] }
  if (v.marche) {
    const platform = MARCHE_MAP[v.marche] ?? 'Autre'
    props["Plateforme d'origine"] = { select: { name: platform } }
  }
  if (v.specialite) {
    const cat = CAT_MAP[v.specialite.toUpperCase()]
    if (cat) props["Types d'objets"] = { multi_select: [{ name: cat }] }
  }
  if (v.niveau_confiance) {
    props['Fiabilité'] = { select: { name: CONFIANCE_MAP[v.niveau_confiance] ?? '1 étoile' } }
  }
  if (v.whatsapp) props['WhatsApp'] = { checkbox: true }
  if (v.facebook) props['Facebook'] = { url: v.facebook }
  if (v.instagram) props['Instagram'] = { url: v.instagram }
  if (v.tiktok) props['TikTok'] = { url: v.tiktok }
  if (v.notes) props['Notes'] = { rich_text: [{ text: { content: v.notes.slice(0, 2000) } }] }
  return props
}

export async function syncVendeur(vendeur) {
  const notion = getClient()
  if (!notion || !process.env.NOTION_VENDEURS_DB_ID) return
  try {
    const existing = await findPageByAppId(process.env.NOTION_VENDEURS_DS_ID, vendeur.id)
    const props = buildVendeurProps(vendeur)
    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties: props })
    } else {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_VENDEURS_DB_ID },
        properties: props,
      })
    }
  } catch (err) {
    console.error('[notion] syncVendeur error:', err.message)
  }
}

// --- Achats (ligne Objet dans Notion) ---

function buildAchatProps(achat, rate, vendeurPageId, voyagePageId) {
  const CAT_MAP = { LAMPE: 'Lampe', AFFICHE: 'Affiche', FAUTEUIL: 'Fauteuil', AUTRE: 'Autre' }
  const prixEur = rate ? Math.round((achat.prix_paye / rate) * 100) / 100 : null
  const nom = achat.objet?.nom ?? achat.nom ?? `Achat #${achat.id}`

  const props = {
    "Nom de l'objet": { title: [{ text: { content: nom } }] },
    'ID App': { number: achat.id },
    'Statut': { select: { name: 'Acheté' } },
    'Prix achat EUR': { number: prixEur ?? achat.prix_paye },
  }
  if (achat.date) props['Date achat'] = { date: { start: new Date(achat.date).toISOString().split('T')[0] } }
  if (achat.notes) props['Notes'] = { rich_text: [{ text: { content: achat.notes.slice(0, 2000) } }] }
  if (achat.objet?.categorie) {
    const cat = CAT_MAP[achat.objet.categorie] ?? 'Autre'
    props['Catégorie'] = { select: { name: cat } }
  }
  if (vendeurPageId) props['Vendeur'] = { relation: [{ id: vendeurPageId }] }
  if (voyagePageId) props['Voyage'] = { relation: [{ id: voyagePageId }] }
  return props
}

export async function syncAchat(achat, exchangeRate) {
  const notion = getClient()
  if (!notion || !process.env.NOTION_OBJETS_DB_ID) return
  try {
    const rate = exchangeRate?.eur_pln ?? null

    let vendeurPageId = null
    if (achat.vendeur_id && process.env.NOTION_VENDEURS_DS_ID) {
      const vPage = await findPageByAppId(process.env.NOTION_VENDEURS_DS_ID, achat.vendeur_id)
      vendeurPageId = vPage?.id ?? null
    }

    let voyagePageId = null
    if (achat.voyage_id && process.env.NOTION_VOYAGES_DS_ID) {
      const voyPage = await findPageByAppId(process.env.NOTION_VOYAGES_DS_ID, achat.voyage_id)
      voyagePageId = voyPage?.id ?? null
    }

    const existing = await findPageByAppId(process.env.NOTION_OBJETS_DS_ID, achat.id)
    const props = buildAchatProps(achat, rate, vendeurPageId, voyagePageId)

    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties: props })
    } else {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_OBJETS_DB_ID },
        properties: props,
      })
    }
  } catch (err) {
    console.error('[notion] syncAchat error:', err.message)
  }
}

// --- Voyages ---

function buildVoyageProps(v) {
  const DEST_MAP = { VARSOVIE: 'Varsovie', CRACOVIE: 'Cracovie', AUTRE: 'Autre' }
  const props = {
    'Nom du voyage': { title: [{ text: { content: v.nom } }] },
    'ID App': { number: v.id },
    'Destination': { select: { name: DEST_MAP[v.destination] ?? 'Autre' } },
  }
  if (v.date_debut) {
    const date = { start: new Date(v.date_debut).toISOString().split('T')[0] }
    if (v.date_fin) date.end = new Date(v.date_fin).toISOString().split('T')[0]
    props['Dates'] = { date }
  }
  if (v.vol_ar) props['Vol A/R'] = { number: v.vol_ar }
  if (v.hebergement) props['Hébergement'] = { number: v.hebergement }
  if (v.transport_local) props['Transport local'] = { number: v.transport_local }
  if (v.bagage_soute) props['Bagage soute'] = { number: v.bagage_soute }
  if (v.nourriture) props['Nourriture'] = { number: v.nourriture }
  if (v.autres_frais) props['Autres frais'] = { number: v.autres_frais }
  if (v.notes) props['Notes'] = { rich_text: [{ text: { content: v.notes.slice(0, 2000) } }] }
  return props
}

export async function syncVoyage(voyage) {
  const notion = getClient()
  if (!notion || !process.env.NOTION_VOYAGES_DB_ID) return
  try {
    const existing = await findPageByAppId(process.env.NOTION_VOYAGES_DS_ID, voyage.id)
    const props = buildVoyageProps(voyage)
    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties: props })
    } else {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_VOYAGES_DB_ID },
        properties: props,
      })
    }
  } catch (err) {
    console.error('[notion] syncVoyage error:', err.message)
  }
}

// --- Ateliers ---

function buildAtelierProps(a) {
  const CONFIANCE_MAP = { FIABLE: '5 etoiles', MOYEN: '3 etoiles', INCONNU: '1 etoile' }
  const SPEC_MAP = { Bois: 'Bois', Metal: 'Metal', Tissu: 'Tissu', Electrique: 'Electrique', General: 'General' }

  const props = {
    'Nom': { title: [{ text: { content: a.nom } }] },
    'ID App': { number: a.id },
  }
  if (a.adresse) props['Adresse'] = { rich_text: [{ text: { content: a.adresse.slice(0, 2000) } }] }
  if (a.ville) props['Ville'] = { rich_text: [{ text: { content: a.ville.slice(0, 2000) } }] }
  if (a.telephone) props['Telephone'] = { phone_number: a.telephone }
  if (a.specialite) props['Specialite'] = { select: { name: SPEC_MAP[a.specialite] ?? 'Autre' } }
  if (a.fiabilite) props['Fiabilite'] = { select: { name: CONFIANCE_MAP[a.fiabilite] ?? '1 etoile' } }
  if (a.whatsapp) props['WhatsApp'] = { checkbox: true }
  if (a.facebook) props['Facebook'] = { url: a.facebook }
  if (a.instagram) props['Instagram'] = { url: a.instagram }
  if (a.tiktok) props['TikTok'] = { url: a.tiktok }
  if (a.notes) props['Notes'] = { rich_text: [{ text: { content: a.notes.slice(0, 2000) } }] }
  return props
}

export async function syncAtelier(atelier) {
  const notion = getClient()
  if (!notion || !process.env.NOTION_ATELIERS_DB_ID) return
  try {
    const existing = await findPageByAppId(process.env.NOTION_ATELIERS_DS_ID, atelier.id)
    const props = buildAtelierProps(atelier)
    if (existing) {
      await notion.pages.update({ page_id: existing.id, properties: props })
    } else {
      await notion.pages.create({
        parent: { database_id: process.env.NOTION_ATELIERS_DB_ID },
        properties: props,
      })
    }
  } catch (err) {
    console.error('[notion] syncAtelier error:', err.message)
  }
}

// --- Suppression générique ---

export async function deleteNotionByAppId(dsId, appId) {
  const notion = getClient()
  if (!notion || !dsId) return
  try {
    const page = await findPageByAppId(dsId, appId)
    if (page) {
      await notion.pages.update({ page_id: page.id, archived: true })
    }
  } catch (err) {
    console.error('[notion] delete error:', err.message)
  }
}

export { getClient, findPageByAppId }
