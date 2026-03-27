export function roleMiddleware(allowedRoles) {
  const allowed = new Set(allowedRoles);
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });
    if (!allowed.has(req.user.role)) return res.status(403).json({ message: "Forbidden" });
    return next();
  };
}

