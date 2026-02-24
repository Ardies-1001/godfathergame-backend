-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "features" JSONB,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;
