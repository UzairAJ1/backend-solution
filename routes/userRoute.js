import { Router } from "express";
import {
  createUser,
  loginUser,
  getAllUsers,
  getUserProfile,
  searchProjects,
  searchTasks,
} from "../Controllers/UserController.js";
import { authenticateUser } from "../Middleware/authMiddleware.js";
const router = Router();

router.post("/register", createUser);
router.post("/login", loginUser);
router.get("/", authenticateUser, getAllUsers);
//Edit the Profile Api Tommorw
router.get("/profile", authenticateUser, getUserProfile);
router.get("/search-projects", authenticateUser, searchProjects);
router.get("/search-tasks", authenticateUser, searchTasks);
//router.get("/live",authenticateUser,liveServer)
export default router;
