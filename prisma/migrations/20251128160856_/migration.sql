/*
  Warnings:

  - Added the required column `type` to the `BankAccount` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('USER', 'COLLECTION');

-- AlterTable
ALTER TABLE "BankAccount" ADD COLUMN     "type" "BankAccountType" NOT NULL;
