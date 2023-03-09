const {SlashCommandBuilder, ModalBuilder, roleMention, PermissionFlagsBits} = require("discord.js");
const {Settings} = require("../models/settings.model");
const {Sequelize} = require("sequelize");
/*
const data = new SlashCommandBuilder()
    .setName("settings")
    .setDescription("Permet d'ajouter des options pour le BOT")
    .addStringOption(option =>
        option.setName('option')
            .setDescription('Option à configurer')
            .setRequired(true)
            .addChoices(
                { name: 'Rôle(s) à ping', value: 'roles' }
            ));*/

const data = new SlashCommandBuilder()
    .setName('setting')
    .setDescription('Permet de gérer les paramètres')
    .addSubcommand(subcommand =>
        subcommand
            .setName('role')
            .setDescription('Quel rôle sera ping lors des présences')
            .addRoleOption(option => option.setName('role').setDescription('Le role à tag (laissez vide pour supprimer le tag)'))).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

module.exports = {
    data,
    async execute(interaction) {
        try {
            const role = interaction.options.getRole("role");
            let response = 'Erreur inconnue';
            if (role !== null) {
                Settings.create({
                    name: 'rw:presence_ping_role',
                    guild: interaction.guild.id,
                    value: role.id
                });
                response = `Le rôle ${roleMention(role.id)} sera ping à chaque check de présence.`;
            } else {
                Settings.destroy({
                    where: {
                        name: 'rw:presence_ping_role',
                        guild: interaction.guild.id
                    }
                });
                response = 'Le rôle a bien été supprimé et ne sera plus ping.';
            }

            interaction.reply({
                content: response,
                ephemeral: true
            })
        } catch (exception) {
            interaction.reply({content: 'Impossible de récupérer le role, réessayez plus tard.', ephemeral: true})
        }
        /*const nb = interaction.options.getInteger("nombre") ?? 1;
        await interaction.channel.bulkDelete(nb, false);
        await interaction.reply({
            content: "Les messages ont bien été supprimés",
            ephemeral: true,
        });*/
    },
};

