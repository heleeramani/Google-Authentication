// Middleware to ensure user has selected a role
exports.requireRole = async (req, res, next) => {
  try {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authenticated'
      });
    }

    // Check if user has selected a role
    if (!req.user.roleSelected || !req.user.role) {
      return res.status(403).json({
        success: false,
        message: 'Please select your account type first',
        needsRoleSelection: true
      });
    }

    // User has role - allow access
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};