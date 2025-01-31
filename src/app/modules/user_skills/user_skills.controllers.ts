import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { UserSkillService } from "./user_skills.services";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../../../shared/sendResponse";

const addUserSkills = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserSkillService.addUserSkills({
      user: req?.user,
      skills: req.body,
    });

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: "Skills added successfully",
      data: result,
    });
  }
);

const removedSkills = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserSkillService.removeUserSkills(req?.user, req.body);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Skills removed successfully",
      data: result,
    });
  }
);

const getUserSkillsByTeacher = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await UserSkillService.getUserSkillsByTeacher(req?.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Skills retrieved successfully",
      data: result,
    });
  }
);

export const UserSkillController = {
  addUserSkills,
  removedSkills,
  getUserSkillsByTeacher,
};
