import config from "../../../config";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { UserRole } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";

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



export const UserServices = {
  createAdminInDb,
  getUserProfileFromDB,
};
