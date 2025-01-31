import express from "express";
import { UserRoutes } from "../modules/user/user.routes";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { CategoryRoutes } from "../modules/category/category.routes";
import { SkillRoutes } from "../modules/skills/skills.routes";
import { UserSkillRoutes } from "../modules/user_skills/user_skills.routes";
import { ReviewRoutes } from "../modules/review/review.routes";
import { SessionRoutes } from "../modules/session/session.routes";

const router = express.Router();

const moduleRoutes = [
  {
    path: "/users",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRoutes,
  },
  {
    path: "/categories",
    route: CategoryRoutes,
  },
  {
    path: "/skills",
    route: SkillRoutes,
  },
  {
    path: "/user-skills",
    route: UserSkillRoutes,
  },
  {
    path: "/reviews",
    route: ReviewRoutes,
  },
  {
    path: "/sessions",
    route: SessionRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
