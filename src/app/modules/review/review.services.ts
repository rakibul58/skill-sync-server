import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { Prisma } from "@prisma/client";
import { CreateReviewBody, ReviewFilterRequest } from "./review.interface";
import { JwtPayload } from "jsonwebtoken";

const createReview = async (data: CreateReviewBody, user: JwtPayload) => {
  const session = await prisma.session.findUnique({
    where: { id: data.sessionId },
    include: {
      review: true,
      learner: true,
    },
  });

  if (!session) {
    throw new AppError(StatusCodes.NOT_FOUND, "Session not found");
  }

  // Verify the learner is the one who attended the session
  if (session.learnerId !== user.userId) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      "You can only review sessions you attended"
    );
  }

  if (session.status !== "COMPLETED") {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      "Can only review completed sessions"
    );
  }

  if (session.review) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Session already reviewed");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Create the review
    const review = await tx.review.create({
      data: {
        ...data,
        teacherId: session.teacherId,
        learnerId: session.learnerId,
      },
      include: {
        teacher: true,
        learner: true,
        session: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Update teacher's average rating
    const teacherReviews = await tx.review.findMany({
      where: { teacherId: session.teacherId },
    });

    const averageRating =
      teacherReviews.reduce((sum, review) => sum + review.rating, 0) /
      teacherReviews.length;

    await tx.teacher.update({
      where: { id: session.teacherId },
      data: { rating: averageRating },
    });

    return review;
  });

  return result;
};

const getTeacherReviews = async (
  user: JwtPayload,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const reviews = await prisma.review.findMany({
    where: { teacherId: user.userId },
    include: {
      learner: true,
      session: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.review.count({
    where: { teacherId: user.userId },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: reviews,
  };
};

const getLearnerReviews = async (
  user: JwtPayload,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);

  const reviews = await prisma.review.findMany({
    where: { learnerId: user.userId },
    include: {
      teacher: true,
      session: {
        include: {
          skill: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: limit,
  });

  const total = await prisma.review.count({
    where: { learnerId: user.userId },
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: reviews,
  };
};

const getReviews = async (
  filters: ReviewFilterRequest,
  options: IPaginationOptions
) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { minRating, maxRating, startDate, endDate, ...otherFilters } = filters;

  const andConditions: Prisma.ReviewWhereInput[] = [];

  if (Object.keys(otherFilters).length > 0) {
    const filterConditions = Object.keys(otherFilters).map((key) => ({
      [key]: {
        equals: (otherFilters as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  if (minRating !== undefined || maxRating !== undefined) {
    andConditions.push({
      rating: {
        gte: minRating,
        lte: maxRating,
      },
    });
  }

  if (startDate && endDate) {
    andConditions.push({
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    });
  }

  const whereConditions: Prisma.ReviewWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.review.findMany({
    where: whereConditions,
    include: {
      teacher: true,
      learner: true,
      session: {
        include: {
          skill: true,
        },
      },
    },
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.review.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

export const ReviewService = {
  createReview,
  getTeacherReviews,
  getLearnerReviews,
  getReviews,
};
