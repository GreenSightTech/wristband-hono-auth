import axios, { AxiosInstance } from 'axios';
import Agent from 'agentkeepalive';

import { FORM_URLENCODED_MEDIA_TYPE, JSON_MEDIA_TYPE } from './utils/constants';

export class WristbandApiClient {
  public axiosInstance: AxiosInstance;

  constructor(wristbandApplicationDomain: string) {
    this.axiosInstance = axios.create({
      baseURL: `https://${wristbandApplicationDomain}/api/v1`,
      httpAgent: new Agent({
        maxSockets: 100,
        maxFreeSockets: 10,
        timeout: 60000,
        freeSocketTimeout: 30000,
      }),
      headers: { 'Content-Type': FORM_URLENCODED_MEDIA_TYPE, Accept: JSON_MEDIA_TYPE },
      maxRedirects: 0,
    });
  }
}
