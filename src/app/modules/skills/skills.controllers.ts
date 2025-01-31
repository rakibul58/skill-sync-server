import { StatusCodes } from "http-status-codes";
import catchAsync from "../../../shared/catchAsync";
import { SkillService } from "./skills.services";
import sendResponse from "../../../shared/sendResponse";
import { Request, Response } from "express";
import pick from "../../../shared/pick";

const createSkill = catchAsync(async (req: Request, res: Response) => {
  const result = await SkillService.createSkill(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Skill created successfully!",
    data: result,
  });
});

const updateSkill = catchAsync(async (req: Request, res: Response) => {
  const result = await SkillService.updateSkill(req.params.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Skill updated successfully!",
    data: result,
  });
});

const deleteSkill = catchAsync(async (req: Request, res: Response) => {
  const result = await SkillService.deleteSkill(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Skill deleted successfully!",
    data: result,
  });
});

const getAllSkills = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, ["name", "categoryId", "searchTerm"]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await SkillService.getAllSkills(filters, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Skills retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

const getSkillById = catchAsync(async (req: Request, res: Response) => {
  const result = await SkillService.getSkillById(req.params.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Skill retrieved successfully",
    data: result,
  });
});

const getTeachersBySkill = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["limit", "page"]);
  const result = await SkillService.getTeachersBySkill(req.params.id, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Teachers retrieved successfully",
    meta: result.meta,
    data: result.data,
  });
});

export const SkillControllers = {
  createSkill,
  updateSkill,
  deleteSkill,
  getAllSkills,
  getSkillById,
  getTeachersBySkill,
};
