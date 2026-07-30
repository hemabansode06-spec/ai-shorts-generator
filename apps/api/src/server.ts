import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { PrismaClient } from "@prisma/client";

// Load environment variables from .env
dotenv.config();

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Simple health check
app.get("/health", async (_req: Request, res: Response) => {
  try {
    // Quick DB check
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok" });
  } catch (err) {
    res.status(500).json({ status: "error", error: String(err) });
  }
});

// Example: list shorts (paginated)
app.get("/shorts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const take = Math.min(Number(req.query.take) || 20, 100);
    const skip = Number(req.query.skip) || 0;
    const shorts = await prisma.short.findMany({
      take,
      skip,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        durationSec: true,
        format: true,
        createdAt: true,
      },
    });
    res.json({ data: shorts });
  } catch (err) {
    next(err);
  }
});

// Example: create a short (very small demo)
app.post("/shorts", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { projectId, title, description } = req.body;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

    const short = await prisma.short.create({
      data: {
        projectId,
        title,
        description,
      },
    });

    res.status(201).json({ data: short });
  } catch (err) {
    next(err);
  }
});

// Basic error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start server if this file is run directly
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    console.log(`API server listening on http://localhost:${port}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("Shutting down server...");
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

export default app;
