/*
 * Libraries
 */
const {MessageActionRow, MessageButton, MessageEmbed} = require("discord.js");
const discordTranscripts = require('discord-html-transcripts');

/*
 * Singleton
 */
const {Database} = require("../managers/database");

/*
 * Utils
 */
const {Logger} = require("../utils/logger");
const {Lang} = require("../utils/lang");

/*
 * Constants
 */
const {Ticket} = require("../cons/ticket");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.isButton()) return;

        const message = interaction.message;
        const channel = message.channel;
        const guild = message.guild;
        const botGuild = Database.getCachedGuild(guild);

        if (botGuild == null) {
            Logger.log(`&4Could not find guild ${guild.id} in cache!`);
            return;
        }
        if (botGuild.guildId == null) return;
        if (botGuild.guildId !== guild.id) return;

        if (botGuild.panelChannelId == null) return;
        if (botGuild.panelChannelId !== channel.id && !Database.getCachedTickets(guild).has(channel.id)) {
            Logger.log("&4Oops");
            return;
        }

        if (botGuild.panelMessageId == null) return;

        switch (interaction.customId) {
            case "claim":
                await claimTicket(interaction, channel, guild, botGuild);
                break;
            case "close":
                await closeTicket(interaction, channel, guild, botGuild);
                break;
            case "open":
                await openTicket(interaction, channel, guild, botGuild);
                break;
            case "delete":
                await deleteTicket(interaction, channel, guild, botGuild);
                break;
            default:
                await createTicket(interaction, botGuild);
                break;
        }

    },
};

async function deleteTicket(interaction, channel, guild, botGuild) {
    const ticket = Database.getCachedTickets(guild).get(channel.id);
    if (ticket == null) return;
    if (!hasPermission(interaction, ticket, botGuild, false)) {
        interaction.reply({
            content: Lang.get("ticket-no-permission-to-delete",
                botGuild.language),
            ephemeral: true
        });
        return;
    }
    interaction.reply({
        content: Lang.get("ticket-delete", botGuild.language) + " " + channel.toString(),
        ephemeral: true
    });
    const transcriptChannel = interaction.guild.channels.cache.filter(c => c.id === "968479339165384714").first();
    const attachment = await discordTranscripts.createTranscript(channel);
    attachment.setName(channel.name + ".html");
    const member = interaction.guild.members.cache.filter(u => u.id === ticket.userId).first();
    //TODO: CHECK IF USER IS IN THE GUILD !!!!!!!!!!!!!!!!

    const embedTrans = await new MessageEmbed()
        .setAuthor(`${member.user.tag}`, member.user.avatarURL())
        .setColor(0x00AE86)
        .setTimestamp();

    transcriptChannel.send({
        embeds: [embedTrans]
    }).then(m => {
        m.reply({files: [attachment]}).then(am => {
            embedTrans.addField(Lang.get("ticket-owner",
                botGuild.language), member.user.tag, true)
            embedTrans.addField(Lang.get("ticket-name",
                botGuild.language), `${channel.name}`, true);
            embedTrans.addField(Lang.get("ticket-category",
                botGuild.language), `${ticket.type}`, true);
            embedTrans.addField(Lang.get("ticket-transcript",
                botGuild.language), `[` + Lang.get("ticket-transcript-link",
                botGuild.language) +`](${am.attachments.first().url})`, true);
            m.edit({embeds: [embedTrans]});
        });
    });
    setTimeout(() => {
        channel.delete();
        Database.executeUpdate("DELETE FROM tickets WHERE channel_id = ?",
            [interaction.channel.id]);
    }, 5000);
}

async function openTicket(interaction, channel, guild, botGuild) {
    const ticket = Database.getCachedTickets(guild).get(channel.id);
    if (ticket == null) return;
    if (!hasPermission(interaction, ticket, botGuild, true)) {
        interaction.reply({
            content: Lang.get("ticket-no-permission-to-open",
                botGuild.language),
            ephemeral: true
        });
        return;
    }
    if (ticket.status !== 2 && ticket.status && "2") {
        await interaction.reply({
            content: Lang.get("ticket-already-opened",
                botGuild.language),
            ephemeral: true
        });
        return;
    }
    const embed = {
        title: "Ticket",
        description: "Ticket was re-opened.",
        color: 0x00ff00
    }
    const row = new MessageActionRow()
        .addComponents(new MessageButton()
            .setStyle('PRIMARY')
            .setLabel(Lang.get("ticket-close-button",
                botGuild.language))
            .setCustomId('close')
            .setEmoji('🔒'));
    await channel.permissionOverwrites.edit(interaction.user.id, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true
    });
    ticket.status = 0;

    interaction.guild.channels.cache.filter(c => c.id === botGuild.panelChannelId).first().messages.fetch(botGuild.panelMessageId)
        .then(m => {
            m.edit({
                embed: embed,
                actions: row
            });
        });
    await channel.setParent(botGuild.ticketCategories.get(ticket.type).categoryId);
    interaction.reply({embeds: [embed], components: [row], ephemeral: false});
    await Database.executeUpdate("UPDATE tickets SET status = 0, closed_at = 0 WHERE channel_id = ?", [interaction.channel.id]);
}

async function closeTicket(interaction, channel, guild, botGuild) {
    const ticket = Database.getCachedTickets(guild).get(channel.id);
    if (ticket == null) return;
    if (!hasPermission(interaction, ticket, botGuild, true)) {
        interaction.reply({
            content: Lang.get("ticket-no-permission-to-close",
                botGuild.language),
            ephemeral: true
        });
        return;
    }
    if (ticket.status !== 1 && ticket.status !== "1" && ticket.status !== 0 && ticket.status && "0") {
        await interaction.reply({content: Lang.get("ticket-already-closed",
                botGuild.language), ephemeral: true});
        return;
    }
    const embed = {
        title: "Ticket closed",
        description: "Ticket was closed by the staff.",
        color: 0x00ff00
    }
    const row = new MessageActionRow()
        .addComponents(new MessageButton()
            .setStyle('SUCCESS')
            .setLabel((Lang.get("ticket-open-button",
                botGuild.language)))
            .setCustomId('open')
            .setEmoji('🔓'))
        .addComponents(new MessageButton()
            .setStyle('DANGER')
            .setLabel(Lang.get("ticket-delete-button",
                botGuild.language))
            .setCustomId('delete')
            .setEmoji('🗑️'));
    await channel.permissionOverwrites.edit(interaction.user.id, {
        VIEW_CHANNEL: true,
        SEND_MESSAGES: false
    });
    ticket.status = 2;
    await channel.setParent(botGuild.ticketCategories.get(ticket.type).closedCategoryId);
    interaction.reply({embeds: [embed], components: [row]});
    await Database.executeUpdate("UPDATE tickets SET status = 2, closed_at = ? WHERE channel_id = ?", [new Date().getTime(), interaction.channel.id]);
}

async function claimTicket(interaction, channel, guild, botGuild) {
    const ticket = Database.getCachedTickets(guild).get(channel.id);
    if (ticket == null) return;
    if (!hasPermission(interaction, ticket, botGuild, false)) {
        interaction.reply({
            content: Lang.get("ticket-no-permission-to-claim",
                botGuild.language),
            ephemeral: true
        });
        return;
    }
    if (ticket.status !== 0 && ticket.status !== "0") {
        await interaction.reply({
            content: Lang.get("ticket-already-closed",
                botGuild.language),
            ephemeral: true
        });
        return;
    }
    const embed = {
        title: "Support",
        description: "On your ticket is now working <@" + interaction.user.id + ">",
        color: 0x00ff00
    }
    ticket.status = 1;
    interaction.reply({embeds: [embed]});
    await Database.executeUpdate("UPDATE tickets SET status = 1, claimed_by = ? WHERE channel_id = ?", [interaction.user.id, interaction.channel.id]);
}

async function createTicket(interaction, botGuild) {
    const message = interaction.message;
    const channel = message.channel;
    const can = interaction.channel;
    const cat = botGuild.ticketCategories.get(interaction.customId);
    if (cat === undefined) return;
    const ticketId = await Database.getAndIncrementTicketId();
    await can.guild.channels.create(`ticket-${interaction.user.username}-${ticketId}`, {
        type: 'text',
        parent: cat.categoryId,
        permissionOverwrites: [
            {
                id: channel.guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: interaction.user.id,
                allow: ['VIEW_CHANNEL'],
            },
        ],
    }).then((newChannel) => {
        //TODO: Custom message
        newChannel.send("<@&663862992265543690>");
        const row = new MessageActionRow()
            .addComponents(new MessageButton()
                .setStyle('PRIMARY')
                .setLabel(Lang.get("ticket-close-button",
                    botGuild.language))
                .setCustomId('close')
                .setEmoji('🔒'))
            .addComponents(new MessageButton()
                .setStyle('SUCCESS')
                .setLabel(Lang.get("ticket-claim-button",
                    botGuild.language))
                .setCustomId('claim')
                .setEmoji('👌'));
        newChannel.send({
            embeds: [cat.embed],
            components: [row]
        }).then(m => {
            const tick = new Ticket(0,
                interaction.guild.id, interaction.user.id,
                null, 0,
                interaction.customId, m.id,
                new Date().getTime(), new Date().getTime(), 0);

            Database.getCachedTickets(interaction.guild).set(m.channel.id, tick);
            interaction.reply({
                content: Lang.get("ticket-created",
                    botGuild.language) + " " + newChannel.toString(),
                ephemeral: true
            });
            Database.executeUpdate("INSERT INTO tickets (id, guild_id, user_id, channel_id, type, created_at, last_activity_at, closed_at) VALUES (0, ?, ?, ?, ?, ?, ?, ?)",
                [tick.guildId, interaction.user.id, m.channel.id, tick.type, tick.createdAt, tick.lastActivityAt, tick.closedAt]);
        });
    });
}

function hasPermission(interaction, ticket, botGuild, ownerBypass) {
    const cat = botGuild.ticketCategories.get(ticket.type);
    if (cat === undefined) return false;
    if (cat.allowedRoles.size === 0) return true;
    if (ownerBypass) {
        if (interaction.member.roles.cache.filter(r => {
            for (const role of cat.allowedRoles) {
                if (r.id === role) return true;
            }
        }).size === 0 && ticket.userId !== interaction.user.id) return false;
    } else {
        if (interaction.member.roles.cache.filter(r => {
            for (const role of cat.allowedRoles) {
                if (r.id === role) return true;
            }
        }).size === 0) return false;
    }
    return true;
}