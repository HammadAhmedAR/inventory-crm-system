import type { PrismaClient } from "@prisma/client";

export async function seedApplicationSettings(prisma: PrismaClient) {
  await prisma.userAccount.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", passwordHash: "admin123", fullName: "Showroom Owner", role: "OWNER" },
  });

  if (await prisma.dealershipProfile.count() === 0) {
    await prisma.dealershipProfile.create({
      data: {
        companyName: "OmniDrive",
        regNumber: "",
        address: "",
        phone: "",
        email: "",
        website: "",
        bankName: "",
        bankBranch: "",
        accountName: "OmniDrive",
        accountNumber: "",
      },
    });
  }
}
