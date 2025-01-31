import { Router } from "express";
import auth from "../../middlewares/auth";
import { UserRole } from "@prisma/client";
import { SkillControllers } from "./skills.controllers";

const router = Router();

router
  .route("/")
  .get(SkillControllers.getAllSkills)
  .post(auth(UserRole.ADMIN), SkillControllers.createSkill);

router
  .route("/:id")
  .get(SkillControllers.getSkillById)
  .put(auth(UserRole.ADMIN), SkillControllers.updateSkill)
  .delete(auth(UserRole.ADMIN), SkillControllers.deleteSkill);

router.route("/teachers/:id").get(SkillControllers.getTeachersBySkill);

export const SkillRoutes = router;
