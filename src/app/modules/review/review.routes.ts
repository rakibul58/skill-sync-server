import { Router } from "express";
import { ReviewControllers } from "./review.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/")
  .get(auth(UserRole.ADMIN), ReviewControllers.getReviews)
  .post(auth(UserRole.LEARNER), ReviewControllers.createReview);

router
  .route("/teacher")
  .get(auth(UserRole.TEACHER), ReviewControllers.getTeacherReviews);

router
  .route("/learner")
  .get(auth(UserRole.LEARNER), ReviewControllers.getLearnerReviews);

export const ReviewRoutes = router;
