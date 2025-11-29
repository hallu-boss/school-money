-- DropForeignKey
ALTER TABLE "public"."User" DROP CONSTRAINT "User_bankAccountId_fkey";

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
