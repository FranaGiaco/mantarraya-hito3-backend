import request from "supertest"
import app from "./app.js"
import { pool } from "./db.js"

describe("Mantarraya API Tests", () => {

  const email = `test_${Date.now()}@test.com`
  const password = "1234"

  it("GET / debería responder 200", async () => {
    const res = await request(app).get("/")
    expect(res.status).toBe(200)
  })

  it("POST /register debería crear usuario (201 o 200)", async () => {
    const res = await request(app)
      .post("/register")
      .send({ name: "Tester", email, password })

    expect(res.status).toBeGreaterThanOrEqual(200)
    expect(res.status).toBeLessThan(300)
    expect(res.body.email).toBe(email)
  })

  it("POST /login debería fallar con password incorrecto (401)", async () => {
    const res = await request(app)
      .post("/login")
      .send({ email, password: "wrongpassword" })

    expect(res.status).toBe(401)
  })

  it("GET /users sin token debería responder 401", async () => {
    const res = await request(app).get("/users")
    expect(res.status).toBe(401)
  })

})

afterAll(async () => {
  await pool.end()
})
