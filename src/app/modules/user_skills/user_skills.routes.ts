import { Router } from "express";
import { UserSkillController } from "./user_skills.controllers";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";

const router = Router();

router
  .route("/add")
  .post(auth(UserRole.TEACHER), UserSkillController.addUserSkills);

router
  .route("/remove")
  .post(auth(UserRole.TEACHER), UserSkillController.removedSkills);

router
  .route("/")
  .get(auth(UserRole.TEACHER), UserSkillController.getUserSkillsByTeacher);

export const UserSkillRoutes = router;
