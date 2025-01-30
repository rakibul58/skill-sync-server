import prisma from "../../../shared/prisma";
import * as bcrypt from "bcrypt";
import AppError from "../../errors/AppError";
import { StatusCodes } from "http-status-codes";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import config from "../../../config";
import { Secret } from "jsonwebtoken";

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

export const AuthServices = {
  loginUser,
};
