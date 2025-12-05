export function ensureAuth(req, res, next) {
  if (!req.session || !req.session.user || !req.session.user.id) {
    return res.status(401).json({ message: "로그인이 필요합니다." });
  }
  req.userId = req.session.user.id;
  next();
}
