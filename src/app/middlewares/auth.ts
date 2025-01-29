import { NextFunction, Request, Response } from "express";
import { jwtHelpers } from "../../helpers/jwtHelpers";
import config from "../../config";
import { JwtPayload, Secret } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import AppError from "../errors/AppError";
import prisma from "../../shared/prisma";

const auth = (...roles: string[]) => {
  return async (
    req: Request & { user?: any },
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization;

      if (!token) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "You are not authorized!");
      }

      let verifiedUser: JwtPayload;
      try {
        verifiedUser = jwtHelpers.verifyToken(
          token,
          config.jwt.jwt_secret as Secret
        );
      } catch (error) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Your token is invalid!");
      }

      req.user = verifiedUser;

      if (roles.length && !roles.includes(verifiedUser.role)) {
        throw new AppError(
          StatusCodes.FORBIDDEN,
          "You can't access this route!"
        );
      }

      const userData = await prisma.user.findUniqueOrThrow({
        where: {
          id: verifiedUser.userId
        },
      });

      next();
    } catch (err) {
      next(err);
    }
  };
};

export default auth;
