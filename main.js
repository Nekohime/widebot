// import WebSocket from 'isomorphic-ws';
import fetch from 'node-fetch';
import {
  serializeEntityState, packEntityStates,
  deserializeEntityState, entityType,
} from './common/ws-data-format.js';
// import * as assert from 'assert';
import WsClient from './ws-client.js';

const authJSON = {username: 'user#3', password: 'user#3'};

const httpURL = 'http://localhost:8080';
const wsURL = 'ws://localhost:8080';

const response = await fetch(httpURL + '/api/login', {
  method: 'post',
  body: JSON.stringify(authJSON),
  headers: {'Content-Type': 'application/json'},
});

const data = await response.json();


const client = new WsClient(`${wsURL}/api`, encodeURIComponent(data.token));
const chat = await client.worldChatConnect(1);
let message = null;
let closed = false;

chat.onMessage((msg) => {
  message = JSON.parse(msg);
  console.log(message.name, message.msg);
  if (message.msg.startsWith('hi')) {
    chat.send('Hello! I am a bot! Beep boop!');
  }
});

chat.onClose((event) => {
  closed = true;
});
// const ws = new WebSocket(wsURL + '/api/worlds/1/ws/state?token=' + encodeURIComponent(data.token));
