const {client} = require("../../modules");
const {Events, bold} = require("discord.js");

const listenModalHunt = client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isModalSubmit()) return;
    if (interaction.customId === 'rw:calc_hunt') {
        const rawMeat = interaction.fields.getTextInputValue('rawMeat');
        const deerSkin = interaction.fields.getTextInputValue('deerSkin');
        const cougarSkin = interaction.fields.getTextInputValue('cougarSkin');

        const rawMeatPrice = parseInt(rawMeat) * 68;
        const deerSkinPrice = parseInt(deerSkin) * 104;
        const cougarSkinPrice = parseInt(cougarSkin) * 102;

        const total = rawMeatPrice + deerSkinPrice + cougarSkinPrice;

        const response = `La viande crue sera vendue pour ${bold(rawMeatPrice)}$\nLa peau de biche sera vendue pour ${bold(deerSkinPrice)}$\nLa peau de cougar sera vendue pour ${bold(cougarSkinPrice)}$\n\nPour un total de ${bold(total)}$.`;

        await interaction.reply({content: response});
    }
});

module.exports = {listenModalHunt}