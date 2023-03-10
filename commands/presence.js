const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    roleMention, userMention
} = require("discord.js");
const {presenceEmbed} = require("../modules");
const {Settings} = require("../models/settings.model");
const {PresenceMessages} = require("../models/presenceMessage.model");
const {Sequelize} = require("sequelize");

const data = new SlashCommandBuilder()
    .setName("presence")
    .setDescription("Permet de créer des objectifs pour une soirée");


module.exports = {
    data,
    async execute(interaction) {
        try {
            const askHour = await interaction.reply("À quelle heure commence la soirée (Format `23h59`) ?");

            const filterHeure = (m) =>
                m.content.length === 5 &&
                m.content.includes("h") &&
                m.author.id === interaction.user.id;

            const collectTime = await interaction.channel
                .awaitMessages({
                    filter: filterHeure,
                    max: 1,
                    time: 15000,
                    errors: ["time"],
                });

            const event = new Date();
            const inputHour = collectTime
                .first()
                .content.toLowerCase()
                .split("h");
            if (parseInt(inputHour[0]) > 23) inputHour[0] = 0;

            event.setHours(inputHour[0], inputHour[1]);
            interaction.deleteReply();
            collectTime.first().delete();

            const followUp = await interaction.followUp("Quel sera le programme (vous avez 2 minutes pour le taper 👀 ) ?");

            const collectProgram = await interaction.channel
                .awaitMessages({
                    filter: (m) => m.author.id === interaction.user.id,
                    max: 1,
                    time: 120000,
                    errors: ["time"],
                });
            const programme = collectProgram.first().content;

            const time = Math.floor(event.getTime() / 1000);
            const embedMessage = presenceEmbed({
                description: `Pour le <t:${time}:f>\n\n**Programme:**\n${programme}`
            });
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('rw_presence:present')
                        .setLabel('✅ Présent')
                        .setStyle(ButtonStyle.Success),
                    new ButtonBuilder()
                        .setCustomId('rw_presence:retard')
                        .setLabel('⏳ En Retard')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('rw_presence:absent')
                        .setLabel('❌ Absent')
                        .setStyle(ButtonStyle.Danger),
                    //coment
                );
            followUp.delete();
            const presence_ping_role = await Settings.findOne({
                attributes: ['value'],
                where: {guild: interaction.guild.id, name: 'rw:presence_ping_role'}
            });
            collectProgram.first().delete().then(async () => {
                const messagePresence = await interaction.channel.send({embeds: [embedMessage], components: [row]});

                let roleMessage = {};
                if (presence_ping_role !== null) {
                    let roleMessageContent = roleMention(presence_ping_role.value);
                    const presence_role = await interaction.guild.roles.fetch(presence_ping_role.value);
                    if (presence_role !== null) {
                        roleMessageContent += "\n Non votants:";
                        presence_role.members.forEach(m => {
                            roleMessageContent += `\n${userMention(m.id)}`;
                        });
                    }
                    roleMessage = await interaction.channel.send(roleMessageContent);
                }

                await PresenceMessages.create({
                    messagePresence: messagePresence.id,
                    messagePing: roleMessage.id || ''
                });
            });
        } catch (e) {
            console.log(e);
            interaction.channel.bulkDelete(1, false);
            interaction.followUp({
                content:
                    "Pas de réponse de votre part dans les temps, fin de la procédure.",
                ephemeral: true,
            });
        }
    }
};