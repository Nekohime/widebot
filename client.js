import {entityType, updateType} from './common/ws-data-format.js';
import CommandParser from './command-parser.js';
import fetch from 'node-fetch';
import WsClient from './ws-client.js';

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

    this.defaults = {
      x: 6.916,
      y: 0.03,
      z: 3211.1782,
      yaw: 300,
      pitch: 0,
      roll: 0,
    };

    this.botState = {
      targetId: 0, // For fun stuff

      sdkState: {
        entityType: entityType.user,
        updateType: updateType.moving,
        entityId: 1, // User ID in database
        x: this.defaults.x,
        y: this.defaults.y,
        z: this.defaults.z,
        yaw: this.defaults.yaw,
        pitch: this.defaults.pitch,
        roll: this.defaults.roll,
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
    try {
      const client = new WsClient(`${this.wsURL}/api`,
          encodeURIComponent(token));
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

        states.send(this.botState.sdkState);
      });
    } catch (error) {
      console.error(`Error processing world ${world}:`, error);
    }
  }


  /**
     * Updates the client's state to follow the specified user.
     * @async
     * @param {Object} user - The user to follow.
     */
  async doFollow(user) {
    // Check if the user's entityId is a number and matches the targetId
    if (isNumber(user?.entityId) && this.botState.targetId === user?.entityId) {
      const followDistance = 2.0; // Distance minimun to maintain from the user.
      const followSpeed = 0.2; // Speed factor for following.
      const smoothingFactor = 0.2; // Smoothing factor for gradual adjustment.

      // Calculate the differences between the user's position
      //  and the bot's position
      const deltaX = user.x - this.botState.sdkState.x;
      const deltaY = user.y - this.botState.sdkState.y;
      const deltaZ = user.z - this.botState.sdkState.z;

      // Calculate the distance between the bot and the user
      const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);

      // Calculate the offset based on the follow distance
      const offsetX = (deltaX / distance) * followDistance;
      // Offset in the y-axis is set to 0 as we are
      //  not adjusting for height differences.
      const offsetY = 0;
      // Calculate the offset based on the follow distance
      const offsetZ = (deltaZ / distance) * followDistance;


      // Incrementally update the bot's position
      //  with the offset and follow speed
      this.botState.sdkState.x += (deltaX - offsetX) * followSpeed;
      this.botState.sdkState.y += (deltaY - offsetY) * followSpeed;
      this.botState.sdkState.z += (deltaZ - offsetZ) * followSpeed;
      // Calculate the yaw angle to face towards the user
      const targetYaw = Math.atan2(deltaX, deltaZ);

      // Check if the angle difference is within a reasonable range
      const angleDifference = targetYaw - this.botState.sdkState.yaw;
      if (Math.abs(angleDifference) < Math.PI) {
        // Smoothly adjust the bot's yaw towards the target yaw
        this.botState.sdkState.yaw += angleDifference * smoothingFactor;
      } else {
        // If the angle difference is too large,
        //  directly set the yaw to the target's yaw.
        this.botState.sdkState.yaw = targetYaw;
      }
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
