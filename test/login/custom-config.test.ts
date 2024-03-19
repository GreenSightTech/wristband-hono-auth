/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */

import httpMocks from 'node-mocks-http';

import { createWristbandAuth, WristbandAuth } from '../../src/index';
import { decryptLoginState } from '../../src/utils';
import { LoginState } from '../../src/types';

const CLIENT_ID = 'clientId';
const CLIENT_SECRET = 'clientSecret';
const CUSTOM_SCOPES = ['openid', 'roles'];
const CUSTOM_STATE = { test: 'abc' };
const LOGIN_STATE_COOKIE_SECRET = '7ffdbecc-ab7d-4134-9307-2dfcc52f7475';

describe('Custom Login Configurations', () => {
  let wristbandAuth: WristbandAuth;
  let rootDomain: string;
  let loginUrl: string;
  let redirectUri: string;
  let wristbandApplicationDomain: string;

  beforeEach(() => {
    rootDomain = 'business.invotastic.com';
    wristbandApplicationDomain = 'auth.invotastic.com';
    loginUrl = `https://{tenant_domain}.${rootDomain}/api/auth/login`;
    redirectUri = `https://{tenant_domain}.${rootDomain}/api/auth/callback`;
  });

  describe('Successful Redirect to Authorize Endpoint', () => {
    test('Custom Scopes Configuration at the Class Level', async () => {
      wristbandAuth = createWristbandAuth({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        loginStateSecret: LOGIN_STATE_COOKIE_SECRET,
        loginUrl,
        redirectUri,
        rootDomain,
        useCustomDomains: true,
        useTenantSubdomains: true,
        wristbandApplicationDomain,
        scopes: CUSTOM_SCOPES,
      });

      const mockExpressReq = httpMocks.createRequest({
        headers: { host: `devs4you.${rootDomain}` },
      });
      const mockExpressRes = httpMocks.createResponse();

      await wristbandAuth.login(mockExpressReq, mockExpressRes);

      // Validate Redirect response
      const { cookies, statusCode } = mockExpressRes;
      expect(statusCode).toEqual(302);
      const location: string = mockExpressRes._getRedirectUrl();
      expect(location).toBeTruthy();
      const locationUrl: URL = new URL(location);
      const { pathname, origin, searchParams } = locationUrl;
      expect(origin).toEqual(`https://devs4you.${wristbandApplicationDomain}`);
      expect(pathname).toEqual('/api/v1/oauth2/authorize');

      // Validate query params of Authorize URL
      expect(searchParams.get('scope')).toEqual(CUSTOM_SCOPES.join(' '));

      // Validate login state cookie
      expect(Object.keys(cookies)).toHaveLength(1);
      const loginStateCookie = Object.entries(cookies)[0];
      const keyParts: string[] = loginStateCookie[0].split(':');
      const cookieValue = loginStateCookie[1];
      expect(Object.keys(cookieValue)).toHaveLength(2);
      const loginState: LoginState = await decryptLoginState(cookieValue.value, LOGIN_STATE_COOKIE_SECRET);
      expect(loginState.state).toEqual(keyParts[1]);
      expect(loginState.customState).toBeFalsy();
      expect(loginState.tenantDomainName).toBe('devs4you');
    });

    test('Custom State at the Function Level', async () => {
      wristbandAuth = createWristbandAuth({
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        loginStateSecret: LOGIN_STATE_COOKIE_SECRET,
        loginUrl,
        redirectUri,
        rootDomain,
        useCustomDomains: true,
        useTenantSubdomains: true,
        wristbandApplicationDomain,
      });

      const mockExpressReq = httpMocks.createRequest({
        headers: { host: `devs4you.${rootDomain}` },
      });
      const mockExpressRes = httpMocks.createResponse();

      await wristbandAuth.login(mockExpressReq, mockExpressRes, { customState: CUSTOM_STATE });

      // Validate Redirect response
      const { cookies, statusCode } = mockExpressRes;
      expect(statusCode).toEqual(302);
      const location: string = mockExpressRes._getRedirectUrl();
      expect(location).toBeTruthy();
      const locationUrl: URL = new URL(location);
      const { pathname, origin } = locationUrl;
      expect(origin).toEqual(`https://devs4you.${wristbandApplicationDomain}`);
      expect(pathname).toEqual('/api/v1/oauth2/authorize');

      // Validate login state cookie
      expect(Object.keys(cookies)).toHaveLength(1);
      const loginStateCookie = Object.entries(cookies)[0];
      const keyParts: string[] = loginStateCookie[0].split(':');
      const cookieValue = loginStateCookie[1];
      expect(Object.keys(cookieValue)).toHaveLength(2);
      const loginState: LoginState = await decryptLoginState(cookieValue.value, LOGIN_STATE_COOKIE_SECRET);
      expect(loginState.state).toEqual(keyParts[1]);
      expect(loginState.customState).toEqual(CUSTOM_STATE);
      expect(loginState.tenantDomainName).toBe('devs4you');
    });
  });
});
