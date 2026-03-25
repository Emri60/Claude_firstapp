/*
  Warnings:

  - You are about to drop the column `voyage` on the `Achat` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Destination" AS ENUM ('VARSOVIE', 'CRACOVIE', 'AUTRE');

-- DropForeignKey
ALTER TABLE "Achat" DROP CONSTRAINT "Achat_objet_id_fkey";

-- DropForeignKey
ALTER TABLE "Achat" DROP CONSTRAINT "Achat_vendeur_id_fkey";

-- AlterTable
ALTER TABLE "Achat" DROP COLUMN "voyage",
ADD COLUMN     "nom" TEXT,
ADD COLUMN     "voyage_id" INTEGER,
ALTER COLUMN "objet_id" DROP NOT NULL,
ALTER COLUMN "vendeur_id" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Voyage" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "destination" "Destination" NOT NULL DEFAULT 'VARSOVIE',
    "date_debut" TIMESTAMP(3),
    "date_fin" TIMESTAMP(3),
    "vol_ar" DOUBLE PRECISION DEFAULT 0,
    "hebergement" DOUBLE PRECISION DEFAULT 0,
    "transport_local" DOUBLE PRECISION DEFAULT 0,
    "bagage_soute" DOUBLE PRECISION DEFAULT 0,
    "nourriture" DOUBLE PRECISION DEFAULT 0,
    "autres_frais" DOUBLE PRECISION DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Voyage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Achat" ADD CONSTRAINT "Achat_objet_id_fkey" FOREIGN KEY ("objet_id") REFERENCES "Objet"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achat" ADD CONSTRAINT "Achat_vendeur_id_fkey" FOREIGN KEY ("vendeur_id") REFERENCES "Vendeur"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achat" ADD CONSTRAINT "Achat_voyage_id_fkey" FOREIGN KEY ("voyage_id") REFERENCES "Voyage"("id") ON DELETE SET NULL ON UPDATE CASCADE;
