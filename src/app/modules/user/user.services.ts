import config from "../../../config";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { Prisma, UserRole } from "@prisma/client";
import { Jwt, JwtPayload } from "jsonwebtoken";
import {
  CreateAdminBody,
  TeacherFilterRequest,
  UpdateLearnerBody,
  UpdateTeacherBody,
  UserFilterRequest,
} from "./user.interface";
import { IPaginationOptions } from "../../interfaces/pagination";
import { paginationHelper } from "../../../helpers/paginationHelper";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";

const createAdminInDb = async (payload: CreateAdminBody) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    const userInsertData = await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: {
        name: payload.admin.name,
        userId: userInsertData.id,
        avatar: payload.admin.avatar,
      },
    });

    return createdAdminData;
  });

  return result;
};

const getUserProfileFromDB = async (user: JwtPayload) => {
  if (user.role === UserRole.ADMIN) {
    return prisma.admin.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });
  } else if (user.role === UserRole.TEACHER) {
    return prisma.teacher.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });
  } else
    return prisma.learner.findUniqueOrThrow({
      where: {
        userId: user.userId,
      },
    });
};

const getAvailableTeachers = async (
  filters: TeacherFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const {
    searchTerm,
    minRating,
    maxRating,
    skill,
    categoryId,
  } = filters;

  const andConditions: Prisma.TeacherWhereInput[] = [];

  // Search term filter
  if (searchTerm) {
    andConditions.push({
      OR: ["name", "bio", "expertise"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  // Skills filter
  if (skill) {
    andConditions.push({
      userSkill: {
        some: {
          skillId: skill,
        },
      },
    });
  }

  // Rating range filter
  if (minRating !== undefined || maxRating !== undefined) {
    andConditions.push({
      rating: {
        gte: Number(minRating),
        lte: Number(maxRating),
      },
    });
  }

  // Category filter
  if (categoryId) {
    andConditions.push({
      userSkill: {
        some: {
          skill: {
            categoryId,
          },
        },
      },
    });
  }

  const whereConditions: Prisma.TeacherWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.teacher.findMany({
    where: whereConditions,
    include: {
      user: {
        select: {
          email: true,
          lastActivityLog: true,
        },
      },
      userSkill: {
        include: {
          skill: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { rating: "desc" },
  });

  const total = await prisma.teacher.count({
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

const getAllUsers = async (
  filters: UserFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, role } = filters;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: [
        {
          email: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          teacherProfile: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          learnerProfile: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
      ],
    });
  }

  if (role) {
    andConditions.push({ role });
  }

  const whereConditions: Prisma.UserWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.user.findMany({
    where: whereConditions,
    include: {
      teacherProfile: true,
      learnerProfile: true,
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.user.count({
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

const updateTeacherProfile = async (
  user: JwtPayload,
  data: UpdateTeacherBody
) => {
  if (!user.teacherProfile) {
    throw new AppError(StatusCodes.NOT_FOUND, "Teacher profile not found");
  }

  const result = await prisma.teacher.update({
    where: { userId: user.userId },
    data,
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
      userSkill: {
        include: {
          skill: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const updateLearnerProfile = async (
  user: JwtPayload,
  data: UpdateLearnerBody
) => {
  const result = await prisma.learner.update({
    where: { userId: user.userId },
    data,
    include: {
      user: {
        select: {
          email: true,
          role: true,
        },
      },
      session: {
        take: 5,
        orderBy: {
          startTime: "desc",
        },
        include: {
          skill: true,
          teacher: true,
        },
      },
      review: {
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          teacher: true,
          session: {
            include: {
              skill: true,
            },
          },
        },
      },
    },
  });

  return result;
};

export const UserServices = {
  createAdminInDb,
  getUserProfileFromDB,
  getAvailableTeachers,
  getAllUsers,
  updateTeacherProfile,
  updateLearnerProfile,
};
