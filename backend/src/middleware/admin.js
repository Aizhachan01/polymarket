import { AppError } from '../utils/errors.js';

/**
 * Admin authorization middleware
 * Must be used after authenticate middleware
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return next(new AppError('Authentication required', 401));
  }

  if (req.user.role !== 'admin') {
    return next(new AppError('Admin access required', 403));
  }

  next();
}

