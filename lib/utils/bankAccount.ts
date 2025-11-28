import { BankAccountType } from '@prisma/client';
import db from '../db';

function generateIban() {
  const rand = Math.random().toString().slice(2, 18); // losowy 16-cyfrowy fragment
  return `PL${rand.padStart(26, '0')}`;
}

export async function createBankAccountForUser(userId: string, balance = 0, iban?: string) {
  const bankAccount = await db.bankAccount.create({
    data: {
      type: BankAccountType.USER,
      iban: iban ?? generateIban(),
      balance,
      userId,
    },
  });

  await db.user.update({
    where: { id: userId },
    data: { bankAccountId: bankAccount.id },
  });

  return bankAccount;
}

export async function createBankAccountForCollection(
  collectionId: string,
  balance = 0,
  iban?: string,
) {
  const bankAccount = await db.bankAccount.create({
    data: {
      type: BankAccountType.COLLECTION,
      iban: iban ?? generateIban(),
      balance,
      collectionId,
    },
  });

  await db.collection.update({
    where: { id: collectionId },
    data: { bankAccountId: bankAccount.id },
  });

  return bankAccount;
}
