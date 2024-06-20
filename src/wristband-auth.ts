import { Context } from 'hono';

import { AuthService } from './auth-service';
import { AuthConfig, CallbackData, LoginConfig, LogoutConfig, TokenData } from './types';

/**
 * WristbandAuth is a utility interface providing methods for seamless interaction with Wristband for authenticating
 * application users. It can handle the following:
 * - Initiate a login request by redirecting to Wristband.
 * - Receive callback requests from Wristband to complete a login request.
 * - Retrive all necessary JWT tokens and userinfo to start an application session.
 * - Logout a user from the application by revoking refresh tokens and redirecting to Wristband.
 * - Checking for expired access tokens and refreshing them automatically, if necessary.
 */
export interface WristbandAuth {
  /**
   * Initiates a login request by redirecting to Wristband. An authorization request is constructed
   * for the user attempting to login in order to start the Authorization Code flow.
   *
   * Your Hono request can contain Wristband-specific query parameters:
   * - return_url: The location of where to send users after authenticating. (Optional)
   * - login_hint: A hint to Wristband about user's preferred login identifier. (Optional)
   *
   * @param {Context} c - The Hono context object.
   * @param {LoginConfig} [config] - Additional configuration for creating an auth request to Wristband.
   * @returns {Promise<Response>} - A Promise as a result of a URL redirect to Wristband.
   * @throws {Error} - If an error occurs during the login process.
   */
  login(c: Context, config?: LoginConfig): Promise<Response>;

  /**
   * Receives incoming requests from Wristband with an authorization code. It will then proceed to exchange the auth
   * code for an access token as well as fetch the userinfo for the user attempting to login.
   *
   * @param {Context} c - The Hono context object.
   * @returns {Promise<CallbackData | Response>} - A Promise with all token data, userinfo, custom state, and return URL,
   * assuming the exchange of an auth code for a token succeeds (response contents depend on what inputs were given
   * to the login endpoint during the auth request). Otherwise, a Promise of type void is returned as a result of a
   * URL redirect in the event of certain error scenarios.
   * @throws {Error} - If an error occurs during the callback handling.
   */
  callback(c: Context): Promise<CallbackData | Response>;

  /**
   * Revokes the user's refresh token and redirects them to the Wristband logout endpoint to destroy
   * their authenticated session in Wristband.
   *
   * @param {Context} c - The Hono context object.
   * @param {LogoutConfig} [config] - Additional configuration for logging out the user.
   * @returns {Promise<Response>} - A Promise of type void as a result of a URL redirect to Wristband.
   * @throws {Error} - If an error occurs during the logout process.
   */
  logout(c: Context, config?: LogoutConfig): Promise<Response>;

  /**
   * Checks if the user's access token is expired and refreshed the token, if necessary.
   *
   * @param {string} refreshToken - The refresh token.
   * @param {number} expiresAt - Unix timestamp in milliseconds at which the token expires.
   * @returns {Promise<TokenData | null>} - A Promise with the data from the token endpoint if the token was refreshed.
   * Otherwise, a Promise with null value is returned.
   * @throws {Error} - If an error occurs during the token refresh process.
   */
  refreshTokenIfExpired(refreshToken: string, expiresAt: number): Promise<TokenData | null>;
}

/**
 * WristbandAuth is a utility class providing methods for seamless interaction with the Wristband authentication service.
 * @implements {WristbandAuth}
 */
export class WristbandAuthImpl implements WristbandAuth {
  private authService: AuthService;

  /**
   * Creates an instance of WristbandAuth.
   *
   * @param {AuthConfig} authConfig - The configuration for Wristband authentication.
   */
  constructor(authConfig: AuthConfig) {
    this.authService = new AuthService(authConfig);
  }

  login(c: Context, config?: LoginConfig): Promise<Response> {
    return this.authService.login(c, config);
  }

  callback(c: Context): Promise<CallbackData | Response> {
    return this.authService.callback(c);
  }

  logout(c: Context, config?: LogoutConfig): Promise<Response> {
    return this.authService.logout(c, config);
  }

  refreshTokenIfExpired(refreshToken: string, expiresAt: number): Promise<TokenData | null> {
    return this.authService.refreshTokenIfExpired(refreshToken, expiresAt);
  }
}
