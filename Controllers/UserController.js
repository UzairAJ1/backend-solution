import prisma from "../DB/db.config.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { io } from "../server.js";
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (role !== "Admin" && role !== "User") {
      return res.status(400).json({ message: "Roles should be Admin or User" });
    }
    if (!username || !email) {
      return res
        .status(400)
        .json({ message: "Username and email are required." });
    }

    const existingUsername = await prisma.user.findUnique({
      where: {
        username,
      },
    });

    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    const existingEmail = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingEmail) {
      return res.status(400).json({ message: "Email is already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: role,
      },
    });

    return res
      .status(201)
      .json({ user: newUser, message: "User registered successfully." });
  } catch (error) {
    console.error("Error during user registration:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }
    const token = jwt.sign({ userId: user.id }, "123", { expiresIn: "1h" });

    return res.status(200).json({ token, message: "Login successful." });
  } catch (error) {
    console.error("Error during user login:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const user = req.user;
    if (user.role === "Admin") {
      const allUsers = await prisma.user.findMany();
      return res.status(200).json(allUsers);
    }
  } catch (error) {
    console.error("Error fetching all users:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
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
    const tasks = await prisma.task.findMany({
      where: { userId: userId },
    });

    res
      .status(200)
      .json({
        role: req.user.role,
        email: req.user.email,
        username: req.user.username,
        registeredAt: req.user.createdAt,
        projects,
        tasks,
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching projects", error: error.message });
  }
};

export const searchProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const searchTerm = req.query.searchTerm;

    const projects = await prisma.project.findMany({
      where: {
        AND: [
          {
            projectUsers: {
              some: {
                userId: userId,
              },
            },
          },
          {
            OR: [
              {
                name: {
                  contains: searchTerm || undefined,
                },
              },
              {
                description: {
                  contains: searchTerm || undefined,
                },
              },
              {
                id: {
                  equals: parseInt(searchTerm) || undefined,
                },
              },
            ],
          },
        ],
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
export const searchTasks = async (req, res) => {
  try {
    const userId = req.user.id;
    const searchTerm = req.query.searchTerm;

    const tasks = await prisma.task.findMany({
      where: {
        AND: [
          {
            userId: userId,
          },
          {
            OR: [
              {
                title: {
                  contains: searchTerm || undefined,
                },
              },
              {
                description: {
                  contains: searchTerm || undefined,
                },
              },
              {
                id: {
                  equals: parseInt(searchTerm) || undefined,
                },
              },
            ],
          },
        ],
      },
    });

    res.status(200).json(tasks);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching Tasks", error: error.message });
  }
};
