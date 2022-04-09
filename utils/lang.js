/*
 * Libraries
 */
const fs = require("node:fs");

/*
 * Utils
 */
const {Logger} = require("./logger");

/*
 * Constants
 */
const languages = new Map();

class Lang {

    /**
     * Gets message from specific language file.
     * @param key - Key of message.
     * @param lang - Language of message.
     * @returns {string} - Message.
     */
    static get(key, lang) {
        if (!languages.has(lang)) {
            Logger.log("&4Language not found: &7" + lang);
            return "null";
        }
        for (let i = 0; i < Object.keys(languages.get(lang)).length; i++) {
            if (Object.keys(languages.get(lang))[i] === key) return Object.keys(languages.get(lang))[i];
        }
        Logger.log("&4Language Key not found: &7" + key);
        return "null";
    }

}

/**
 * Loads language files.
 */
function loadLanguages() {
    Logger.log("Loading languages...");
    const languageFiles = fs.readdirSync('./lang').filter(file => file.endsWith('.json'));
    languageFiles.forEach(file => {
        const lang = file.substring(0, file.length - 5);
        languages.set(lang, require('../lang/' + lang + '.json'));
    });
    Logger.log("Languages loaded.");
}

loadLanguages();
module.exports.Lang = Lang;