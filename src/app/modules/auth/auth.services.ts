import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import { UserRole } from "@prisma/client";
import { CreateLearnerBody, CreateTeacherBody } from "../user/user.interface";

const loginUser = async (payload: { email: string; password: string }) => {
  // checking user exists in the db
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });

  // comparing password
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password
  );

  // throwing error for wrong password
  if (!isCorrectPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password doesn't match!");
  }

  // generating access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      userId: userData.id,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      userId: userData.id,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const teacherRegistration = async (payload: CreateTeacherBody) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.teacher.email,
    password: hashedPassword,
    role: UserRole.TEACHER,
  };

  const teacherRegistrationData = await prisma.$transaction(
    async (transactionClient) => {
      const userInsertData = await transactionClient.user.create({
        data: userData,
      });

      await transactionClient.teacher.create({
        data: {
          name: payload.teacher.name,
          userId: userInsertData.id,
          bio: payload.teacher.bio,
          expertise: payload.teacher.expertise,
          yearsOfExperience: payload.teacher.yearsOfExperience,
          avatar: payload.teacher.avatar,
        },
      });

      return userInsertData;
    }
  );

  // generating access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: teacherRegistrationData.email,
      userId: teacherRegistrationData.id,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: teacherRegistrationData.email,
      userId: teacherRegistrationData.id,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const learnerRegistration = async (payload: CreateLearnerBody) => {
  const hashedPassword = await bcrypt.hash(
    payload.password,
    Number(config.salt_rounds)
  );

  const userData = {
    email: payload.learner.email,
    password: hashedPassword,
    role: UserRole.LEARNER,
  };

  const learnerRegistrationData = await prisma.$transaction(
    async (transactionClient) => {
      const userInsertData = await transactionClient.user.create({
        data: userData,
      });

      await transactionClient.learner.create({
        data: {
          name: payload.learner.name,
          userId: userInsertData.id,
          bio: payload.learner.bio,
          avatar: payload.learner.avatar,
        },
      });

      return userInsertData;
    }
  );

  // generating access token and refresh token
  const accessToken = jwtHelpers.generateToken(
    {
      email: learnerRegistrationData.email,
      userId: learnerRegistrationData.id,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      email: learnerRegistrationData.email,
      userId: learnerRegistrationData.id,
      role: userData.role,
    },
    config.jwt.refresh_token_secret as Secret,
    config.jwt.refresh_token_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  let decodedData;
  // decoding refresh token
  try {
    decodedData = jwtHelpers.verifyToken(
      token,
      config.jwt.refresh_token_secret as Secret
    );
  } catch (err) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
  }

  // checking if the user exists in the db
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: decodedData.userId,
    },
  });

  // generating new access token
  const accessToken = jwtHelpers.generateToken(
    {
      email: userData.email,
      userId: userData.id,
      role: userData.role,
    },
    config.jwt.jwt_secret as Secret,
    config.jwt.expires_in as string
  );

  return {
    accessToken
  };
};

const changePassword = async (
  user: JwtPayload,
  payload: { oldPassword: string; newPassword: string }
) => {
  // checking if the user exists in the db
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      id: user.userId
    },
  });

  // comparing password
  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password
  );

  if (!isCorrectPassword) {
    throw new AppError(StatusCodes.UNAUTHORIZED, "Password doesn't match!");
  }

  // hashing the new password
  const hashedPassword: string = await bcrypt.hash(
    payload.newPassword,
    Number(config.salt_rounds)
  );

  // updating the new password
  await prisma.user.update({
    where: {
      email: userData.email,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password updated successfully!",
  };
};

export const AuthServices = {
  loginUser,
  teacherRegistration,
  learnerRegistration,
  refreshToken,
  changePassword
};
