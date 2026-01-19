const { body } = require('express-validator');

const nameValidation = body('name')
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage('Name must be between 20 and 60 characters');

const emailValidation = body('email')
  .trim()
  .isEmail()
  .normalizeEmail()
  .withMessage('Please provide a valid email address');

const passwordValidation = body('password')
  .isLength({ min: 8, max: 16 })
  .withMessage('Password must be between 8 and 16 characters')
  .matches(/[A-Z]/)
  .withMessage('Password must contain at least one uppercase letter')
  .matches(/[!@#$%^&*(),.?":{}|<>]/)
  .withMessage('Password must contain at least one special character');

const addressValidation = body('address')
  .optional()
  .trim()
  .isLength({ max: 400 })
  .withMessage('Address must not exceed 400 characters');

const roleValidation = body('role')
  .optional()
  .isIn(['admin', 'user', 'store_owner'])
  .withMessage('Invalid role specified');

const ratingValidation = body('rating')
  .isInt({ min: 1, max: 5 })
  .withMessage('Rating must be between 1 and 5');

// Validation sets
const registerValidation = [nameValidation, emailValidation, passwordValidation, addressValidation];
const loginValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];
const createUserValidation = [nameValidation, emailValidation, passwordValidation, addressValidation, roleValidation];
const updatePasswordValidation = [passwordValidation];
const storeValidation = [nameValidation, emailValidation, addressValidation];

module.exports = {
  registerValidation,
  loginValidation,
  createUserValidation,
  updatePasswordValidation,
  storeValidation,
  ratingValidation
};
