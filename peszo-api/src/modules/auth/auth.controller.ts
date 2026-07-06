import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { successResponse, AppError } from '../../utils/response';
import { env } from '../../config/env';

// Refresh token cookie config — httpOnly prevents XSS access,
// strict sameSite mitigates CSRF, secure ensures HTTPS-only in prod.
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth',
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
};

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.register(req.body);

    // Refresh token goes in httpOnly cookie — never accessible to JS.
    // Access token goes in response body — short-lived, needed for
    // the Authorization header on subsequent requests.
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    const response = successResponse({
      user: result.user,
      accessToken: result.accessToken,
    }, 201);
    res.status(response.statusCode).json(response);
  };

  login = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const result = await this.service.login(req.body);
    res.cookie('refreshToken', result.refreshToken, COOKIE_OPTIONS);
    const response = successResponse({
      user: result.user,
      accessToken: result.accessToken,
    });
    res.status(response.statusCode).json(response);
  };

  refresh = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError('No refresh token provided', 401);
    }

    const tokens = await this.service.refresh(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, COOKIE_OPTIONS);
    const response = successResponse({ accessToken: tokens.accessToken });
    res.status(response.statusCode).json(response);
  };

  // Logout is idempotent — clears cookie even if token is already
  // gone from the DB, so the client always gets a clean state.
  logout = async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;

    if (refreshToken) {
      await this.service.logout(refreshToken);
    }

    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
    const response = successResponse(null);
    res.status(response.statusCode).json(response);
  };
}
