-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "guardianName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "medicalNotes" TEXT,
    "registrationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "academyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("academyId", "contactNumber", "createdAt", "dateOfBirth", "guardianName", "id", "medicalNotes", "name", "updatedAt") SELECT "academyId", "contactNumber", "createdAt", "dateOfBirth", "guardianName", "id", "medicalNotes", "name", "updatedAt" FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE INDEX "Student_name_idx" ON "Student"("name");
CREATE INDEX "Student_academyId_idx" ON "Student"("academyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
