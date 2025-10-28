/*
  Warnings:

  - You are about to drop the column `childId` on the `ClassMembership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[classId]` on the table `ClassMembership` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[iban]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Class` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ClassMembership" DROP CONSTRAINT "ClassMembership_childId_fkey";

-- DropIndex
DROP INDEX "public"."ClassMembership_classId_childId_key";

-- AlterTable
ALTER TABLE "Class" ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ClassMembership" DROP COLUMN "childId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "iban" TEXT;

-- CreateTable
CREATE TABLE "_ChildToClassMembership" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ChildToClassMembership_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ChildToClassMembership_B_index" ON "_ChildToClassMembership"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMembership_classId_key" ON "ClassMembership"("classId");

-- CreateIndex
CREATE UNIQUE INDEX "User_iban_key" ON "User"("iban");

-- AddForeignKey
ALTER TABLE "_ChildToClassMembership" ADD CONSTRAINT "_ChildToClassMembership_A_fkey" FOREIGN KEY ("A") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChildToClassMembership" ADD CONSTRAINT "_ChildToClassMembership_B_fkey" FOREIGN KEY ("B") REFERENCES "ClassMembership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
