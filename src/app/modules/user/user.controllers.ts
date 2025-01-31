import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.services";

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createAdminInDb(req.body);
  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Admin Registered successfully!",
    data: result,
  });
});

const getUserProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.getUserProfileFromDB(req.user);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "User Profile fetched successfully!",
      data: result,
    });
  }
);

export const UserControllers = {
  createAdmin,
  getUserProfile
};
