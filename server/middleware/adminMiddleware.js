/**
 * Admin authorization middleware.
 * Must be executed AFTER authMiddleware so req.user is already populated.
 *
 * Verifies that the authenticated user has the 'admin' role.
 * Returns 403 Forbidden for non-admin users.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Access restricted to administrators only.'
    });
  }

  next();
};

module.exports = adminMiddleware;
