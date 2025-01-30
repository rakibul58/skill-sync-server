import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";
import { UserRole } from "@prisma/client";

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

export const AuthServices = {
  loginUser,
  teacherRegistration,
  learnerRegistration,
};
