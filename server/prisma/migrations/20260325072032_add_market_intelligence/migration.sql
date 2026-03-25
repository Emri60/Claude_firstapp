-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('RARE', 'FOURNISSEUR', 'PRIX');

-- AlterTable
ALTER TABLE "Objet" ADD COLUMN     "keywords_trends_fr" TEXT;

-- CreateTable
CREATE TABLE "MarketSnapshot" (
    "id" SERIAL NOT NULL,
    "objet_id" INTEGER NOT NULL,
    "trends_score" INTEGER,
    "ebay_count" INTEGER,
    "ebay_prix_moyen" DOUBLE PRECISION,
    "ebay_prix_min" DOUBLE PRECISION,
    "ebay_prix_max" DOUBLE PRECISION,
    "selency_count" INTEGER,
    "selency_prix_moyen" DOUBLE PRECISION,
    "selency_prix_min" DOUBLE PRECISION,
    "selency_prix_max" DOUBLE PRECISION,
    "olx_count" INTEGER,
    "olx_prix_moyen_pln" DOUBLE PRECISION,
    "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MarketSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExchangeRate" (
    "id" SERIAL NOT NULL,
    "eur_pln" DOUBLE PRECISION NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ECB',
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OlxAlert" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "prix_pln" DOUBLE PRECISION,
    "url" TEXT NOT NULL,
    "image_url" TEXT,
    "type" "AlertType" NOT NULL,
    "objet_id" INTEGER,
    "vendeur" TEXT,
    "vu" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OlxAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketSnapshot_objet_id_key" ON "MarketSnapshot"("objet_id");

-- CreateIndex
CREATE UNIQUE INDEX "OlxAlert_url_key" ON "OlxAlert"("url");

-- AddForeignKey
ALTER TABLE "MarketSnapshot" ADD CONSTRAINT "MarketSnapshot_objet_id_fkey" FOREIGN KEY ("objet_id") REFERENCES "Objet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OlxAlert" ADD CONSTRAINT "OlxAlert_objet_id_fkey" FOREIGN KEY ("objet_id") REFERENCES "Objet"("id") ON DELETE SET NULL ON UPDATE CASCADE;
