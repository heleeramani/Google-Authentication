const express = require('express');
const router = express.Router();
const passport = require('passport');
const { 
  googleCallback, 
  facebookCallback, 
  getMe, 
  logout, 
  selectRole
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleCheckMiddleware');

// ==================== GOOGLE ROUTES ====================

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false }, (err, user) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: err.message
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  googleCallback
);

// ==================== FACEBOOK ROUTES ====================

router.get(
  '/facebook',
  passport.authenticate('facebook', {
    scope: ['email'],
    session: false
  })
);

router.get(
  '/facebook/callback',
  (req, res, next) => {
    passport.authenticate('facebook', { session: false }, (err, user) => {
      if (err) {
        return res.status(401).json({
          success: false,
          message: err.message
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }

      req.user = user;
      next();
    })(req, res, next);
  },
  facebookCallback
);

// ==================== ROLE SELECTION ROUTE ====================

router.post('/select-role', protect, selectRole);

// ==================== PROTECTED ROUTES (REQUIRE ROLE) ====================

router.get('/me', protect, requireRole, getMe);
router.post('/logout', protect, requireRole, logout);

module.exports = router;