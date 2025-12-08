import db from "@/lib/db"

export const getBalance = async (userId: string): Promise<string> => {
    const user = await db.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
            bankAccount: true
        }
    })
    if (!user.bankAccount) throw new Error("No bank account");
    
    return Number(user.bankAccount.balance).toFixed(2) + "zł"
}