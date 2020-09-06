import { GodaddyUpdater, GodaddyUpdaterOptions } from './GodaddyUpdater';
import * as schedule from 'node-schedule';
import { debug } from 'debug';

const log = debug('index');

const opts: GodaddyUpdaterOptions = {
  domain: process.env.DOMAIN,
  recordName: process.env.RECORDNAME,
  recordType: process.env.RECORDTYPE,
  apiKey: process.env.APIKEY,
  apiSecret: process.env.APISECRET,
};
log('Starting with options:');
const printOptions = Object.assign({}, opts);
printOptions.apiSecret = opts.apiSecret ? '***' : opts.apiSecret;
log(printOptions);

if (opts.apiSecret === undefined) {
  throw new Error('Env variables missing!');
}
const updater = new GodaddyUpdater(opts);
const scheduled = schedule.scheduleJob('0 0 * * * *', (_) => {
  log(`Updating at ${new Date()}`);
  updater.UpdatePublicIp();
});
scheduled.invoke();
