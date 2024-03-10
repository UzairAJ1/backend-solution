import { Router } from "express";
import multer from "multer";
import {
  createTask,
  getTasks,
  getTaskById,
  updateTaskById,
  deleteTaskById,
  assignTaskToUser,
  unassignTaskFromUser,
  uploadAttachment,
  getAttachmentByTaskId,
  deleteAttachment,
} from "../Controllers/TaskController.js";
import { authenticateUser } from "../Middleware/authMiddleware.js";
import { upload } from "../Middleware/upload.js";
const router = Router();
router.post("/projects/:projectId/tasks", authenticateUser, createTask);
router.get("/projects/:projectId/tasks", getTasks);
router.get("/tasks/:taskId", authenticateUser, getTaskById);
router.put("/tasks/:taskId", authenticateUser, updateTaskById);
router.delete("/tasks/:taskId", authenticateUser, deleteTaskById);
router.post("/projects/tasks/assign", authenticateUser, assignTaskToUser);
router.post("/projects/tasks/unassign", authenticateUser, unassignTaskFromUser);
router.post(
  "/upload/:taskId",
  upload.single("file"),
  authenticateUser,
  uploadAttachment
);
router.get("/retrieve/:taskId", authenticateUser, getAttachmentByTaskId);
router.delete("/delete/:fileId", authenticateUser, deleteAttachment);
export default router;
