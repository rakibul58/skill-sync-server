/*
  Warnings:

  - You are about to drop the column `proficiency` on the `user_skills` table. All the data in the column will be lost.
  - You are about to drop the column `verified` on the `user_skills` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user_skills" DROP COLUMN "proficiency",
DROP COLUMN "verified";
