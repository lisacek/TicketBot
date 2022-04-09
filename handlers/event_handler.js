/*
 * Libraries
 */
const fs = require("fs");

/*
 * Event_handler
 */
const {Logger} = require("../utils/logger");

class Event_handler {

    constructor(client) {
        this.client = client;
    }

    /**
     * Reads all events file and registers them as events.
     */
    registerEvents() {
        Logger.log("&7Registering events...");

        const eventFiles = fs.readdirSync('./events')
            .filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const event = require(`../events/${file}`);
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args));
            }
        }
        Logger.log("&7Successfully registered events!");
    }
}

module.exports.EventHandler = Event_handler;