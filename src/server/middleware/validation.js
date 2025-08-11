const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('username')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    next();
  }
];

const validateTenantSelection = [
  body('tenantId')
    .notEmpty()
    .trim()
    .escape()
    .withMessage('Tenant selection is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array()
      });
    }
    next();
  }
];

const sanitizeInput = (req, res, next) => {
  // Sanitize common input fields
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validateTenantSelection,
  sanitizeInput
};
