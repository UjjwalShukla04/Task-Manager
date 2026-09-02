// Sensible defaults so `src/config/env.ts` validates during tests without a
// real .env. Integration tests that need a DB rely on DATABASE_URL from CI.
process.env.NODE_ENV = "test";
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "test-secret-value-that-is-at-least-32-chars-long";
process.env.JWT_EXPIRES_IN = "1h";
process.env.BCRYPT_ROUNDS = "10";
process.env.DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://taskflow:taskflow@localhost:5432/taskflow_test?schema=public";
process.env.CLIENT_URL = "http://localhost:5173";
process.env.LOG_LEVEL = "fatal";
