const { generateToken } = require('../utils/jwtHelper');
const User = require('../models/User');
exports.googleCallback = async (req, res) => {
  try {
    const token = generateToken({ id: req.user._id });

    if (!req.user.roleSelected) {
      console.log('User must select role before continuing');
      // return res.status(200).json({
      //   suceess: true,
      //   message: 'Authentication successful. Please select your account type.',
      //   token: token,
      //   mustSelectRole: true,
      //   user: {
      //     id: req.user._id,
      //     name: req.user.name,
      //     email: req.user.email,
      //     isVerified: req.user.isVerified
      //   }
      // });
      return res.redirect(`/select-role?token=${token}`);

    }

    // User has selected role, proceed as normal
    // res.status(200).json({
    //   success: true,
    //   message: 'Google login successful',
    //   token: token,
    //   mustSelectRole: false,
    //   user: {
    //     id: req.user._id,
    //     name: req.user.name,
    //     email: req.user.email,
    //     isVerified: req.user.isVerified,
    //     role: req.user.role
    //   }
    // });
    return res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.facebookCallback = async (req, res) => {
  try {
    const token = generateToken({ id: req.user._id });

    if (!req.user.roleSelected) {
      console.log('User must select role before continuing');
      // return res.status(200).json({
      //   suceess: true,
      //   message: 'Authentication successful. Please select your account type.',
      //   token: token,
      //   mustSelectRole: true,
      //   user: {
      //     id: req.user._id,
      //     name: req.user.name,
      //     email: req.user.email,
      //     isVerified: req.user.isVerified
      //   }
      // });
      return res.redirect(`/select-role?token=${token}`);
    }

    // User has selected role, proceed as normal
    // res.status(200).json({
    //   success: true,
    //   message: 'Facebook login successful',
    //   token: token,
    //   mustSelectRole: false,
    //   user: {
    //     id: req.user._id,
    //     name: req.user.name,
    //     email: req.user.email,
    //     isVerified: req.user.isVerified,
    //   }
    // });
    return res.redirect(`/dashboard?token=${token}`);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      isVerified: req.user.isVerified,
      role: req.user.role,
      roleSelected: req.user.roleSelected
    };

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// Select role
exports.selectRole = async (req, res) => {
  try {
    const { role } = req.body;

    // Validate role
    const validRoles = ['freelancer', 'client', 'agency'];
    if (!role || !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Please choose: freelancer, client, or agency'
      });
    }

    // Get user
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing role if already selected
    if (user.roleSelected) {
      return res.status(400).json({
        success: false,
        message: 'Role already selected and cannot be changed.'
      });
    }

    // Set role
    user.role = role;
    user.roleSelected = true;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: `Role selected successfully! Welcome, ${role}!`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleSelected: user.roleSelected,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
};