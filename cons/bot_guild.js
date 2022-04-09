class Bot_guild {

    constructor(guildId, panel, panelButtons, panelChannelId, panelMessageId, ticketCategories, ticketCategoriesJSON, language) {
        this.guildId = guildId;
        this.panel = panel;
        this.panelButtons = panelButtons;
        this.panelChannelId = panelChannelId;
        this.panelMessageId = panelMessageId;
        this.ticketCategories = ticketCategories;
        this.ticketCategoriesJSON = ticketCategoriesJSON;
        this.language = language;
    }

}

module.exports.BotGuild = Bot_guild;