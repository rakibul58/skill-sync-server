import { Router } from "express";
import auth from "../../middlewares/auth";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "@prisma/client";
import { CategoryValidations } from "./category.validation";
import { CategoryControllers } from "./category.controllers";

const router = Router();

router
  .route("/")
  .get(CategoryControllers.getAllCategory)
  .post(
    auth(UserRole.ADMIN),
    validateRequest(CategoryValidations.createCategoryValidationSchema),
    CategoryControllers.createCategory
  );

router
  .route("/:id")
  .put(
    auth(UserRole.ADMIN),
    validateRequest(CategoryValidations.updateCategoryValidationSchema),
    CategoryControllers.updateCategory
  );

export const CategoryRoutes = router;
