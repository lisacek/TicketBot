/*
 * Libraries
 */
const {Collection} = require("discord.js");
const fs = require("node:fs");
const {Routes} = require("discord-api-types/v9");

/*
 * Utils
 */
const {Logger} = require("../utils/logger");

class Command_handler {

    constructor(client, rest) {
        this.client = client;
        this.rest = rest;
    }

    registerCommands() {
        Logger.log("&7Registering commands...");
        this.client.commands = new Collection();
        const commandFiles = fs.readdirSync('./commands')
            .filter(file => file.endsWith('.js'));

        const commands = [];

        for (const file of commandFiles) {
            const command = require(`../commands/${file}`);
            this.client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }

        this.rest.put(Routes.applicationGuildCommands("623819296275169292",
            "608019373160005644"), {body: commands})
            .then(() => Logger.log('&7Successfully registered commands!'))
            .catch(console.error);
    }
}

module.exports.CommandHandler = Command_handler;