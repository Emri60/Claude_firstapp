import 'dotenv/config'
import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const parentPageId = process.env.NOTION_PARENT_PAGE_ID

if (!process.env.NOTION_TOKEN || !parentPageId) {
  console.error('NOTION_TOKEN et NOTION_PARENT_PAGE_ID sont requis dans .env')
  process.exit(1)
}

// Archive les anciennes bases si elles existent
async function archiveIfExists(id) {
  if (!id) return
  try {
    await notion.pages.update({ page_id: id, archived: true })
    console.log(`  Archivée : ${id}`)
  } catch (e) {
    // ignoré si déjà archivée ou inexistante
  }
}

async function createVoyagesDB() {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Voyages' } }],
    properties: {
      'Nom du voyage':   { title: {} },
      'Destination': {
        select: { options: [
          { name: 'Varsovie', color: 'red' },
          { name: 'Cracovie', color: 'blue' },
          { name: 'Autre',    color: 'gray' },
        ]},
      },
      'Dates':             { date: {} },
      'Vol A/R':           { number: { format: 'euro' } },
      'Hébergement':       { number: { format: 'euro' } },
      'Transport local':   { number: { format: 'euro' } },
      'Bagage soute':      { number: { format: 'euro' } },
      'Nourriture':        { number: { format: 'euro' } },
      'Autres frais':      { number: { format: 'euro' } },
      'Total frais voyage': {
        formula: {
          expression: 'prop("Vol A/R") + prop("Hébergement") + prop("Transport local") + prop("Bagage soute") + prop("Nourriture") + prop("Autres frais")',
        },
      },
      // Rollups (Nb objets, Total achats, Total reventes, Bénéfice net, ROI, Coût transport/objet)
      // → à configurer manuellement dans Notion (API ne supporte pas la création de rollups)
      'Notes': { rich_text: {} },
    },
  })
  console.log('✓ Base Voyages créée :', db.id)
  return db.id
}

async function createVendeursDB() {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Vendeurs' } }],
    properties: {
      'Nom':    { title: {} },
      'Téléphone': { phone_number: {} },
      'Email':     { email: {} },
      'Adresse':   { rich_text: {} },
      'Plateforme d\'origine': {
        select: { options: [
          { name: 'OLX',                  color: 'blue'   },
          { name: 'Bazar na Kole',         color: 'green'  },
          { name: 'ZOO Market',            color: 'yellow' },
          { name: 'Facebook Marketplace',  color: 'orange' },
          { name: 'Allegro',               color: 'red'    },
          { name: 'Antykwariat',           color: 'purple' },
          { name: 'Bouche à oreille',      color: 'pink'   },
          { name: 'Autre',                 color: 'gray'   },
        ]},
      },
      'Types d\'objets': {
        multi_select: { options: [
          { name: 'Lampes',    color: 'yellow' },
          { name: 'Affiches',  color: 'blue'   },
          { name: 'Fauteuils', color: 'green'  },
          { name: 'Autre',     color: 'gray'   },
        ]},
      },
      'A un entrepôt': { checkbox: {} },
      'Fiabilité': {
        select: { options: [
          { name: '1 étoile',   color: 'red'    },
          { name: '2 étoiles',  color: 'orange' },
          { name: '3 étoiles',  color: 'yellow' },
          { name: '4 étoiles',  color: 'green'  },
          { name: '5 étoiles',  color: 'blue'   },
        ]},
      },
      'Notes':  { rich_text: {} },
      'ID App': { number: { format: 'number' } },
      // Rollups "Nb objets achetés" et "Total dépensé" → à configurer manuellement
    },
  })
  console.log('✓ Base Vendeurs créée :', db.id)
  return db.id
}

async function createObjetsDB(vendeurDbId, voyageDbId) {
  const db = await notion.databases.create({
    parent: { type: 'page_id', page_id: parentPageId },
    title: [{ type: 'text', text: { content: 'Objets' } }],
    properties: {
      'Nom de l\'objet': { title: {} },
      'Catégorie': {
        select: { options: [
          { name: 'Lampe',    color: 'yellow' },
          { name: 'Affiche',  color: 'blue'   },
          { name: 'Fauteuil', color: 'green'  },
          { name: 'Autre',    color: 'gray'   },
        ]},
      },
      'Statut': {
        select: { options: [
          { name: 'Acheté',          color: 'blue'   },
          { name: 'En restauration', color: 'orange' },
          { name: 'En vente',        color: 'yellow' },
          { name: 'Vendu',           color: 'green'  },
        ]},
      },
      'Photos':               { files: {} },
      'Prix d\'achat (EUR)':  { number: { format: 'euro' } },
      'Date d\'achat':        { date: {} },
      'Frais de restauration':{ number: { format: 'euro' } },
      'Plateforme de revente': {
        select: { options: [
          { name: 'Selency',   color: 'purple' },
          { name: 'Leboncoin', color: 'orange' },
          { name: 'eBay',      color: 'blue'   },
          { name: 'Vinted',    color: 'green'  },
          { name: 'En direct', color: 'yellow' },
          { name: 'Brocante',  color: 'red'    },
          { name: 'Autre',     color: 'gray'   },
        ]},
      },
      'Prix de revente':        { number: { format: 'euro' } },
      'Commission plateforme':  { number: { format: 'euro' } },
      'Frais de livraison':     { number: { format: 'euro' } },
      'Date de revente':        { date: {} },
      'Bénéfice net': {
        formula: {
          expression: 'prop("Prix de revente") - prop("Prix d\'achat (EUR)") - prop("Frais de restauration") - prop("Commission plateforme") - prop("Frais de livraison")',
        },
      },
      'Marge %': {
        formula: {
          expression: 'if(prop("Prix de revente") > 0, round((prop("Bénéfice net") / prop("Prix d\'achat (EUR)")) * 100), 0)',
        },
      },
      'Durée en stock (jours)': {
        formula: {
          expression: 'if(prop("Date de revente") != empty and prop("Date d\'achat") != empty, dateBetween(prop("Date de revente"), prop("Date d\'achat"), "days"), 0)',
        },
      },
      'Vendeur': {
        relation: {
          database_id: vendeurDbId,
          single_property: {},
        },
      },
      'Voyage': {
        relation: {
          database_id: voyageDbId,
          single_property: {},
        },
      },
      'Notes':  { rich_text: {} },
      'ID App': { number: { format: 'number' } },
    },
  })
  console.log('✓ Base Objets créée :', db.id)
  return db.id
}

async function addVendeursObjetsRelation(vendeurDbId, objetsDbId) {
  // Ajouter la relation "Objets achetés" dans Vendeurs (pointe vers Objets)
  await notion.databases.update({
    database_id: vendeurDbId,
    properties: {
      'Objets achetés': {
        relation: {
          database_id: objetsDbId,
          single_property: {},
        },
      },
    },
  })
  console.log('✓ Relation Vendeurs → Objets ajoutée')
}

async function addVoyagesObjetsRelation(voyageDbId, objetsDbId) {
  await notion.databases.update({
    database_id: voyageDbId,
    properties: {
      'Objets': {
        relation: {
          database_id: objetsDbId,
          single_property: {},
        },
      },
    },
  })
  console.log('✓ Relation Voyages → Objets ajoutée')
}

async function main() {
  // Archiver les anciennes bases
  console.log('Archivage des anciennes bases...')
  await archiveIfExists(process.env.NOTION_VENDEURS_DB_ID)
  await archiveIfExists(process.env.NOTION_OBJETS_DB_ID)
  await archiveIfExists(process.env.NOTION_VOYAGES_DB_ID)

  console.log('\nCréation des nouvelles bases...\n')

  // Ordre important : Voyages et Vendeurs avant Objets (pour les relations)
  const voyageDbId  = await createVoyagesDB()
  const vendeurDbId = await createVendeursDB()
  const objetsDbId  = await createObjetsDB(vendeurDbId, voyageDbId)

  // Ajouter les relations inverses
  await addVendeursObjetsRelation(vendeurDbId, objetsDbId)
  await addVoyagesObjetsRelation(voyageDbId, objetsDbId)

  console.log('\n--- Copie ces IDs dans ton .env ---')
  console.log(`NOTION_VENDEURS_DB_ID=${vendeurDbId}`)
  console.log(`NOTION_OBJETS_DB_ID=${objetsDbId}`)
  console.log(`NOTION_VOYAGES_DB_ID=${voyageDbId}`)
  console.log('-----------------------------------')
  console.log('\nÀ configurer manuellement dans Notion (API non supportée) :')
  console.log('  Vendeurs  → rollup "Nb objets achetés" (count relation Objets achetés)')
  console.log('  Vendeurs  → rollup "Total dépensé" (sum Prix d\'achat EUR via Objets achetés)')
  console.log('  Voyages   → rollup "Nb objets ramenés" (count relation Objets)')
  console.log('  Voyages   → rollup "Total achats" (sum Prix d\'achat EUR via Objets)')
  console.log('  Voyages   → rollup "Total reventes" (sum Prix de revente via Objets)')
  console.log('  Voyages   → formule "Coût transport/objet" (Total frais / Nb objets)')
  console.log('  Voyages   → formule "Bénéfice net voyage" (Total reventes - Total achats - Total frais)')
  console.log('  Voyages   → formule "ROI" (Bénéfice / (Total achats + Total frais) × 100)')
}

main().catch(err => {
  console.error('Erreur :', err.message)
  if (err.code === 'unauthorized') {
    console.error('Vérifie NOTION_TOKEN et que la page est partagée avec l\'intégration.')
  }
  process.exit(1)
})
