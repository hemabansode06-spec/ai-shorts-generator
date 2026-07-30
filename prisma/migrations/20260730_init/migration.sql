-- Initial migration for Prisma schema (approximate)
-- NOTE: This migration was added by Copilot. It's recommended to run `npx prisma migrate dev --name init` locally to generate an authoritative migration tailored to your database.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS "User" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  role text NOT NULL DEFAULT 'USER',
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "ApiKey" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text,
  userId uuid NOT NULL,
  createdAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_apikey_user FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Project" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  ownerId uuid NOT NULL,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_project_owner FOREIGN KEY (ownerId) REFERENCES "User"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "File" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  sizeBytes integer,
  mimeType text,
  checksum text UNIQUE,
  createdAt timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "Short" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  projectId uuid NOT NULL,
  title text,
  description text,
  sourceFileId uuid,
  outputFileId uuid,
  durationSec double precision,
  width integer,
  height integer,
  format text,
  metadata jsonb,
  published boolean NOT NULL DEFAULT false,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_short_project FOREIGN KEY (projectId) REFERENCES "Project"(id) ON DELETE CASCADE,
  CONSTRAINT fk_short_sourcefile FOREIGN KEY (sourceFileId) REFERENCES "File"(id) ON DELETE SET NULL,
  CONSTRAINT fk_short_outputfile FOREIGN KEY (outputFileId) REFERENCES "File"(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS "ProcessingJob" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shortId uuid NOT NULL,
  kind text NOT NULL,
  status text NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  lastError text,
  payload jsonb,
  startedAt timestamptz,
  finishedAt timestamptz,
  createdAt timestamptz NOT NULL DEFAULT now(),
  updatedAt timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT fk_job_short FOREIGN KEY (shortId) REFERENCES "Short"(id) ON DELETE CASCADE
);
