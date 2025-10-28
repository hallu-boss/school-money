/*
  Warnings:

  - You are about to drop the `_ChildToClassMembership` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ChildToClassMembership" DROP CONSTRAINT "_ChildToClassMembership_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ChildToClassMembership" DROP CONSTRAINT "_ChildToClassMembership_B_fkey";

-- AlterTable
ALTER TABLE "Child" ADD COLUMN     "membershipId" TEXT;

-- DropTable
DROP TABLE "public"."_ChildToClassMembership";

-- AddForeignKey
ALTER TABLE "Child" ADD CONSTRAINT "Child_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "ClassMembership"("id") ON DELETE SET NULL ON UPDATE CASCADE;
