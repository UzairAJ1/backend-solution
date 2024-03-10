import { Router } from "express";
import UserRoutes from "./userRoute.js";
import ProjectRoutes from "./projectRoute.js";
import TaskRoutes from "./taskRoute.js";

const router = Router();
router.use("/api/auth", UserRoutes);
router.use("/api/projects", ProjectRoutes);
router.use("/api", TaskRoutes);
export default router;
