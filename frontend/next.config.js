import path from 'node:path';
import { fileURLToPath } from 'node:url';

// OPENROUTER_API_KEY lives in the repo root .env (per AGENTS.md), outside this
// Next.js project root, so it must be loaded explicitly.
const rootDir = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(rootDir, '..', '.env'));
} catch {
  // Missing in environments where vars are injected directly (e.g. CI/hosting).
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
