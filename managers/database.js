/*
 * Files
 */
const {sql} = require('../config.json');

/*
 * Libraries
 */
const mysql = require('mysql');

/*
 * Utils
 */
const {Logger} = require("../utils/logger");
/*
 * Constants
 */
const {BotGuild} = require("../cons/bot_guild");
const {Category} = require("../cons/category");
const {Ticket} = require("../cons/ticket");

const con = mysql.createConnection({
    host: sql["host"],
    user: sql["user"],
    password: sql["password"],
    database: sql["database"],
    charset: 'utf8mb4',
    collation: 'utf8mb4_unicode_ci'
});

const botGuilds = new Map();
const tickets = new Map();

let initialized = false;

//TODO: Auto cleanup - Auto remove tickets that are older than X days
// Checker if tickets exists in guilds
class DatabaseManager {

    /**
     * Executes a query and returns the resultSet.
     * @param query - The query to execute.
     * @param params - The parameters to replace in the query.
     * @param callback - The callback to execute when the query is done.
     * @returns {Promise<void>} - The resultSet of the query.
     */
    async executeQuery(query, params, callback) {
        await con.query(query, params, function (err, result) {
            if (err) {
                Logger.log("&4Error while executing query: "
                    + query + " with params: " + params + " error: " + err);
            } else {
                const string = JSON.stringify(result);
                const json = JSON.parse(string);
                callback(json);
            }
        });
    }

    /**
     * Executes an update.
     * @param query - The query to execute.
     * @param params - The parameters to replace in the query.
     * @returns {Promise<void>}
     */
    async executeUpdate(query, params) {
        await con.query(query, params, function (err) {
            if (err) {
                Logger.log("&4Error while executing query: "
                    + query + " with params: " + params + " error: " + err);
            }
        });
    }

    /**
     * Initializes guilds using guilds tables.
     * Can be called only once.
     * @returns {Promise<void>}
     */
    async initGuilds(client) {
        Logger.log("&7Initializing guilds...");
        if (initialized) {
            Logger.log("&4Guilds already initialized!");
            return;
        }

        const guilds = client.guilds.cache;
        await guilds.forEach(guild => {
            Database.executeUpdate("INSERT IGNORE INTO guild_panels (id, guild_id, panel) VALUES (0, ?, ?)", [guild.id, "{ title: 'Panel', description: 'Ticket system', color: 65280 }"]);
            Database.executeUpdate("INSERT IGNORE INTO guild_language (id, guild_id) VALUES (0, ?)", [guild.id]);
            Database.executeQuery("SELECT p.guild_id, p.panel, p.buttons, p.channel_id, p.message_id, p.categories, l.lang FROM guild_panels p LEFT JOIN guild_language l ON p.guild_id = l.guild_id WHERE p.guild_id = ?", [guild.id], function (result) {
                tickets.set(guild.id, new Map());
                const categories = JSON.parse(result[0].categories);
                const ticketCategories = new Map();
                for (let i = 0; i < Object.keys(categories).length; i++) {
                    const cat = categories[Object.keys(categories)[i]];
                    const category = new Category(Object.keys(categories)[i],
                        cat.category_id,
                        cat.closed_category_id,
                        cat.allowed_roles_id,
                        cat.ping_roles_id,
                        cat.message,
                        cat.embed);
                    ticketCategories.set(Object.keys(categories)[i], category);
                }

                const botGuild = new BotGuild(guild.id,
                    result[0].panel,
                    result[0].buttons,
                    result[0].channel_id,
                    result[0].message_id,
                    ticketCategories,
                    result[0].categories,
                    result[0].lang);

                botGuilds.set(guild.id, botGuild);
                Database.executeQuery("SELECT * FROM `tickets` WHERE guild_id = ?", guild.id, function (result) {
                    for (let i = 0; i < result.length; i++) {
                        const ticket = new Ticket(result[i].id,
                            result[i].guild_id,
                            result[i].user_id,
                            result[i].claimed_by,
                            result[i].status,
                            result[i].type,
                            result[i].channel_id,
                            result[i].created_at,
                            result[i].last_activity_at,
                            result[i].closed_at);

                        tickets.get(guild.id).set(result[i].channel_id, ticket);
                        Logger.log("Loaded: " + tickets.get(guild.id).size + " ticket(s)");
                    }
                });
            });

        });

        Logger.log("&7Guilds initialized!");
        initialized = true;
    }

    /**
     * Gets the local cached botGuild object for the guild.
     * @param guild - Guild to get the botGuild object from local cache.
     * @returns {null|BotGuild} - The botGuild object for the guild or null if not found.
     */
    getCachedGuild(guild) {
        if (botGuilds.has(guild.id)) {
            return botGuilds.get(guild.id);
        } else {
            return null;
        }
    }

    /**
     * Gets the local cached ticket object for the ticket.
     * @param guild - The guild we want to get the tickets from.
     * @returns {any|Map<string, Ticket>} - The tickets map.
     */
    getCachedTickets(guild) {
        if (tickets.has(guild.id)) {
            return tickets.get(guild.id);
        } else {
            return new Map();
        }
    }

}

con.connect(function (err) {
    Logger.log("&7Connecting to database...");
    if (err) {
        Logger.log("&4Error while connecting to database: " + err);
        throw err;
    }
    Logger.log("&7Connected to database!");
});

const Database = new DatabaseManager();
Object.freeze(Database);
module.exports.Database = Database;
