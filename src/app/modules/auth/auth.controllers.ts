import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import { AuthServices } from "./auth.services";
import config from "../../../config";

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Logged in successfully!",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

const registerTeacher = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.teacherRegistration(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Registered successfully!",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

const registerLearner = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.learnerRegistration(req.body);

  const { refreshToken, accessToken } = result;

  res.cookie("accessToken", accessToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  res.cookie("refreshToken", refreshToken, {
    secure: config.env === "development" ? false : true,
    httpOnly: true,
  });

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Registered successfully!",
    data: {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    },
  });
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const { refreshToken } = req.cookies;

  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Access token generated successfully!",
    data: result,
  });
});

const changePassword = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const user = req.user;

    const result = await AuthServices.changePassword(user, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Password changed successfully",
      data: result,
    });
  }
);

export const AuthControllers = {
  loginUser,
  registerTeacher,
  registerLearner,
  refreshToken,
  changePassword
};
