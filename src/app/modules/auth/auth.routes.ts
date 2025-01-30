import { Router } from "express";
import { AuthControllers } from "./auth.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router.route("/login").post(AuthControllers.loginUser);
router.route("/register/teacher").post(AuthControllers.registerTeacher);
router.route("/register/learner").post(AuthControllers.registerLearner);
router.route("/refresh-token").post(AuthControllers.refreshToken);
router
  .route("/change-password")
  .post(
    auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.LEARNER),
    AuthControllers.changePassword
  );

export const AuthRoutes = router;
