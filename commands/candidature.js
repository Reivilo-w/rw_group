const {
    SlashCommandBuilder,
    userMention,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    bold
} = require("discord.js");
const {Presence} = require("../models/presence.model");
const {PresenceMessages} = require("../models/presenceMessage.model");
const {Sequelize} = require("sequelize");
const moment = require("moment");
const {Settings} = require("../models/settings.model");

const data = new SlashCommandBuilder()
    .setName('candidature')
    .setDescription('Tentez de rejoindre le groupe');

module.exports = {
    data,
    async execute(interaction) {
        try {
            // interaction.reply({content: 'Encore en cours de développement.', ephemeral: true})
            const actif = await Settings.findOne({
                attributes: ['value'],
                where: {
                    guild: interaction.guild.id,
                    name: 'rw:recrutement_actif'
                }
            });

            if (actif === null) return await interaction.reply(`La commande n'a pas encore été configurée, demandez à un administrateur d'utiliser ${bold('/setting recrutement actif')}`);

            if (actif.value === 'non') {
                return await interaction.reply({
                    content: 'Les recrutements sont fermés, réessayez plus tard.',
                    ephemeral: true
                });
            }

            const modal = new ModalBuilder()
                .setCustomId('rw:candidature')
                .setTitle('Rejoindre le groupe');

            const Age = new TextInputBuilder()
                .setCustomId('age')
                .setLabel("Âge (en années)")
                .setMaxLength(3)
                .setMinLength(2)
                .setPlaceholder('20')
                .setStyle(TextInputStyle.Short);

            const Profession = new TextInputBuilder()
                .setCustomId('profession')
                .setLabel("Profession")
                .setPlaceholder('Chômeur professionnel')
                .setStyle(TextInputStyle.Short);

            const Exp = new TextInputBuilder()
                .setCustomId('xp')
                .setLabel("Expérience & Heures de jeu")
                .setPlaceholder("J'ai joué 2 mois en tant que Ražnatović, j'ai 1000h de RP...")
                .setStyle(TextInputStyle.Paragraph);

            const Motivations = new TextInputBuilder()
                .setCustomId('motivations')
                .setLabel("Quelles sont vos motivations ?")
                .setPlaceholder("J'aime trop la serbie et le projet me semble cool.")
                .setStyle(TextInputStyle.Paragraph);

            const Preferences = new TextInputBuilder()
                .setCustomId('preferences')
                .setLabel("Que préférez vous sur GTA RP ?")
                .setPlaceholder("Les plans, les entreprises, la course poursuite, le rp sexe")
                .setStyle(TextInputStyle.Paragraph);


            const firstActionRow = new ActionRowBuilder().addComponents(Age);
            const secondActionRow = new ActionRowBuilder().addComponents(Profession);
            const thirdActionRow = new ActionRowBuilder().addComponents(Exp);
            const fourthActionRow = new ActionRowBuilder().addComponents(Motivations);
            const fifthActionRow = new ActionRowBuilder().addComponents(Preferences);

            // Add inputs to the modal
            modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow, fifthActionRow);

            // Show the modal to the user
            await interaction.showModal(modal);
        } catch (exception) {
            console.log(exception);
            await interaction.reply({
                content: 'Impossible de lancer la commande, réessayez plus tard.',
                ephemeral: true
            });
        }
    },
};

