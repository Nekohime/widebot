import fetch from 'node-fetch';
import {entityType, updateType} from './common/ws-data-format.js';
import WsClient from './ws-client.js';
import CommandParser from './command-parser.js';

/**
 * Function to check if a value is a number.
 * @param {any} value - The value to check.
 * @return {boolean} Returns true if the value is a number, otherwise false.
 */
const isNumber = (value) => !isNaN(value);

/**
 * Represents a client for interacting with a WebSocket server.
 * @class
 */
class Client {
  /**
 * Creates an instance of the Client class.
 * @constructor
 * @param {string} wsURL - The WebSocket URL.
 * @param {string} httpURL - The HTTP URL.
 * @param {Object} authJSON - Authentication JSON object containing username
   and password.
 */
  constructor(wsURL, httpURL, authJSON) {
    this.wsURL = wsURL;
    this.httpURL = httpURL;
    this.authJSON = authJSON;

    this.botState = {
      targetId: 0, // For fun stuff
      myState: {
        entityType: entityType.user,
        updateType: updateType.moving,
        entityId: 3, // User ID in database
        x: 6.916,
        y: 0.03,
        z: 3211.1782,
        yaw: 300,
        pitch: 0,
        roll: 0,
        dataBlock0: 3, // Avatar ID - Why dataBlock0?
      },
    };
  }

  /**
 * Authenticates the client by sending a request to the server.
 * @async
 * @return {Promise<string>} The authentication token.
 */
  async authenticate() {
    const response = await fetch(this.httpURL + '/api/login', {
      method: 'post',
      body: JSON.stringify(this.authJSON),
      headers: {'Content-Type': 'application/json'},
    });

    const data = await response.json();
    return data.token;
  }

  /**
    * Fetches world data using the provided token.
    * @async
    * @param {string} token - The authentication token.
    * @return {Promise<Object>} World data.
    */
  async fetchWorldData(token) {
    return {worlds: [1]};
  }

  /**
     * Processes the specified world, establishing WebSocket connections,
       and handling messages.
     * @async
     * @param {number} world - The world to process.
     * @param {string} token - The authentication token.
     */
  async processWorld(world, token) {
    const client = new WsClient(`${this.wsURL}/api`, encodeURIComponent(token));
    const chat = await client.worldChatConnect(world);
    const states = await client.worldStateConnect(1);
    const parser = new CommandParser(this.botState);

    chat.onMessage((message) => {
      const msgPacket = JSON.parse(message);

      if (msgPacket && msgPacket.msg) {
        let ret = null;
        if (parser.isCommand(msgPacket.msg)) {
          ret = parser.handleCommand(msgPacket);
        }
        console.log(`[World#${world}] <${msgPacket.name}>: ${msgPacket.msg}`);
        if (ret) chat.send(ret);
      }
    });

    chat.onClose((event) => {
      // Handle chat close event if needed
    });

    states.onMessage((users) => {
      // console.log(users) Spammy
      users.forEach((user, i) => {
        this.doFollow(user);
      });

      states.send(this.botState.myState);
    });
  }


  /**
     * Updates the client's state to follow the specified user.
     * @async
     * @param {Object} user - The user to follow.
     */
  async doFollow(user) {
    if (isNumber(user?.entityId) && this.botState.targetId === user?.entityId) {
      this.botState.myState.x = user.x;
      this.botState.myState.y = user.y;
      this.botState.myState.z = user.z;
    }
  }

  /**
   * Main entry point of the client, handling authentication and processing of
     worlds.
   * @async
   */
  async main() {
    try {
      const token = await this.authenticate();
      const worldData = await this.fetchWorldData(token);

      await Promise.all(
          worldData.worlds.map((world) => this.processWorld(world, token)),
      );
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }
}

export default Client;
