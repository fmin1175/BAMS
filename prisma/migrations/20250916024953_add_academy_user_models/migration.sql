/*
  Warnings:

  - Added the required column `academyId` to the `Coach` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academyId` to the `Court` table without a default value. This is not possible if the table is not empty.
  - Added the required column `academyId` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Academy" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "headCoach" TEXT,
    "headCoachEmail" TEXT,
    "headCoachPhone" TEXT,
    "subscriptionPlan" TEXT NOT NULL DEFAULT 'Basic',
    "maxStudents" INTEGER NOT NULL DEFAULT 100,
    "maxCoaches" INTEGER NOT NULL DEFAULT 5,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Insert a default academy for existing data
INSERT INTO "Academy" ("name", "email", "description", "subscriptionPlan", "createdAt", "updatedAt") 
VALUES ('Default Academy', 'admin@defaultacademy.com', 'Default academy for existing data', 'Basic', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'admin',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "academyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "courts" INTEGER NOT NULL DEFAULT 1,
    "facilities" TEXT,
    "academyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Location_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coach" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "hourlyRate" REAL NOT NULL,
    "payoutMethod" TEXT NOT NULL,
    "bankDetails" TEXT,
    "contactNumber" TEXT NOT NULL,
    "email" TEXT,
    "academyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Coach_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Coach" ("bankDetails", "contactNumber", "createdAt", "email", "hourlyRate", "id", "name", "payoutMethod", "updatedAt", "academyId") SELECT "bankDetails", "contactNumber", "createdAt", "email", "hourlyRate", "id", "name", "payoutMethod", "updatedAt", 1 FROM "Coach";
DROP TABLE "Coach";
ALTER TABLE "new_Coach" RENAME TO "Coach";
CREATE INDEX "Coach_name_idx" ON "Coach"("name");
CREATE INDEX "Coach_academyId_idx" ON "Coach"("academyId");
CREATE TABLE "new_Court" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "academyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Court_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Court" ("createdAt", "id", "location", "name", "updatedAt", "academyId") SELECT "createdAt", "id", "location", "name", "updatedAt", 1 FROM "Court";
DROP TABLE "Court";
ALTER TABLE "new_Court" RENAME TO "Court";
CREATE INDEX "Court_name_idx" ON "Court"("name");
CREATE INDEX "Court_academyId_idx" ON "Court"("academyId");
CREATE TABLE "new_Student" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATETIME NOT NULL,
    "guardianName" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "medicalNotes" TEXT,
    "academyId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Student_academyId_fkey" FOREIGN KEY ("academyId") REFERENCES "Academy" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Student" ("contactNumber", "createdAt", "dateOfBirth", "guardianName", "id", "medicalNotes", "name", "updatedAt", "academyId") SELECT "contactNumber", "createdAt", "dateOfBirth", "guardianName", "id", "medicalNotes", "name", "updatedAt", 1 FROM "Student";
DROP TABLE "Student";
ALTER TABLE "new_Student" RENAME TO "Student";
CREATE INDEX "Student_name_idx" ON "Student"("name");
CREATE INDEX "Student_academyId_idx" ON "Student"("academyId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Academy_email_key" ON "Academy"("email");

-- CreateIndex
CREATE INDEX "Academy_email_idx" ON "Academy"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_academyId_idx" ON "User"("academyId");

-- CreateIndex
CREATE INDEX "Location_academyId_idx" ON "Location"("academyId");
