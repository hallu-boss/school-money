/*
  Warnings:

  - You are about to drop the column `accountId` on the `Collection` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "accountId",
ADD COLUMN     "bankAccountId" TEXT;
