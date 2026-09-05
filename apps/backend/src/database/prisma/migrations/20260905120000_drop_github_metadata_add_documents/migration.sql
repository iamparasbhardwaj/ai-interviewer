/*
  Warnings:

  - You are about to drop the column `githubMetadata` on the `Interview` table. All the data in that column will be lost.

*/
-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "githubMetadata";

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('Resume', 'Summary');

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileType" "DocumentType" NOT NULL,
    "interviewId" TEXT NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Document_interviewId_idx" ON "Document"("interviewId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
