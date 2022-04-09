/*
 * Libraries
 */
const {Client, Intents} = require('discord.js');
const {REST} = require('@discordjs/rest');

/*
 * Constants
 */
const {token} = require('./config.json');

const {CommandHandler} = require('./handlers/command_handler');
const {EventHandler} = require("./handlers/event_handler");

const rest = new REST({version: '9'}).setToken(token);
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

const ctx = new CommandHandler(client, rest);
const etx = new EventHandler(client);

// Registers everything we need
ctx.registerCommands(client);
etx.registerEvents(client);

// Logs in into the bot
client.login(token);