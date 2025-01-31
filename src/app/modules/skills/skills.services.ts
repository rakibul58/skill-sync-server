import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { Prisma } from "@prisma/client";

const createSkill = async (skill: CreateSkillBody) => {
  // Check if category exists
  const categoryExists = await prisma.category.findUnique({
    where: { id: skill.categoryId },
  });

  if (!categoryExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
  }

  // Check if skill name already exists
  const skillExists = await prisma.skill.findUnique({
    where: { name: skill.name },
  });

  if (skillExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Skill already exists");
  }

  const result = await prisma.skill.create({
    data: skill,
    include: {
      category: true,
    },
  });

  return result;
};

const updateSkill = async (skillId: string, data: UpdateSkillBody) => {
  // Check if skill exists
  const skillExists = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skillExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Skill not found");
  }

  // If updating category, verify it exists
  if (data.categoryId) {
    const categoryExists = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });

    if (!categoryExists) {
      throw new AppError(StatusCodes.NOT_FOUND, "Category not found");
    }
  }

  const result = await prisma.skill.update({
    where: { id: skillId },
    data,
    include: {
      category: true,
    },
  });

  return result;
};

const deleteSkill = async (skillId: string) => {
  // Check if skill exists
  const skillExists = await prisma.skill.findUnique({
    where: { id: skillId },
  });

  if (!skillExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Skill not found");
  }

  // Check if skill is being used in any sessions or user skills
  const skillInUse = await prisma.userSkill.findFirst({
    where: { skillId },
  });

  if (skillInUse) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Cannot delete skill as it is being used by teachers"
    );
  }

  const result = await prisma.skill.delete({
    where: { id: skillId },
  });

  return result;
};

const getAllSkills = async (
  filters: SkillFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  const andConditions: Prisma.SkillWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: ["name", "description"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.SkillWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.skill.findMany({
    where: whereConditions,
    include: {
      category: true,
      userSkill: {
        include: {
          teacher: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.skill.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const getSkillById = async (skillId: string) => {
  const result = await prisma.skill.findUnique({
    where: { id: skillId },
    include: {
      category: true,
      userSkill: {
        include: {
          teacher: true,
        },
      },
    },
  });

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, "Skill not found");
  }

  return result;
};

const getTeachersBySkill = async (
  skillId: string,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const result = await prisma.userSkill.findMany({
    where: { skillId },
    include: {
      teacher: true,
    },
    skip,
    take: limit,
    orderBy: { proficiency: "desc" },
  });

  const total = await prisma.userSkill.count({
    where: { skillId },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const SkillService = {
  createSkill,
  updateSkill,
  deleteSkill,
  getAllSkills,
  getSkillById,
  getTeachersBySkill,
};