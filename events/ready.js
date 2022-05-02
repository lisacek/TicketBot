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
        setInterval(async function () {
            await Database.clearTask(client)
        }, 1000 * 60);
        await Logger.log(`Ready! Logged in as &d${client.user.tag}`);
    },
};