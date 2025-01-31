import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import { ReviewService } from "./review.services";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import pick from "../../../shared/pick";

const createReview = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const result = await ReviewService.createReview(req.body, req.user);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Review created successfully!",
      data: result,
    });
  }
);

const getTeacherReviews = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await ReviewService.getTeacherReviews(req.user, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getLearnerReviews = catchAsync(
  async (req: Request & { user?: any }, res: Response) => {
    const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
    const result = await ReviewService.getLearnerReviews(req.user, options);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: result.data,
      meta: result.meta,
    });
  }
);

const getReviews = catchAsync(async (req: Request, res: Response) => {
  const filters = pick(req.query, [
    "minRating",
    "maxRating",
    "startDate",
    "endDate",
  ]);
  const options = pick(req.query, ["limit", "page", "sortBy", "sortOrder"]);
  const result = await ReviewService.getReviews(filters, options);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: "Reviews retrieved successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const ReviewControllers = {
  createReview,
  getTeacherReviews,
  getLearnerReviews,
  getReviews,
};
