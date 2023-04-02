const {client} = require("../../modules");
const {
    Events,
    bold,
    userMention,
    EmbedBuilder,
    channelMention,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");
const {Settings} = require("../../models/settings.model");

const listenCandidature = client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === 'rw:candidature') {
        const channelId = await Settings.findOne({
            attributes: ['value'],
            where: {
                name: 'rw:recrutement_reception',
                guild: interaction.guild.id
            }
        });

        if (channelId === null) return await interaction.reply({content: 'La configuration des recrutements n\'est pas terminée, demandez à un administrateur de faire **/setting recrutement salon_recrutement_candidature**.'});

        const embedResponse = new EmbedBuilder()
            .setTitle('Nouvelle candidature reçue')
            .setAuthor({name: interaction.user.username, iconURL: interaction.user.avatarURL()})
            .setDescription(userMention(interaction.user.id))
            .addFields(
                {name: 'Age', value: `${interaction.fields.getTextInputValue('age')} ans`, inline: true},
                {name: 'Profession', value: interaction.fields.getTextInputValue('profession'), inline: true},
                {name: 'Expérience & Heures de jeu', value: interaction.fields.getTextInputValue('xp')},
                {name: 'Motivations', value: interaction.fields.getTextInputValue('motivations')},
                {name: 'Préférences dans le RP', value: interaction.fields.getTextInputValue('preferences')},
            );

        const channelRecrutement = await interaction.guild.channels.fetch(channelId.value);
        if (channelRecrutement === null) return await interaction.reply(`Le channel ${channelMention(channelId.value)} est introuvable.`);

        channelRecrutement.send({embeds: [embedResponse]});
        await interaction.reply({content: 'Votre candidature a bien été envoyée', ephemeral: true});
    }
});

module.exports = {listenCandidature}