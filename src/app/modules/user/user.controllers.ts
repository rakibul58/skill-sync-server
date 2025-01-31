import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { Request, Response } from "express";
import sendResponse from "../../../shared/sendResponse";
import { UserServices } from "./user.services";
import pick from "../../../shared/pick";

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

const getAvailableTeachers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "searchTerm",
    "skill",
    "minRating",
    "minRating",
    "categoryId",
  ]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await UserServices.getAvailableTeachers(filters, options);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Available Teachers fetched successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["searchTerm", "role"]);
  const options = pick(req.query, ["limit", "page"]);
  const result = await UserServices.getAllUsers(filters, options);
  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Users fetched successfully!",
    data: result.data,
    meta: result.meta,
  });
});

const updateTeacherProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateTeacherProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Teacher Profile updated successfully!",
      data: result,
    });
  }
);

const updateLearnerProfile = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserServices.updateLearnerProfile(req.user, req.body);
    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Learner Profile updated successfully!",
      data: result,
    });
  }
);

export const UserControllers = {
  createAdmin,
  getUserProfile,
  getAvailableTeachers,
  getAllUsers,
  updateTeacherProfile,
  updateLearnerProfile,
};
