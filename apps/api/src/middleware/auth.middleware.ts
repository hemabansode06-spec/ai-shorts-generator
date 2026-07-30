import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export const apiKeyAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"] as string | undefined;
    let key: string | undefined = undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      key = authHeader.slice(7);
    } else if (req.headers["x-api-key"]) {
      key = String(req.headers["x-api-key"]);
    }

    if (!key) return res.status(401).json({ error: "API key missing" });

    const user = await authService.getUserByApiKey(key);
    if (!user) return res.status(401).json({ error: "Invalid API key" });

    // Attach user to request (loose typing)
    (req as any).user = user;
    next();
  } catch (err) {
    next(err);
  }
};
