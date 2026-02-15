import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "mantarraya_super_secret_local"

export function authRequired(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null

  if (!token) return res.status(401).json({ error: "Token requerido" })

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: "Token inválido" })
  }
}

export { JWT_SECRET }
