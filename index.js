/*
 * Libraries
 */
const {Client, Intents} = require('discord.js');
const {REST} = require('@discordjs/rest');

/*
 * Constants
 */
const {token} = require('./configExample.json');

const {CommandHandler} = require('./handlers/CommandHandler');
const {EventHandler} = require("./handlers/EventHandler");

const rest = new REST({version: '9'}).setToken(token);
const client = new Client({intents: [Intents.FLAGS.GUILDS]});

const ctx = new CommandHandler(client, rest);
const etx = new EventHandler(client);

// Registers everything we need
ctx.registerCommands(client);
etx.registerEvents(client);

// Logs in into the bot
client.login(token);