import config from "../../../config";
import * as bcrypt from "bcrypt";
import prisma from "../../../shared/prisma";
import { UserRole } from "@prisma/client";

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



export const UserServices = {
  createAdminInDb,
};
