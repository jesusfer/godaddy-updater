import {
  Response,
  performRequest,
  PublicIPResponse,
  GodaddyRecord,
} from './http-requests';
import { RequestOptions } from 'http';

import { debug } from 'debug';

const log = debug('updater');

export interface GodaddyUpdaterOptions {
  domain: string;
  recordType: string;
  recordName: string;
  recordTtl?: number;
  apiKey: string;
  apiSecret: string;
}

export class GodaddyUpdater {
  private publicIpUrl: string = 'https://api.ipify.org?format=json';
  private apiRecordUrl: string = `https://api.godaddy.com/v1/domains/${this.options.domain}/records/${this.options.recordType}/${this.options.recordName}`;

  public constructor(public options: GodaddyUpdaterOptions) {}

  public async GetPublicIp(): Promise<string> {
    const response = await performRequest(this.publicIpUrl, {
      method: 'GET',
    });
    return (response.data as PublicIPResponse).ip;
  }

  public async UpdatePublicIp(): Promise<boolean> {
    const ip = await this.GetPublicIp();
    log(`Current Public IP: ${ip}`);
    let options: RequestOptions = {
      method: 'GET',
      headers: {
        Authorization: `sso-key ${this.options.apiKey}:${this.options.apiSecret}`,
      },
    };
    let response: Response;
    try {
      response = await performRequest(this.apiRecordUrl, options);
    } catch (error) {
      log(`Error getting current DNS record: ${error.message}`);
      return;
    }
    const currentRecords = response.data as GodaddyRecord[];
    log('Current DNS records:');
    log(currentRecords);
    if (!currentRecords.some((record) => record.data === ip)) {
      // Current IP is not in the records, so update it
      log('Updating DNS records');
      options = {
        method: 'PUT',
        headers: {
          Authorization: `sso-key ${this.options.apiKey}:${this.options.apiSecret}`,
          'Content-Type': 'application/json',
        },
      };
      const body = JSON.stringify([
        {
          data: ip,
          name: this.options.recordName,
          ttl: this.options.recordTtl ?? 600,
          type: this.options.recordType,
        },
      ]);
      try {
        response = await performRequest(this.apiRecordUrl, options, body);
      } catch (error) {
        log(`There was an error: ${error}`);
        return false;
      }
      return true;
    } else {
      log('No need to update DNS records.');
    }
  }
}
