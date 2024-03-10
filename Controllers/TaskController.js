import prisma from "../DB/db.config.js";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs/promises";
import path from "path";
import { io } from "../server.js";
const upload = multer({ storage: "/uploads" });
export const createTask = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    const { title, description, dueDate, userId } = req.body;
    let projectUserId = user.role === "Admin" ? userId : user.id;
    if (!title) {
      return res.status(400).json({ message: "Task title is required." });
    }

    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectUsers: {
          select: {
            userId: true,
          },
        },
      },
    });
    console.log("The project:", project);
    if (!project) {
      return res.status(404).json({ message: "No project found" });
    }
    const isUserAssociated = project.projectUsers.some(
      (projectUser) => projectUser.userId === projectUserId
    );
    if (!isUserAssociated) {
      return res
        .status(404)
        .json({ message: "This user is not associated in this project." });
    }
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        projectId: parseInt(projectId),
        userId: projectUserId,
      },
    });
    let message =
      user.role === "Admin"
        ? `You created a Task for User with ID: ${userId}`
        : "You created a project for yourself.";
    res.status(201).json({ task, message });

    //send the userId to client with sockets!!
    io.emit("taskCreated", { user: `${projectUserId}` });
  } catch (error) {
    console.error("Error creating task:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    const tasks = await prisma.task.findMany({
      where: {
        projectId: parseInt(projectId),
      },
    });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
export const getTaskById = async (req, res) => {
  try {
    const user = req.user;
    const { taskId } = req.params;

    const task = await prisma.task.findUnique({
      where: {
        id: parseInt(taskId),
      },
    });
    if (!task) return res.status(404).json({ message: "Task not found" });
    if (user.role === "Admin" || user.id === task.userId) {
      res.json(task);
    } else {
      return res.status(404).json({ message: "UnAuthorized!" });
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
export const updateTaskById = async (req, res) => {
  try {
    const user = req.user;
    const { taskId } = req.params;
    const { title, description, dueDate, completed } = req.body;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });
    if (user.role === "Admin" || user.id === task.userId) {
      const task = await prisma.task.update({
        where: {
          id: parseInt(taskId),
        },
        data: {
          title,
          description,
          dueDate: new Date(dueDate),
          completed,
        },
      });
      res.json(task);
    } else {
      return res.status(404).json({ message: "UnAuthorized!" });
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTaskById = async (req, res) => {
  try {
    const user = req.user;
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });
    if (user.role === "Admin" || user.id === task.userId) {
      const task = await prisma.task.delete({
        where: {
          id: parseInt(taskId),
        },
      });
      res.json({ message: "Task deleted successfully!" });
    } else {
      return res.status(404).json({ message: "UnAuthorized!" });
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const assignTaskToUser = async (req, res) => {
  try {
    const user = req.user;
    const { projectId, taskId, userId } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectUsers: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const userInProject = await prisma.user.findFirst({
      where: {
        id: parseInt(userId),
        projects: {
          some: {
            projectId: parseInt(projectId),
          },
        },
      },
    });

    if (!userInProject) {
      return res.status(404).json({ message: "User not found in the project" });
    }
    const isUserAssociated = project.projectUsers.some(
      (projectUser) => projectUser.userId === user.id
    );
    if (user.role !== "Admin" && !isUserAssociated) {
      return res
        .status(404)
        .json({ message: "you are not assocaiated in this project." });
    }
    const task = await prisma.task.update({
      where: {
        id: parseInt(taskId),
      },
      data: {
        userId: parseInt(userId),
      },
    });

    res.status(200).json(task);
  } catch (error) {
    console.error("Error assigning task to user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const unassignTaskFromUser = async (req, res) => {
  try {
    const user = req.user;
    const { projectId, taskId } = req.body;
    const project = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
      include: {
        projectUsers: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    const isUserAssociated = project.projectUsers.some(
      (projectUser) => projectUser.userId === user.id
    );
    if (user.role !== "Admin" && !isUserAssociated) {
      return res
        .status(404)
        .json({ message: "you are not assocaiated in this project." });
    }

    const task = await prisma.task.update({
      where: {
        id: parseInt(taskId),
      },
      data: {
        userId: null,
      },
    });

    res.status(200).json(task);
  } catch (error) {
    console.error("Error unassigning task from user:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const uploadAttachment = async (req, res) => {
  const user = req.user;
  const { taskId } = req.params;
  const file = req.file;
  console.log("The file:", file);
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (task.userId !== user.id) {
      return res
        .status(404)
        .json({ error: "you can upload a file for your own task" });
    }
    const createdFile = await prisma.file.create({
      data: {
        filename: file.originalname,
        taskId: parseInt(taskId),
        path: file.path,
      },
    });

    res.status(201).json(createdFile);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAttachmentByTaskId = async (req, res) => {
  try {
    const user = req.user;
    const { taskId } = req.params;
    const task = await prisma.task.findUnique({
      where: { id: parseInt(taskId) },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (task.userId !== user.id) {
      return res.status(404).json({ error: "UnAuthorized!" });
    }
    const files = await prisma.file.findMany({
      where: { taskId: parseInt(taskId) },
    });

    res.json(files);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Internal server error");
  }
};

export const deleteAttachment = async (req, res) => {
  try {
    const user = req.user;
    const { fileId } = req.params;

    const file = await prisma.file.findUnique({
      where: { id: parseInt(fileId) },
    });

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const task = await prisma.task.findUnique({
      where: { id: file.taskId },
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    if (task.userId !== user.id) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await fs.unlink(file.path);

    await prisma.file.delete({
      where: { id: parseInt(fileId) },
    });

    res.status(204).send("File Deleted.");
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
