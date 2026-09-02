/**
 * Integration tests — require a reachable Postgres (DATABASE_URL).
 * Run locally with `docker compose up -d db` + `npm run prisma:migrate`,
 * or in CI where a postgres service is provided.
 */
import request from "supertest";
import app from "../../src/app";
import prisma from "../../src/config/prisma";

const unique = () => `user_${Date.now()}_${Math.random().toString(16).slice(2)}@test.dev`;

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.task.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
});

describe("auth flow", () => {
  it("registers, sets an httpOnly cookie, and never returns the password", async () => {
    const email = unique();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Ada", email, password: "supersecret" });

    expect(res.status).toBe(201);
    expect(res.body.data.user).toMatchObject({ email });
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.token).toBeUndefined();

    const cookie = res.headers["set-cookie"]?.[0] ?? "";
    expect(cookie).toMatch(/token=/);
    expect(cookie.toLowerCase()).toContain("httponly");
  });

  it("rejects a duplicate email with 409", async () => {
    const email = unique();
    const body = { name: "Dup", email, password: "supersecret" };
    await request(app).post("/api/auth/register").send(body);
    const res = await request(app).post("/api/auth/register").send(body);
    expect(res.status).toBe(409);
  });

  it("rejects a weak password with 400 + field errors", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Weak", email: unique(), password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.errors?.[0]?.path).toBe("password");
  });

  it("logs in with valid credentials and 401s on bad ones", async () => {
    const email = unique();
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Log", email, password: "supersecret" });

    const ok = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "supersecret" });
    expect(ok.status).toBe(200);

    const bad = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrongpass" });
    expect(bad.status).toBe(401);
  });

  it("guards /api/auth/me", async () => {
    const anon = await request(app).get("/api/auth/me");
    expect(anon.status).toBe(401);

    const email = unique();
    const reg = await request(app)
      .post("/api/auth/register")
      .send({ name: "Me", email, password: "supersecret" });
    const cookie = reg.headers["set-cookie"];

    const me = await request(app).get("/api/auth/me").set("Cookie", cookie);
    expect(me.status).toBe(200);
    expect(me.body.data.user.email).toBe(email);
  });
});
