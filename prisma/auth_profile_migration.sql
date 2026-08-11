ALTER TABLE "UserAccount" RENAME COLUMN "pinHash" TO "passwordHash";

CREATE TABLE IF NOT EXISTS "DealershipProfile" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "companyName" TEXT NOT NULL,
  "regNumber" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "website" TEXT NOT NULL,
  "bankName" TEXT NOT NULL,
  "bankBranch" TEXT NOT NULL,
  "accountName" TEXT NOT NULL,
  "accountNumber" TEXT NOT NULL
);
