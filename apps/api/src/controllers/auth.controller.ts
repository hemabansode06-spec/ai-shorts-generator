import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, name, label } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const result = await authService.registerUserAndApiKey({ email, name, label });
    res.status(201).json({ user: { id: result.user.id, email: result.user.email, name: result.user.name }, apiKey: result.apiKey.key });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, label } = req.body;
    if (!email) return res.status(400).json({ error: "email is required" });

    const user = await authService.findUserByEmail(email);
    if (!user) return res.status(404).json({ error: "user not found" });

    const apiKey = await authService.createApiKey(user.id, label);
    res.json({ apiKey: apiKey.key });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - middleware attaches user
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "unauthenticated" });
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
};
