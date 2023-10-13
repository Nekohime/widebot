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
const states = await client.worldStateConnect(1); // get users' states

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

const updateType = {
  unknown: 0,
  joining: 1,
  leaving: 2,
  moving: 3,
  teleporting: 4,
};
const localUserState = {
      entityType: entityType.user,
      updateType: updateType.moving,
      entityId: 3,
      x: 2,
      y: 1,
      z: 2,
      yaw: 0,
      pitch: 0,
      roll: 0,
      dataBlock0: 3,
    };

// states.onMessage((msg) => { console.log(msg); }); //display user srares in terminal
states.onMessage((msg) => {
  const u = msg[0];
  if (u.entityId === 1) {
    localUserState.x = u.x;
    localUserState.y = u.y;
    localUserState.z = u.z;
  }

  states.send(localUserState)
});
// const ws = new WebSocket(wsURL + '/api/worlds/1/ws/state?token=' + encodeURIComponent(data.token));
