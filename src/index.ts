import { AuthConfig, CallbackData, LoginConfig, LogoutConfig, TokenData } from './types';
import { WristbandAuth, WristbandAuthImpl } from './wristband-auth';
import { WristbandError } from './error';

/**
 * Wristband SDK function to create an instance of WristbandAuth.
 * @param {AuthConfig} - authConfig Configuration for Wristband authentication.
 * @returns {WristbandAuth} - An instance of WristbandAuth.
 */
function createWristbandAuth(authConfig: AuthConfig): WristbandAuth {
  return new WristbandAuthImpl(authConfig);
}

/**
 * Exports
 */
export type { AuthConfig, CallbackData, LoginConfig, LogoutConfig, TokenData, WristbandAuth };
export { createWristbandAuth, WristbandError };
