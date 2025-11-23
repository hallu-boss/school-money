/*
  Warnings:

  - You are about to drop the column `tite` on the `Collection` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[accessCode]` on the table `Class` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,classId]` on the table `ClassMembership` will be added. If there are existing duplicate values, this will fail.
  - Made the column `userId` on table `ClassMembership` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `title` to the `Collection` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."ClassMembership" DROP CONSTRAINT "ClassMembership_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ClassMembership" DROP CONSTRAINT "ClassMembership_userId_fkey";

-- DropIndex
DROP INDEX "public"."ClassMembership_classId_key";

-- AlterTable
ALTER TABLE "ClassMembership" ALTER COLUMN "userId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Collection" DROP COLUMN "tite",
ADD COLUMN     "title" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Class_accessCode_key" ON "Class"("accessCode");

-- CreateIndex
CREATE UNIQUE INDEX "ClassMembership_userId_classId_key" ON "ClassMembership"("userId", "classId");

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassMembership" ADD CONSTRAINT "ClassMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
