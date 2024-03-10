import jwt from "jsonwebtoken";
import prisma from "../DB/db.config.js";

export const authenticateUser = async (req, res, next) => {
  try {
    const bearer = req.headers["authorization"];
    if (!bearer) {
      return res.status(401).json({ message: "Unauthorized: Missing token" });
    }

    const [, token] = bearer.split(" ");
    try {
      const decodedToken = jwt.verify(token, "123");
      const userId = decodedToken.userId;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(401).json({ message: "Unauthorized: Invalid user" });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
