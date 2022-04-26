const {SlashCommandBuilder} = require("@discordjs/builders");
const fetch = require('node-fetch');
const {MessageEmbed} = require("discord.js");

let settings = {method: "Get"};

module.exports = {
    // Data containing command all the subcommands
    data: new SlashCommandBuilder()
        .setName('weather')
        .setDescription('Replies with panel.')
        .addStringOption(option =>
            option.setName('city')
                .setDescription('Zadej název města.')
                .setRequired(true)),

    async execute(interaction) {
        let url = "http://api.weatherapi.com/v1/current.json?key=2723a000012a41aca8e60941203105&q=" + interaction.options._hoistedOptions[0].value +"&aqi=no";
        fetch(url, settings)
            .then(res => res.json())
            .then((result) => {
                try {
                    const embed = new MessageEmbed()
                        .setTitle(interaction.options._hoistedOptions[0].value)
                        .setColor(0x00AE86)
                        .setThumbnail("https:" + result.current.condition.icon)
                        .setDescription(`${result.location.name} ${result.current.temp_c}°C`);
                    interaction.reply({embeds: [embed]});
                } catch (e) {
                    interaction.reply("Město se nepodařilo nalézt.")
                }
            });
    }
}