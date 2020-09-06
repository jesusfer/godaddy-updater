import { IncomingHttpHeaders, RequestOptions } from 'http';
import { request } from 'https';

import { debug } from 'debug';

const log = debug('http-requests');

export interface Response {
  data: object;
  headers: IncomingHttpHeaders;
}

export interface PublicIPResponse {
  ip: string;
}

export interface GodaddyRecord {
  data: string;
  name: string;
  ttl: number;
  type: string;
}

const performRequest = (
  url: string,
  options: RequestOptions,
  body?: string,
): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const req = request(url, options, (response) => {
      const { statusCode, headers } = response;
      if (statusCode >= 300) {
        log(`Status != 200: ${statusCode} (${response.statusMessage})`);
        reject(new Error(response.statusMessage));
      }
      const chunks = [];
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      response.on('end', () => {
        const data = Buffer.concat(chunks).toString();
        const result: Response = {
          data: data ? JSON.parse(data) : {},
          headers,
        };
        resolve(result);
      });
    });
    if (body) {
      req.write(body);
    }
    req.end();
  });
};

export { performRequest };
