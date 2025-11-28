-- DropForeignKey
ALTER TABLE "public"."BankAccount" DROP CONSTRAINT "BankAccount_userId_fkey";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bankAccountId_fkey" FOREIGN KEY ("bankAccountId") REFERENCES "BankAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;
