import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { BatchUserSkillOperations } from "./user_skills.interface";
import { JwtPayload } from "jsonwebtoken";

const addUserSkills = async ({ user, skills }: BatchUserSkillOperations) => {
  // Validate teacher exists
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user.userId },
    include: {
      userSkill: true,
    },
  });

  if (!teacher) {
    throw new AppError(StatusCodes.NOT_FOUND, "Teacher not found");
  }

  // Validate all skills exist first
  const skillIds = skills.map((skill) => skill.skillId);
  const existingSkills = await prisma.skill.findMany({
    where: { id: { in: skillIds } },
  });

  if (existingSkills.length !== skillIds.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Some skills do not exist");
  }

  // Check for duplicate skills in input
  const uniqueSkillIds = new Set(skillIds);
  if (uniqueSkillIds.size !== skillIds.length) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Duplicate skills in request");
  }

  // Check which skills are already assigned
  const existingUserSkills = await prisma.userSkill.findMany({
    where: {
      teacherId: user?.userId,
      skillId: { in: skillIds },
    },
  });

  const existingSkillIds = new Set(existingUserSkills.map((us) => us.skillId));
  const newSkills = skills.filter((skill) => !existingSkillIds.has(skill.skillId));

  if (newSkills.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "All specified skills are already assigned"
    );
  }

  // Create new user skills in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const createdSkills = await Promise.all(
      newSkills.map((skill) =>
        tx.userSkill.create({
          data: {
            teacherId: user.userId,
            skillId: skill.skillId,
          },
          include: {
            skill: true,
            teacher: true,
          },
        })
      )
    );

    return createdSkills;
  });

  return result;
};

const removeUserSkills = async (user: JwtPayload, skillIds: string[]) => {
  // Validate teacher exists
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user?.userId },
    include: {
      userSkill: true,
    },
  });

  if (!teacher) {
    throw new AppError(StatusCodes.NOT_FOUND, "Teacher not found");
  }

  // Check which skills are actually assigned
  const existingUserSkills = await prisma.userSkill.findMany({
    where: {
      teacherId: user?.userId,
      skillId: { in: skillIds },
    },
  });

  if (existingUserSkills.length === 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "None of the specified skills are assigned to the teacher"
    );
  }

  // Remove skills in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const removedSkills = await Promise.all(
      existingUserSkills.map((userSkill) =>
        tx.userSkill.delete({
          where: {
            teacherId_skillId: {
              teacherId: user?.userId,
              skillId: userSkill.skillId,
            },
          },
          include: {
            skill: true,
          },
        })
      )
    );

    return removedSkills;
  });

  return result;
};

const getUserSkillsByTeacher = async (user: JwtPayload) => {
  const teacher = await prisma.teacher.findUnique({
    where: { userId: user?.userId },
  });

  if (!teacher) {
    throw new AppError(StatusCodes.NOT_FOUND, "Teacher not found");
  }

  const userSkills = await prisma.userSkill.findMany({
    where: { teacherId: user.userId },
    include: {
      skill: {
        include: {
          category: true,
        },
      },
    },
    orderBy: [
      { skill: { name: "asc" } },
    ],
  });

  return userSkills;
};

export const UserSkillService = {
  addUserSkills,
  removeUserSkills,
  getUserSkillsByTeacher,
};