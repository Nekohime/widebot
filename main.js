import 'dotenv/config';
import Client from './client.js';

/*
  In `.env`
  Replace LOCAL with REMOTE if necessary.
  WIDEWORLDS_LOCAL_WS="ws://localhost:8080"
  WIDEWORLDS_LOCAL_HTTP="http://localhost:8080"
  WIDEWORLDS_LOCAL_USERNAME="username"
  WIDEWORLDS_LOCAL_PASSWORD="password"
*/

const whichEnv = 'REMOTE';

const wsUrl = whichEnv === 'REMOTE' ? process.env.WIDEWORLDS_REMOTE_WS : process.env.WIDEWORLDS_LOCAL_WS || 'ws://localhost:8080';
const httpUrl = whichEnv === 'REMOTE' ? process.env.WIDEWORLDS_REMOTE_HTTP : process.env.WIDEWORLDS_LOCAL_HTTP || 'http://localhost:8080';

const client = new Client(
    wsUrl || 'ws://localhost:8080',
    httpUrl || 'http://localhost:8080', {
      username: whichEnv === 'REMOTE' ? process.env.WIDEWORLDS_REMOTE_USERNAME :
      process.env.WIDEWORLDS_LOCAL_USERNAME || 'defaultUsername',
      password: whichEnv === 'REMOTE' ? process.env.WIDEWORLDS_REMOTE_PASSWORD :
      process.env.WIDEWORLDS_LOCAL_PASSWORD || 'defaultPassword',
    },
);

client.main();
