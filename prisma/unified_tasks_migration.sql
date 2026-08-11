PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FollowUpTask" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "customerId" TEXT,
  "chassisNumber" TEXT,
  "title" TEXT NOT NULL,
  "actionType" TEXT NOT NULL,
  "taskType" TEXT NOT NULL DEFAULT 'SALES',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "dueDate" DATETIME NOT NULL,
  "dueTime" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "notes" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FollowUpTask_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "FollowUpTask_chassisNumber_fkey" FOREIGN KEY ("chassisNumber") REFERENCES "VehicleChassis" ("chassisNumber") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_FollowUpTask" ("actionType", "createdAt", "customerId", "dueDate", "dueTime", "id", "notes", "status", "title")
SELECT "actionType", "createdAt", "customerId", "dueDate", "dueTime", "id", "notes", "status", "title" FROM "FollowUpTask";
DROP TABLE "FollowUpTask";
ALTER TABLE "new_FollowUpTask" RENAME TO "FollowUpTask";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
