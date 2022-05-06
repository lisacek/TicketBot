/*
 * Libraries
 */
const {SlashCommandBuilder} = require('@discordjs/builders');
const {MessageButton, MessageActionRow} = require("discord.js");

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
const {Category} = require("../cons/category");

// TODO: category embed settings
module.exports = {
    // Data containing command all the subcommands
    data: new SlashCommandBuilder()
        .setName('panel')
        .setDescription('Replies with panel.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('ticket-category')
                .setDescription('Ticket category settings')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Choose for which category you are setting category.')
                        .setRequired(true)
                        .addChoice('TICKET', 'ticket')
                        .addChoice('BUG', 'bug'))
                .addStringOption(option =>
                    option.setName('categoryid')
                        .setDescription('Enter new value.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('language')
                .setDescription('Language of the panel.')
                .addStringOption(option =>
                    option.setName('lang')
                        .setDescription('Choose language.')
                        .setRequired(true)
                        .addChoice('Čeština', 'cs')
                        .addChoice('English', 'en')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('closed-category')
                .setDescription('Ticket closed category settings')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Choose for which category you are setting category.')
                        .setRequired(true)
                        .addChoice('TICKET', 'ticket')
                        .addChoice('BUG', 'bug'))
                .addStringOption(option =>
                    option.setName('categoryid')
                        .setDescription('Enter new value.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('category-add')
                .setDescription('Ticket categories settings')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('creation-category-id')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('closed-category-id')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('allowed-roles')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('ping-roles')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('message')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('title')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('description')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('color')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('button-text')
                        .setDescription('Enter new value.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('button-color')
                        .setDescription('Enter new value.')
                        .setRequired(true)
                        .addChoice('Primary', 'PRIMARY')
                        .addChoice('Secondary', 'SECONDARY')
                        .addChoice('Danger', 'DANGER')
                        .addChoice('Success', 'SUCCESS')
                ))
        .addSubcommand(subcommand =>
            subcommand
                .setName('category-remove')
                .setDescription('Ticket category remove.')
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('Type name.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings-category')
                .setDescription('Setups panel properties.')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('Write category type.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Choose setup type.')
                        .setRequired(true)
                        .addChoice('title', 'title')
                        .addChoice('description', 'description')
                        .addChoice('color', 'color')
                        .addChoice('footer text', 'footer-text'))
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('Enter new value.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('settings-panel')
                .setDescription('Setups panel properties.')
                .addStringOption(option =>
                    option.setName('type')
                        .setDescription('Choose setup type.')
                        .setRequired(true)
                        .addChoice('title', 'title')
                        .addChoice('description', 'description')
                        .addChoice('color', 'color')
                        .addChoice('footer text', 'footer-text'))
                .addStringOption(option =>
                    option.setName('value')
                        .setDescription('Enter new value.')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('send')
                .setDescription('Sends and setups panel.')),

    //TODO: create more functions for panel
    async execute(interaction) {
        const botGuild = await Database.getCachedGuild(interaction.guild);
        //Check if the guild is cached.
        if (botGuild == null) {
            Logger.log(`&4Could not find guild ${interaction.guild.id} in cache.`);
            return;
        }

        //Getting name of the command.
        const command = interaction.options._subcommand;

        //Identify command and execute it.
        switch (command) {
            case 'closed-category':
                await updateCloseCategoryId(interaction, botGuild);
                break;
            case 'ticket-category':
                await updateTicketCategoryId(interaction, botGuild);
                break;
            case 'settings-category':
                await updateCategory(interaction, botGuild);
                break;
            case 'settings-panel':
                await updatePanel(interaction, botGuild);
                break;
            case 'category-remove':
                await categoryRemove(interaction, botGuild);
                break;
            case 'category-add':
                await categoryAdd(interaction, botGuild);
                break;
            case 'send' :
                await sendPanel(interaction, botGuild);
                break;
            case "language":
                await updateLanguage(interaction, botGuild);
                break;
        }
    },
};

async function updateLanguage(interaction, botGuild) {
    const language = interaction.options._hoistedOptions[0].value;
    const guild = interaction.guild;
    botGuild.language = language;
    interaction.reply({
        content: Lang.get("panel-lang-changed", botGuild.language),
        ephemeral: true
    });
    await Database.executeUpdate("UPDATE guild_language SET lang = ? WHERE guild_id = ?", [language, guild.id]);
}

async function updateCloseCategoryId(interaction, botGuild) {
    const categories = JSON.parse(botGuild.ticketCategoriesJSON);
    const name = interaction.options._hoistedOptions[0].value;
    const id = interaction.options._hoistedOptions[1].value;
    const lang = botGuild.language;
    categories[name].closed_category_id = id;

    //validate channel id
    const channel = interaction.guild.channels.cache.get(id);
    if (!channel) {
        interaction.reply({
            content: Lang.get("ticket-close-category-invalid-channel", lang),
            ephemeral: true
        });
        return;
    }

    interaction.reply({
        content: Lang.get("ticket-creation-category-changed", lang),
        ephemeral: true
    });

    await Database.executeUpdate("UPDATE guild_panels SET categories = ? WHERE guild_id = ?",
        [JSON.stringify(categories), interaction.guild.id]);

    const ticketCategories = new Map();
    // Update the cache
    for (let i = 0; i < Object.keys(categories).length; i++) {
        const cat = categories[Object.keys(categories)[i]];

        const category = new Category(Object.keys(categories)[i], cat.category_id,
            id, cat.allowed_roles_id, cat.ping_roles_id, cat.message, cat.embed);

        ticketCategories.set(Object.keys(categories)[i], category);
    }
    botGuild.ticketCategories = ticketCategories;
}

async function updateTicketCategoryId(interaction, botGuild) {
    const categories = JSON.parse(botGuild.ticketCategoriesJSON);
    const name = interaction.options._hoistedOptions[0].value;
    const id = interaction.options._hoistedOptions[1].value;
    const lang = botGuild.language;

    const channel = interaction.guild.channels.cache.get(id);
    if (!channel) {
        interaction.reply({
            content: Lang.get("ticket-creation-category-invalid-channel", lang),
            ephemeral: true
        });
        return;
    }

    categories[name].category_id = id;
    interaction.reply({
        content: Lang.get("ticket-creation-category-changed", lang),
        ephemeral: true
    });

    await Database.executeUpdate("UPDATE guild_panels SET categories = ? WHERE guild_id = ?", [JSON.stringify(categories), interaction.guild.id]);
    const ticketCategories = new Map();
    // Update the cache
    for (let i = 0; i < Object.keys(categories).length; i++) {
        const cat = categories[Object.keys(categories)[i]];

        const category = new Category(Object.keys(categories)[i], id,
            categories[name].closed_category_id, cat.allowed_roles_id,
            cat.ping_roles_id, cat.message, cat.embed);

        ticketCategories.set(Object.keys(categories)[i], category);
    }
    botGuild.ticketCategories = ticketCategories;
}

async function updateCategory(interaction, botGuild) {
    const category = interaction.options._hoistedOptions[0].value.toLowerCase();
    const property = interaction.options._hoistedOptions[1].value;
    const value = interaction.options._hoistedOptions[2].value;

    let panel;
    let cache;

    switch (property) {
        case "title":
            if (value.length > 256) {
                interaction.reply({
                    content: Lang.get("ticket-creation-category-title-too-long", botGuild.language),
                    ephemeral: true
                });
                return;
            }
            panel = botGuild.ticketCategories.get(category).embed;
            if (value === "delete" || value === "remove" || value === "null" || value.length === 0) {
                delete panel.title;
            } else {
                panel.title = value;
            }

            try {
                cache = JSON.parse(botGuild.ticketCategoriesJSON);
            } catch (e) {
                cache = botGuild.ticketCategoriesJSON;
            }

            cache[category].embed = panel;
            botGuild.ticketCategoriesJSON = cache;

            interaction.reply({
                content: Lang.get("panel-title-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET categories = ? WHERE guild_id = ?", [JSON.stringify(botGuild.ticketCategoriesJSON), interaction.guild.id]);
            break;
        case
        "description"
        :
            if (value.length > 2048) {
                interaction.reply({
                    content: Lang.get("panel-description-too-long", botGuild.language),
                    ephemeral: true
                });
                return;
            }

            if (value.length === 0) {
                interaction.reply({
                    content: Lang.get("panel-description-empty", botGuild.language),
                    ephemeral: true
                });
                return;
            }

            panel = botGuild.ticketCategories.get(category).embed;
            panel.description = value.split("[enter]");
            try {
                cache = JSON.parse(botGuild.ticketCategoriesJSON);
            } catch (e) {
                cache = botGuild.ticketCategoriesJSON;
            }

            cache[category].embed = panel;
            botGuild.ticketCategoriesJSON = cache;
            interaction.reply({
                content: Lang.get("panel-description-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET categories = ? WHERE guild_id = ?", [JSON.stringify(botGuild.ticketCategoriesJSON), interaction.guild.id]);
            break;
        case
        "color"
        :
            const reg = /^#([0-9a-f]{3}){1,2}$/i;
            if (!reg.test('' + value)) return interaction.reply({
                content: Lang.get("panel-color-invalid", botGuild.language),
                ephemeral: true
            });
            Logger.log("zde12");
            panel = botGuild.ticketCategories.get(category).embed;
            panel.color = value;
            try {
                cache = JSON.parse(botGuild.ticketCategoriesJSON);
            } catch (e) {
                cache = botGuild.ticketCategoriesJSON;
            }

            cache[category].embed = panel;
            botGuild.ticketCategoriesJSON = cache;
            interaction.reply({
                content: Lang.get("panel-color-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET categories = ? WHERE guild_id = ?", [JSON.stringify(botGuild.ticketCategoriesJSON), interaction.guild.id]);
            break;
        case
        "footer-text"
        :
            if (value.length > 1024) {
                interaction.reply({
                    content: Lang.get("panel-footer-text-too-long", botGuild.language),
                    ephemeral: true
                });
                return;
            }
            Logger.log("zde");
            panel = botGuild.ticketCategories.get(category).embed;
            if (value === "delete" || value === "remove" || value === "null" || value.length === 0) {
                delete panel.footer;
            } else if (panel.footer == null) {
                panel.footer = {};
                panel.footer.text = value;
            } else {
                panel.footer.text = value;
            }
            try {
                cache = JSON.parse(botGuild.ticketCategoriesJSON);
            } catch (e) {
                cache = botGuild.ticketCategoriesJSON;
            }

            cache[category].embed = panel;
            botGuild.ticketCategoriesJSON = cache;
            interaction.reply({
                content: Lang.get("panel-footer-text-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET panel = ? WHERE guild_id = ?", [JSON.stringify(botGuild.ticketCategoriesJSON), interaction.guild.id]);
            break;
    }
}

async function updatePanel(interaction, botGuild) {
    const property = interaction.options._hoistedOptions[0].value;
    const value = interaction.options._hoistedOptions[1].value;
    let panel;
    switch (property) {
        case "title":
            if (value.length > 256) {
                interaction.reply({
                    content: Lang.get("panel-title-too-long", botGuild.language),
                    ephemeral: true
                });
                return;
            }
            panel = JSON.parse(botGuild.panel);
            if (value === "delete" || value === "remove" || value === "null" || value.length === 0) {
                delete panel.title;
            } else {
                panel.title = value;
            }
            botGuild.panel = JSON.stringify(panel);
            interaction.reply({
                content: Lang.get("panel-title-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET panel = ? WHERE guild_id = ?", [botGuild.panel, interaction.guild.id]);
            break;
        case "description":
            if (value.length > 2048) {
                interaction.reply({
                    content: Lang.get("panel-description-too-long", botGuild.language),
                    ephemeral: true
                });
                return;
            }
            if (value.length < 1) {
                interaction.reply({
                    content: Lang.get("panel-description-too-short", botGuild.language),
                    ephemeral: true
                });
                return;
            }
            panel = JSON.parse(botGuild.panel);
            panel.description = value.split("[enter]");
            botGuild.panel = JSON.stringify(panel);
            interaction.reply({
                content: Lang.get("panel-description-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET panel = ? WHERE guild_id = ?", [botGuild.panel, interaction.guild.id]);
            break;
        case "color":
            const reg = /^#([0-9a-f]{3}){1,2}$/i;
            if (!reg.test('' + value)) return interaction.reply({
                content: Lang.get("panel-color-invalid", botGuild.language),
                ephemeral: true
            });
            panel = JSON.parse(botGuild.panel);
            panel.color = value;
            botGuild.panel = JSON.stringify(panel);
            interaction.reply({
                content: Lang.get("panel-color-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET panel = ? WHERE guild_id = ?", [botGuild.panel, interaction.guild.id]);
            break;
        case "footer-text":
            panel = JSON.parse(botGuild.panel);
            if (value.length > 1024) return interaction.reply({
                content: Lang.get("panel-footer-text-too-long", botGuild.language),
                ephemeral: true
            });
            if (value === "delete" || value === "remove" || value === "null" || value.length === 0) {
                delete panel.footer;
            } else if (panel.footer == null) {
                panel.footer = {};
                panel.footer.text = value;
            } else {
                panel.footer.text = value;
            }
            botGuild.panel = JSON.stringify(panel);
            interaction.reply({
                content: Lang.get("panel-footer-text-changed", botGuild.language),
                ephemeral: true
            });
            await Database.executeUpdate("UPDATE guild_panels SET panel = ? WHERE guild_id = ?", [botGuild.panel, interaction.guild.id]);
            break;
    }
}

async function categoryRemove(interaction, botGuild) {
    const catName = interaction.options._hoistedOptions[0].value;
    const categories = JSON.parse(botGuild.ticketCategoriesJSON);
    delete categories[catName];
    const buttons = JSON.parse(botGuild.panelButtons);
    delete buttons[catName];
    botGuild.ticketCategoriesJSON = categories;
    botGuild.ticketCategories.delete(catName);
    botGuild.panelButtons = JSON.stringify(buttons);
    await Database.executeUpdate("UPDATE guild_panels SET categories = ?, buttons = ? WHERE guild_id = ?", [JSON.stringify(botGuild.ticketCategoriesJSON), botGuild.panelButtons, interaction.guild.id]);
}

async function categoryAdd(interaction, botGuild) {
    const catName = interaction.options._hoistedOptions[0].value;
    const emoji = interaction.options._hoistedOptions[1].value;
    const creationId = interaction.options._hoistedOptions[2].value;
    //validate creationId channel id
    if (!interaction.guild.channels.has(creationId)) {
        interaction.reply({
            content: Lang.get("panel-category-invalid-channel", botGuild.language),
            ephemeral: true
        });
        return;
    }
    const closedId = interaction.options._hoistedOptions[3].value;
    //validate closedId channel id
    if (!interaction.guild.channels.has(closedId)) {
        interaction.reply({
            content: Lang.get("panel-category-invalid-channel", botGuild.language),
            ephemeral: true
        });
        return;
    }
    const allowedRole = interaction.options._hoistedOptions[4].value;
    //validate allowedRole role id
    if (!interaction.guild.roles.has(allowedRole)) {
        interaction.reply({
            content: Lang.get("panel-category-invalid-role", botGuild.language),
            ephemeral: true
        });
        return;
    }
    const pingRole = interaction.options._hoistedOptions[5].value;

    //validate pingRole role id
    if (!interaction.guild.roles.has(pingRole)) {
        interaction.reply({
            content: Lang.get("panel-category-invalid-role", botGuild.language),
            ephemeral: true
        });
        return;
    }
    const message = interaction.options._hoistedOptions[6].value;
    const title = interaction.options._hoistedOptions[7].value;
    const description = interaction.options._hoistedOptions[8].value;
    const color = interaction.options._hoistedOptions[9].value;

    //validate color
    const reg = /^#([0-9a-f]{3}){1,2}$/i;
    if (!reg.test('' + color)) return interaction.reply({
        content: Lang.get("panel-color-invalid", botGuild.language),
        ephemeral: true
    });
    const buttonText = interaction.options._hoistedOptions[10].value;
    const buttonColor = interaction.options._hoistedOptions[11].value;

    //validate buttonColor
    switch (buttonColor.toUpperCase()) {
        case "PRIMARY":
        case "SECONDARY":
        case "SUCCESS":
        case "DANGER":
            break;
        default:
            return interaction.reply({
                content: Lang.get("panel-button-color-invalid", botGuild.language),
                ephemeral: true
            });
    }

    const categories = JSON.parse(botGuild.ticketCategoriesJSON);
    categories[catName] = {};
    categories[catName].category_id = creationId;
    categories[catName].closed_category_id = closedId;
    categories[catName].allowed_roles_id = [];
    categories[catName].allowed_roles_id.push(allowedRole);
    categories[catName].ping_roles_id = [];
    categories[catName].ping_roles_id.push(pingRole);
    categories[catName].message = message;
    categories[catName].embed = {};
    if (title !== 'none')
        categories[catName].embed["title"] = title;
    categories[catName].embed["description"] = description;
    categories[catName].embed["color"] = color;
    botGuild.ticketCategoriesJSON = categories;
    botGuild.ticketCategories.set(catName, categories[catName]);

    const buttons = JSON.parse(botGuild.panelButtons);
    buttons[catName] = {};
    buttons[catName].name = buttonText;
    buttons[catName].id = catName;
    buttons[catName].color = buttonColor;
    buttons[catName].emoji = emoji;
    botGuild.panelButtons = JSON.stringify(buttons);
    await Database.executeUpdate("UPDATE guild_panels SET categories = ?, buttons = ? WHERE guild_id = ?", [JSON.stringify(botGuild.ticketCategoriesJSON), botGuild.panelButtons, interaction.guild.id]);

    interaction.reply({
        content: Lang.get("panel-footer-text-changed", botGuild.language),
        ephemeral: true
    });
}

async function sendPanel(interaction, botGuild) {
    const channel = interaction.channel;

    const lang = botGuild.language;
    const row = new MessageActionRow();

    const buttonList = JSON.parse(botGuild.panelButtons);

    // Create the buttons
    for (let i = 0; i < Object.keys(buttonList).length; i++) {
        const button = buttonList[Object.keys(buttonList)[i]];
        const messageButton = new MessageButton();
        messageButton.setCustomId(button.id);
        messageButton.setLabel(button.name);
        messageButton.setStyle(button.color);
        messageButton.setEmoji(button.emoji);
        row.addComponents(messageButton);
    }

    const embed = JSON.parse(botGuild.panel);
    // Build description
    embed.description = embed.description.join("\n");

    channel.send({ephemeral: false, embeds: [embed], components: [row]}).then(message => {
        Database.executeUpdate('UPDATE guild_panels SET channel_id = ?, message_id = ? WHERE guild_id = ?', [channel.id, message.id, interaction.guild.id]);
    });

    interaction.reply({content: Lang.get("panel-created", lang), ephemeral: true});
}