import 'dotenv/config';
import Client from './client.js';

/*
  WIDEWORLDS_LOCAL_WS="ws://localhost:8080"
  WIDEWORLDS_LOCAL_HTTP="http://localhost:8080"
  WIDEWORLDS_LOCAL_USERNAME="username"
  WIDEWORLDS_LOCAL_PASSWORD="password"
*/
const client = new Client(
    process.env.WIDEWORLDS_LOCAL_WS || 'ws://localhost:8080',
    process.env.WIDEWORLDS_LOCAL_HTTP || 'http://localhost:8080',
    {
      username: process.env.WIDEWORLDS_LOCAL_USERNAME,
      password: process.env.WIDEWORLDS_LOCAL_PASSWORD,
    },
);

client.main();
