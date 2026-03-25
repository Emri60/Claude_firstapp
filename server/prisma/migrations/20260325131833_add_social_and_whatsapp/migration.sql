-- AlterTable
ALTER TABLE "Atelier" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "whatsapp" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vendeur" ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "whatsapp" BOOLEAN NOT NULL DEFAULT false;
