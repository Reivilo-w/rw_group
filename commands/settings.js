const {SlashCommandBuilder, userMention, roleMention, PermissionFlagsBits, channelMention} = require("discord.js");
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
            .addRoleOption(option => option.setName('role').setDescription('Le role à tag (laissez vide pour supprimer le tag)'))).setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(
        subcommand => subcommand.setName('recrutement').setDescription('Permet de gérer les permissions de recrutement')
            .addChannelOption(option => option.setName('salon_reception_candidature').setDescription('Salon dans lequel vous recevrez les candidatures'))
            .addStringOption(option => option.setName('actif').setDescription('Est ce que les recrutements sont ouverts ?').setChoices(
                {name: 'Oui', value: 'oui'},
                {name: 'Non', value: 'non'},
            ))
    ).setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

module.exports = {
    data,
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'role':
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
                    interaction.reply({
                        content: 'Impossible de récupérer le role, réessayez plus tard.',
                        ephemeral: true
                    })
                }
                break;
            case 'recrutement':
                try {
                    const actif = interaction.options.getString('actif');
                    const salon_reception = interaction.options.getChannel('salon_reception_candidature');

                    if (salon_reception !== null && salon_reception.type !== 0) {
                        return interaction.reply({
                            content: `Le salon ${channelMention(salon_envoi.id)} doit être un salon texte.`,
                            ephemeral: true
                        });
                    }

                    let response = '';

                    if (salon_reception !== null) {
                        await Settings.destroy({
                            where: {
                                name: 'rw:recrutement_reception',
                                guild: interaction.guild.id,
                            }
                        });
                        await Settings.create({
                            name: 'rw:recrutement_reception',
                            guild: interaction.guild.id,
                            value: salon_reception.id
                        });
                        response = `Le channel ${channelMention(salon_reception.id)} sera le salon ou on pourra recevoir les candidatures.`;
                    }

                    if(actif !== null) {
                        await Settings.destroy({
                            where: {
                                name: 'rw:recrutement_actif',
                                guild: interaction.guild.id,
                            }
                        });
                        await Settings.create({
                            name: 'rw:recrutement_actif',
                            guild: interaction.guild.id,
                            value: actif
                        });

                        const y = actif === 'oui' ? 'actifs' : 'inactifs';
                        if(response.length > 0) response += "\n";
                        response += `Les recrutements sont désormais ${y}.`;
                    }

                    interaction.reply({
                        content: response,
                        ephemeral: true
                    })
                } catch (exception) {
                    interaction.reply({
                        content: 'Impossible de récupérer le salon, réessayez plus tard.',
                        ephemeral: true
                    })
                }
                break;
            default:
                interaction.reply({
                    content: `Sous-commande inconnue, contactez ${userMention('213708251416625153')}.`,
                    ephemeral: true
                });
                break;
        }

        /*const nb = interaction.options.getInteger("nombre") ?? 1;
        await interaction.channel.bulkDelete(nb, false);
        await interaction.reply({
            content: "Les messages ont bien été supprimés",
            ephemeral: true,
        });*/
    },
};

