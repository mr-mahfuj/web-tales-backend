import { Router } from "express";
import prisma from "../config/prisma.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return res.status(200).json({
      status: "UP",
      db: "UP",
      timeStamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(503).json({
      status: "DOWN",
      db: "DOWN",
      timeStamp: new Date().toISOString(),
    });
  }
});

export default router;