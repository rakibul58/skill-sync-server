import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserControllers } from "./user.controllers";
import { UserValidations } from "./user.validations";
import validateRequest from "../../middlewares/validateRequest";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/create-admin")
  .post(
    auth(UserRole.ADMIN),
    validateRequest(UserValidations.createAdminValidationSchema),
    UserControllers.createAdmin
  );

router
  .route("/me")
  .get(
    auth(UserRole.ADMIN, UserRole.TEACHER, UserRole.LEARNER),
    UserControllers.getUserProfile
  );

router.route("/teachers").get(UserControllers.getAvailableTeachers);

router.route("/").get(auth(UserRole.ADMIN), UserControllers.getAllUsers);

router
  .route("/teacher/profile")
  .put(auth(UserRole.TEACHER), UserControllers.updateTeacherProfile);

router
  .route("/learner/profile")
  .put(auth(UserRole.LEARNER), UserControllers.updateLearnerProfile);

export const UserRoutes = router;
