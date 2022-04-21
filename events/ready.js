/*
 * Utils
 */
const {Logger} = require("../utils/logger");

/*
 * Singleton
 */
const {Database} = require("../managers/database");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await Database.init();
        await Database.initGuilds(client);
        await Database.updateTicketId();
        await Logger.log(`Ready! Logged in as &a${client.user.tag}`);
    },
};