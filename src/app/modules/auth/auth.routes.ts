import { Router } from "express";
import { AuthControllers } from "./auth.controllers";

const router = Router();

router.route("/login").post(AuthControllers.loginUser);
router.route("/register/teacher").post(AuthControllers.registerTeacher);
router.route("/register/learner").post(AuthControllers.registerLearner);

export const AuthRoutes = router;
