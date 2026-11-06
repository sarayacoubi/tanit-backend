exports.CheckRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Vérifier si l'utilisateur est authentifié
    if (!req.user) {
      return res.status(401).send({
        errors: [{ msg: "Authentication required" }],
      });
    }

    // Vérifier si son rôle est autorisé
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).send({
        errors: [{ msg: "Access denied: insufficient permissions" }],
      });
    }

    next();
  };
};
