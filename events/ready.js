/*
 * Utils
 */
const {Logger} = require("../utils/Logger");

/*
 * Singleton
 */
const {Database} = require("../managers/Database");

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        await Database.initGuilds(client);
        await Logger.log(`Ready! Logged in as &a${client.user.tag}`);
    },
};