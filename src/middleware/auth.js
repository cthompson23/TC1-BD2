exports.isAuthenticated = (req, res, next) => {

  const user = req.kauth?.grant?.access_token?.content;

  if (!user) {
    return res.status(401).json({
      error: "No autenticado"
    });
  }

  next();
};

exports.hasRole = (role) => {

  return (req, res, next) => {

    const user = req.kauth?.grant?.access_token?.content;

    if (!user) {
      return res.status(401).json({ error: "No autenticado" });
    }

    const roles = user.realm_access?.roles || [];

    if (!roles.includes(role)) {
      return res.status(403).json({
        error: "No autorizado"
      });
    }

    next();
  };
};