import prisma from "../DB/db.config.js";
import jwt from "jsonwebtoken";
import { Router } from "express";
const router = Router();

export const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;

    const projects = await prisma.project.findMany({
      where: {
        projectUsers: {
          some: {
            userId: userId,
          },
        },
      },
      include: {
        projectUsers: {
          select: {
            userId: true,
          },
        },
      },
    });

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};
export const createProject = async (req, res) => {
  try {
    const user = req.user;
    const { name, description, userIds } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Project name is required." });
    }
    let projectUserIds =
      user.role === "Admin"
        ? userIds.map((userId) => ({ userId }))
        : [{ userId: user.id }];

    const project = await prisma.project.create({
      data: {
        name,
        description,
        projectUsers: {
          create: projectUserIds,
        },
      },
    });

    let message =
      user.role === "Admin"
        ? `You created a project for Users with IDs: ${userIds.join(", ")}`
        : "You created a project for yourself.";

    res.status(201).json({ project, message });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error creating project", error: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const user = req.user;
    console.log("The user is:", user);
    const { projectId } = req.params;
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

    if (!project) return res.status(404).json({ message: "Project not found" });

    const isUserAssociated = project.projectUsers.some(
      (projectUser) => projectUser.userId === user.id
    );

    if (user.role === "Admin" || isUserAssociated) {
      res.json(project);
    } else {
      return res.status(404).json({ message: "Unauthorized!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching project" });
  }
};

export const updateProjectById = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;
    const { name, description } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });
    if (!existingProject)
      return res.status(404).json({ message: "Project not found" });

    const projectUser = await prisma.projectUser.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: user.id,
      },
    });

    if (user.role === "Admin" || projectUser) {
      const project = await prisma.project.update({
        where: {
          id: parseInt(projectId),
        },
        data: {
          name,
          description,
        },
      });
      res.json(project);
    } else {
      return res.status(403).json({ message: "Unauthorized!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating project" });
  }
};

export const deleteProjectById = async (req, res) => {
  try {
    const user = req.user;
    const { projectId } = req.params;

    const existingProject = await prisma.project.findUnique({
      where: { id: parseInt(projectId) },
    });
    if (!existingProject)
      return res.status(404).json({ message: "Project not found" });

    const projectUser = await prisma.projectUser.findFirst({
      where: {
        projectId: parseInt(projectId),
        userId: user.id,
      },
    });

    if (user.role === "Admin" || projectUser) {
      const deletedProject = await prisma.project.delete({
        where: {
          id: parseInt(projectId),
        },
      });
      res.json({ message: "Project Deleted Successfully!", deletedProject });
    } else {
      return res.status(403).json({ message: "Unauthorized!" });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error deleting project", error: error.message });
  }
};
