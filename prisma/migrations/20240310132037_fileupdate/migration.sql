/*
  Warnings:

  - You are about to drop the column `fileData` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `fileName` on the `File` table. All the data in the column will be lost.
  - Added the required column `data` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `filename` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "fileData",
DROP COLUMN "fileName",
ADD COLUMN     "data" BYTEA NOT NULL,
ADD COLUMN     "filename" TEXT NOT NULL;
