-- CreateEnum
CREATE TYPE "Categorie" AS ENUM ('LAMPE', 'AFFICHE', 'FAUTEUIL', 'AUTRE');

-- CreateEnum
CREATE TYPE "Rarete" AS ENUM ('ABONDANT', 'MOYEN', 'RARE');

-- CreateEnum
CREATE TYPE "Priorite" AS ENUM ('HAUTE', 'MOYENNE', 'BASSE');

-- CreateEnum
CREATE TYPE "Statut" AS ENUM ('A_CHERCHER', 'REPERE', 'ACHETE');

-- CreateEnum
CREATE TYPE "NiveauConfiance" AS ENUM ('FIABLE', 'MOYEN', 'INCONNU');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objet" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "fabricant" TEXT,
    "designer" TEXT,
    "categorie" "Categorie" NOT NULL,
    "epoque" TEXT,
    "dimensions" TEXT,
    "description" TEXT,
    "rarete" "Rarete" NOT NULL,
    "priorite" "Priorite" NOT NULL,
    "prix_achat_min" DOUBLE PRECISION,
    "prix_achat_max" DOUBLE PRECISION,
    "prix_revente_min" DOUBLE PRECISION,
    "prix_revente_max" DOUBLE PRECISION,
    "marge_estimee" DOUBLE PRECISION,
    "mots_cles_polonais" TEXT,
    "liens_reference" JSONB,
    "tests_authenticite" JSONB,
    "signaux_alerte" JSONB,
    "photos_reference" JSONB,
    "statut" "Statut" NOT NULL DEFAULT 'A_CHERCHER',
    "notes" TEXT,
    "poids_estime" DOUBLE PRECISION,
    "volume_estime" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendeur" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "telephone" TEXT,
    "stand_habituel" TEXT,
    "marche" TEXT,
    "specialite" TEXT,
    "a_entrepot" BOOLEAN NOT NULL DEFAULT false,
    "niveau_confiance" "NiveauConfiance" NOT NULL DEFAULT 'INCONNU',
    "notes" TEXT,
    "rappel_avant_voyage" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendeur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achat" (
    "id" SERIAL NOT NULL,
    "objet_id" INTEGER NOT NULL,
    "vendeur_id" INTEGER NOT NULL,
    "prix_paye" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "voyage" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "ordre" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RDV" (
    "id" SERIAL NOT NULL,
    "jour" TEXT NOT NULL,
    "heure" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nom_contact" TEXT NOT NULL,
    "adresse" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RDV_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Achat" ADD CONSTRAINT "Achat_objet_id_fkey" FOREIGN KEY ("objet_id") REFERENCES "Objet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achat" ADD CONSTRAINT "Achat_vendeur_id_fkey" FOREIGN KEY ("vendeur_id") REFERENCES "Vendeur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
