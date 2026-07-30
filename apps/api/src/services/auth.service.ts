import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({ where: { email } });
};

export const createUser = async (data: { email: string; name?: string }) => {
  return prisma.user.create({ data });
};

export const createApiKey = async (userId: string, label?: string) => {
  const key = crypto.randomBytes(32).toString("hex");
  return prisma.apiKey.create({
    data: {
      key,
      label,
      userId,
    },
  });
};

export const registerUserAndApiKey = async (opts: { email: string; name?: string; label?: string }) => {
  let user = await findUserByEmail(opts.email);
  if (!user) {
    user = await createUser({ email: opts.email, name: opts.name });
  }
  const apiKey = await createApiKey(user.id, opts.label);
  return { user, apiKey };
};

export const getUserByApiKey = async (key: string) => {
  const apiKey = await prisma.apiKey.findUnique({ where: { key }, include: { user: true } });
  return apiKey ? apiKey.user : null;
};

export const revokeApiKey = async (keyId: string) => {
  return prisma.apiKey.delete({ where: { id: keyId } });
};
