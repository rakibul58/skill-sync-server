import { StatusCodes } from "http-status-codes";
import prisma from "../../../shared/prisma";
import AppError from "../../errors/AppError";
import { paginationHelper } from "../../../helpers/paginationHelper";
import { IPaginationOptions } from "../../interfaces/pagination";
import { CreateCategoryBody, TCategoryFilterRequest, UpdateCategoryBody } from "./category.interface";
import { Prisma } from "@prisma/client";

const createCategory = async (category: CreateCategoryBody) => {
  const isExists = await prisma.category.findUnique({
    where: { name: category.name },
  });
  if (isExists) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Category already exists");
  }
  const result = await prisma.category.create({
    data: category,
  });

  return result;
};

const updateCategory = async (
  categoryId: string,
  category: UpdateCategoryBody
) => {
  const isExists = await prisma.category.findUnique({
    where: { name: category.name },
  });
  if (!isExists) {
    throw new AppError(StatusCodes.NOT_FOUND, "Category Not Found");
  }
  const result = await prisma.category.update({
    where: { id: categoryId },
    data: category,
  });

  return result;
};

const getAllCategories = async (filters: TCategoryFilterRequest,
  options: IPaginationOptions) => {
  const { limit, page, skip } = paginationHelper.calculatePagination(options);
  const { searchTerm, ...filterData } = filters;

  // there would be an array of conditions
  const andConditions: Prisma.CategoryWhereInput[] = [];

  // adding the search term condition
  if (searchTerm) {
    andConditions.push({
      OR: ["name", "description"].map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  //   adding the conditions of filter data
  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));
    andConditions.push(...filterConditions);
  }

  //  if there is no and condition then empty object would be sent
  const whereConditions: Prisma.CategoryWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.category.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy:
      options.sortBy && options.sortOrder
        ? { [options.sortBy]: options.sortOrder }
        : { createdAt: "desc" },
  });

  const total = await prisma.category.count({
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

export const CategoryServices = {
  createCategory,
  updateCategory,
  getAllCategories
};
