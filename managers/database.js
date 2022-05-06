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
const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js");
const {Lang} = require("../utils/lang");
const discordTranscripts = require("discord-html-transcripts");

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
let ticketId = -1;

let initialized = false;

class DatabaseManager {

    /**
     * Initialize the database manager
     * @returns {Promise<void>}
     */
    async init() {
        await Database.executeUpdate("create table if not exists guild_language (id int auto_increment primary key, guild_id varchar(32) not null, lang varchar(3) default 'en' not null, constraint guild_id unique (guild_id)) charset = utf8mb4;", "");
        await Database.executeUpdate("create table if not exists guild_panels (id int auto_increment primary key, guild_id varchar(32) default '' not null, panel longtext collate utf8mb4_unicode_ci not null, channel_id varchar(32) null, message_id varchar(32) null, buttons longtext collate utf8mb4_bin default '{\"0\":{\"name\":\"TICKET\",\"id\":\"ticket\",\"color\":\"SECONDARY\",\"emoji\":\"747130842446561310\"}}' not null, categories longtext collate utf8mb4_bin default '{    \"ticket\":{       \"category-id\":null,       \"allowed-roles-id\":[                 ],       \"ping-roles-id\":[                 ],       \"message\":\"Hello, {User}!\",       \"embed\":{          \"title\":\"Panel\",          \"description\":\"Ticket system\",          \"color\":65280       }    } }' not null, constraint guild_id unique (guild_id)) charset = utf8mb4;", "");
        await Database.executeUpdate("create table if not exists guild_panels (id int auto_increment primary key, guild_id varchar(32) default '' not null, panel longtext collate utf8mb4_unicode_ci not null, channel_id varchar(32) null, message_id varchar(32) null, buttons longtext collate utf8mb4_bin default '{\"0\":{\"name\":\"TICKET\",\"id\":\"ticket\",\"color\":\"SECONDARY\",\"emoji\":\"747130842446561310\"}}' not null, categories longtext collate utf8mb4_bin default '{    \"ticket\":{       \"category-id\":null,       \"allowed-roles-id\":[                 ],       \"ping-roles-id\":[                 ],       \"message\":\"Hello, {User}!\",       \"embed\":{          \"title\":\"Panel\",          \"description\":\"Ticket system\",          \"color\":65280       }    } }' not null, constraint guild_id unique (guild_id)) charset = utf8mb4;", "");
    }

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
        Logger.log("Initializing guilds...");
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

        Logger.log("Guilds initialized!");
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
     * Sets local-cached ticketId.
     * @returns {Promise<void>}
     */
    async updateTicketId() {
        await Database.executeQuery("SELECT * FROM tickets ORDER BY id DESC LIMIT 1", "", function (result) {
            try {
                ticketId = result[0].id + 1;
            } catch (e) {
                ticketId = 0;
            }
        });
    }

    /**
     * Gets local-cached ticketId.
     * @returns {number}
     */
    getAndIncrementTicketId() {
        return ticketId++;
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

    async clearTask(client) {
        Logger.log("Clearing tickets...");
        let x = 0;
        tickets.forEach((guildTickets, guildId) => {
            guildTickets.forEach((ticket, channelId) => {
                const guild = client.guilds.cache.get(guildId);
                const channel = guild.channels.cache.get(channelId);
                if (channel == null) {
                    Database.executeUpdate("DELETE FROM tickets WHERE channel_id = ?", channelId);
                    guildTickets.delete(channelId);
                    x++;
                }
            });
        });
        tickets.forEach((guildTickets, guildId) => {
            guildTickets.forEach((ticket, channelId) => {
                const creationDate = ticket.createdAt;
                const currentDate = new Date().getTime();

                if(currentDate - creationDate > 432000000) {
                    const guild = client.guilds.cache.get(guildId);
                    const channel = guild.channels.cache.get(channelId);
                    if(channel != null && ticket.status === 2) {
                        deleteTicket(channel, guild);
                        x++;
                    }
                    if(channel != null && ticket.status === 0) {
                        closeTicket(channel, guild, botGuilds.get(guildId), ticket.userId);
                        x++;
                    }
                }
            });
        });
        Logger.log("Cleared &a" + x + " &rtickets!");
    }

}

async function closeTicket(channel, guild, botGuild, userId) {
    const ticket = Database.getCachedTickets(guild).get(channel.id);
    if (ticket == null) return;
    const embed = {
        title: "Ticket closed",
        description: "Ticket was closed by the staff.",
        color: 0x00ff00
    }
    const row = new MessageActionRow()
        .addComponents(new MessageButton()
            .setStyle('SUCCESS')
            .setLabel('Open')
            .setCustomId('open')
            .setEmoji('🔓'))
        .addComponents(new MessageButton()
            .setStyle('DANGER')
            .setLabel('Delete')
            .setCustomId('delete')
            .setEmoji('🗑️'));
    await channel.permissionOverwrites.edit(userId, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: false
    });
    ticket.status = 2;
    await channel.setParent(botGuild.ticketCategories.get(ticket.type).closedCategoryId);
    channel.send({embeds: [embed], components: [row]});
    await Database.executeUpdate("UPDATE tickets SET status = 2, created_at = ?, closed_at = ? WHERE channel_id = ?", [new Date().getTime(), new Date().getTime(), channel.id]);
}

async function deleteTicket(channel, guild) {
    const ticket = Database.getCachedTickets(guild).get(channel.id);
    if (ticket == null) return;

    const transcriptChannel = guild.channels.cache.filter(c => c.id === "968479339165384714").first();
    const attachment = await discordTranscripts.createTranscript(channel);

    const member = guild.members.cache.filter(u => u.id === ticket.userId).first();
    //TODO: CHECK IF USER IS IN THE GUILD !!!!!!!!!!!!!!!!

    const embedTrans = await new MessageEmbed()
        .setAuthor(`${member.user.tag}`, member.user.avatarURL())
        .setColor(0x00AE86)
        .setTimestamp();

    transcriptChannel.send({
        embeds: [embedTrans]
    }).then(m => {
        m.reply({files: [attachment]}).then(am => {
            embedTrans.addField("Ticket Owner", member.user.tag, true)
            embedTrans.addField("Ticket Name", `${channel.name}`, true);
            embedTrans.addField("Category", `${ticket.type}`, true);
            embedTrans.addField("Transcript", `[Link](${am.attachments.first().url})`, true);
            m.edit({embeds: [embedTrans]});
        });
    });
    setTimeout(() => {
        channel.delete();
        Database.executeUpdate("DELETE FROM tickets WHERE channel_id = ?",
            [channel.id]);
    }, 5000);
}

con.connect(function (err) {
    Logger.log("Connecting to database...");
    if (err) {
        Logger.log("&4Error while connecting to database: " + err);
        throw err;
    }
    Logger.log("Connected to database!");
});

const Database = new DatabaseManager();
Object.freeze(Database);
module.exports.Database = Database;
