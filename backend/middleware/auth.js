import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "No token" });
  }

  try {
    const decoded = jwt.decode(token); // or verify with Cognito

    req.user = {
      userId: decoded.sub,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};