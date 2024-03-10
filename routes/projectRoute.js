import { Router } from "express";
import {
  getProjects,
  createProject,
  getProjectById,
  updateProjectById,
  deleteProjectById,
} from "../Controllers/ProjectController.js";
import { authenticateUser } from "../Middleware/authMiddleware.js";
const router = Router();

router.get("/", authenticateUser, getProjects);
router.post("/", authenticateUser, createProject);
router.get("/:projectId", authenticateUser, getProjectById);
router.put("/:projectId", authenticateUser, updateProjectById);
router.delete("/:projectId", authenticateUser, deleteProjectById);
export default router;
