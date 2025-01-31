/*
  Warnings:

  - The values [COMPLETED,CANCELLED] on the enum `SessionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `availability_slots` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SessionStatus_new" AS ENUM ('PENDING', 'CONFIRMED');
ALTER TABLE "sessions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "sessions" ALTER COLUMN "status" TYPE "SessionStatus_new" USING ("status"::text::"SessionStatus_new");
ALTER TYPE "SessionStatus" RENAME TO "SessionStatus_old";
ALTER TYPE "SessionStatus_new" RENAME TO "SessionStatus";
DROP TYPE "SessionStatus_old";
ALTER TABLE "sessions" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- DropForeignKey
ALTER TABLE "availability_slots" DROP CONSTRAINT "availability_slots_teacherId_fkey";

-- DropTable
DROP TABLE "availability_slots";
