const {SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder} = require("discord.js");

const data = new SlashCommandBuilder()
    .setName("chasse_flashback")
    .setDescription("Permet de faire une estimation de vente des ressources de chasse.")

module.exports = {
    data,
    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId('rw:calc_hunt')
            .setTitle('Calcultateur de Chasse');

        const rawMeat = new TextInputBuilder()
            .setCustomId('rawMeat')
            .setLabel("Nombre de viandes crues")
            .setStyle(TextInputStyle.Short);

        const deerSkin = new TextInputBuilder()
            .setCustomId('deerSkin')
            .setLabel("Nombre de peaux de cerf")
            .setStyle(TextInputStyle.Short);

        const cougarSkin = new TextInputBuilder()
            .setCustomId('cougarSkin')
            .setLabel("Nombre de peaux de cougar")
            .setStyle(TextInputStyle.Short);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(rawMeat);
        const secondActionRow = new ActionRowBuilder().addComponents(deerSkin);
        const thirdActionRow = new ActionRowBuilder().addComponents(cougarSkin);

        // Add inputs to the modal
        modal.addComponents(firstActionRow, secondActionRow,thirdActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
    },
};

