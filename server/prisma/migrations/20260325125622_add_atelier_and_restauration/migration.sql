-- AlterTable
ALTER TABLE "Objet" ADD COLUMN     "atelier_id" INTEGER,
ADD COLUMN     "restauration" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Atelier" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT,
    "ville" TEXT,
    "telephone" TEXT,
    "specialite" TEXT,
    "fiabilite" "NiveauConfiance" NOT NULL DEFAULT 'INCONNU',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Atelier_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Objet" ADD CONSTRAINT "Objet_atelier_id_fkey" FOREIGN KEY ("atelier_id") REFERENCES "Atelier"("id") ON DELETE SET NULL ON UPDATE CASCADE;
