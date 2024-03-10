import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
io.on("connection", (socket) => {
  console.log("A socket is connected");

  socket.on("disconnect", () => {
    console.log("A socket is disconnected");
  });

  socket.emit("server message", { message: "Welcome to the server!" });
  socket.on("task", (data) => {
    console.log(data.token);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  return res.send("Hi Stone Age!");
});

import routes from "./routes/index.js";
app.use(routes);

httpServer.listen(PORT, () => console.log(`Server is running on PORT ${PORT}`));
