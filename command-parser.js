/**
 * Function to check if a value is a number.
 * @param {any} value - The value to check.
 * @return {boolean} Returns true if the value is a number, otherwise false.
 */
const isNumber = (value) => !isNaN(value);
/**
 * Function to round a number to three decimal places.
 * @param {number} value - The number to round.
 * @return {number} The rounded number.
 */
const toFixed = (value) => Number(value.toFixed(3));

/**
 * Command Parser Class.
 */
class CommandParser {
  /**
   * Creates an instance of the CommandParser class.
   * @constructor
   * @param {Object} botState - The bot state object.
   */
  constructor(botState) {
    this.botState = botState;
  }

  /**
    * Parses a command message.
    * @param {Object} msgPacket - The message packet object.
    * @return {string|null} The result message or null.
    */
  handleCommand(msgPacket) {
    const msg = msgPacket.msg;
    // ! to start commands
    const cmdArray = msg.replace(/^!/, '').split(' ');
    const [cmd, ...args] = cmdArray;
    const result = [];

    const isTargetIdMatch = (this.botState.targetId === msgPacket.id) ?
    true : false;
    const isAdmin = (msgPacket.role === 'admin');

    switch (cmd.toLowerCase()) {
      case 'f':
      // TODO: Add making the bot follow another user,
      //  if the requester is an Admin.
        result.msg = this.followCommand(
            msgPacket, isTargetIdMatch, isAdmin);
        break;
      case 'fs':
        result.msg = this.unfollowCommand(
            msgPacket, isTargetIdMatch, isAdmin);
        break;
      case 'worlddata':
        result.msg = this.handleWorldDataCommand();
        break;
      default:
        result.error = 'ERR_INVALID_COMMAND';
        break;
    }

    this.logResult(result, msg);
    return result.msg || null;
  }

  /**
  * Handles the 'follow' command.
  * @param {Object} msgPacket - The message packet object.
  * @param {boolean} isTargetIdMatch - Whether the target ID
  *  matches the message ID.
  * @param {boolean} isAdmin - Whether the user is an admin.
  * @return {string} The result message.
  */
  followCommand(msgPacket, isTargetIdMatch, isAdmin) {
    if (isTargetIdMatch) {
      return `I am already following you, ${msgPacket.name}`;
    } else if (isAdmin) {
      this.botState.targetId = msgPacket.id;
      return `Following you, ${msgPacket.name}!`;
    } else if (this.botState.targetId !== 0) {
      return `I cannot follow you, ${msgPacket.name}, ` +
        `as I am already following someone else.`;
    } else {
      this.botState.targetId = msgPacket.id;
      return `I will now follow you, ${msgPacket.name}`;
    }
  }

  /**
     * Handles the 'unfollow' command.
     * @param {Object} msgPacket - The message packet object.
     * @param {boolean} isTargetIdMatch - Whether the target ID
     *  matches the message ID.
     * @param {boolean} isAdmin - Whether the user is an admin.
     * @return {string} The result message.
     */
  unfollowCommand(msgPacket, isTargetIdMatch, isAdmin) {
    if (isTargetIdMatch || (isAdmin && this.botState.targetId > 0)) {
      this.botState.targetId = 0;
      return `Ok, ${msgPacket.name}!`;
    } else if (this.botState.targetId === 0) {
      return `I am not following anyone, ${msgPacket.name}`;
    } else {
      return `I am not following you, ${msgPacket.name}`;
    }
  }

  /**
    * Handles the 'worlddata' command.
    * @return {string} The result message.
    */
  handleWorldDataCommand() {
    // Add logic to handle 'worlddata' command
    // For now, let's return a placeholder response
    return 'World data command is not implemented yet.';
  }

  /**
    * Logs the result of a command.
    * @param {Object} result - The result object.
    * @param {string} msg - The original message.
    */
  logResult(result, msg) {
    if (result.error) {
      console.log(`Error: ${result.error} for command: ${msg}`);
    } else {
      console.log(result.msg);
    }
  }

  /**
   * Checks if a message is a command.
   * @param {string} msg - The chat input message.
   * @return {boolean} Returns whether the input message is a command or not.
   */
  isCommand(msg) {
    return msg.startsWith('!') && msg.length > 1 && !msg.startsWith('!!');
  }
}

export default CommandParser;
