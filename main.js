import fetch from 'node-fetch';
/* import {
  serializeEntityState, packEntityStates,
  deserializeEntityState, entityType,
} from './common/ws-data-format.js'; */
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

// -------- //

// TODO: Modularize


// World ids to join
const worlds = [
  1, 2,
];

// Process each world in parallel, in any order.
await Promise.all(worlds.map(async (world) => {
  await handleWorld(world);
}));

// Magic happens here
async function handleWorld(world) {
  const client = new WsClient(`${wsURL}/api`, encodeURIComponent(data.token));
  const chat = await client.worldChatConnect(world);
  // TODO: multiworld state stuff
  // const states = await client.worldStateConnect(1); // get users' states

  let message = null;
  // let closed = false;

  chat.onMessage((m) => {
    message = JSON.parse(m);

    console.log(`[World#${world}] <${message.name}>: ${message.msg}`);
    if (message.msg.startsWith('hi')) {
      chat.send('Hello! I am a bot! Beep boop!');
    }
  });

  chat.onClose((event) => {
    // closed = true;
  });
}

/*
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

states.onMessage((msg) => {
  const u = msg[0];
  if (u.entityId === 1) {
    localUserState.x = u.x;
    localUserState.y = u.y;
    localUserState.z = u.z;
  }

  states.send(localUserState);
});
*/
