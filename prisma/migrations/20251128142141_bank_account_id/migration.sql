/*
  Warnings:

  - A unique constraint covering the columns `[bankAccountId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bankAccountId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_bankAccountId_key" ON "User"("bankAccountId");
