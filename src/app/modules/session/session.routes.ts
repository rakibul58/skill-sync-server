import { Router } from "express";
import auth from "../../middlewares/auth";
import { SessionController } from "./session.controllers";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/teacher/calendar")
  .get(auth(UserRole.TEACHER), SessionController.getTeacherCalendarEvents);

router
  .route("/learner/calendar")
  .get(auth(UserRole.LEARNER), SessionController.getLearnerCalendarEvents);

router
  .route("/calendar")
  .get(auth(UserRole.ADMIN), SessionController.getAdminCalendarEvents);

router.route("/").post(auth(UserRole.LEARNER), SessionController.createSession);

router
  .route("/:sessionId")
  .patch(auth(UserRole.TEACHER), SessionController.updateSession);

export const SessionRoutes = router;
