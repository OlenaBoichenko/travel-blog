const jwt = require("jsonwebtoken");

module.exports = (role) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Нет доступа" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== role) {
        return res.status(403).json({ message: "Недостаточно прав" });
      }
      req.user = decoded;
      next();
    } catch (error) {
      res.status(401).json({ message: "Неверный токен" });
    }
  };
};
