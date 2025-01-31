import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { SessionService } from "./session.services";

const getTeacherCalendarEvents = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await SessionService.getTeacherCalendarEvents(req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Teacher calendar events fetched successfully",
      data: result,
    });
  }
);

const getLearnerCalendarEvents = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await SessionService.getLearnerCalendarEvents(req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Learner calendar events fetched successfully",
      data: result,
    });
  }
);

const getAdminCalendarEvents = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SessionService.getAdminCalendarEvents();

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Admin calendar events fetched successfully",
      data: result,
    });
  }
);

const createSession = catchAsync(async (req: Request, res: Response) => {
  const result = await SessionService.createSession(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: "Session created successfully",
    data: result,
  });
});

const updateSession = catchAsync(async (req: Request, res: Response) => {
  const result = await SessionService.updateSession(
    req.params.sessionId,
    req.body
  );

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Session updated successfully",
    data: result,
  });
});

export const SessionController = {
  getTeacherCalendarEvents,
  getLearnerCalendarEvents,
  getAdminCalendarEvents,
  createSession,
  updateSession,
};
