/*
  Warnings:

  - You are about to drop the column `ebay_count` on the `MarketSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `ebay_prix_max` on the `MarketSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `ebay_prix_min` on the `MarketSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `ebay_prix_moyen` on the `MarketSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `olx_count` on the `MarketSnapshot` table. All the data in the column will be lost.
  - You are about to drop the column `olx_prix_moyen_pln` on the `MarketSnapshot` table. All the data in the column will be lost.
  - You are about to drop the `OlxAlert` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "OlxAlert" DROP CONSTRAINT "OlxAlert_objet_id_fkey";

-- AlterTable
ALTER TABLE "MarketSnapshot" DROP COLUMN "ebay_count",
DROP COLUMN "ebay_prix_max",
DROP COLUMN "ebay_prix_min",
DROP COLUMN "ebay_prix_moyen",
DROP COLUMN "olx_count",
DROP COLUMN "olx_prix_moyen_pln";

-- DropTable
DROP TABLE "OlxAlert";

-- DropEnum
DROP TYPE "AlertType";
