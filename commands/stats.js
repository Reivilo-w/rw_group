const {SlashCommandBuilder, ModalBuilder, roleMention, PermissionFlagsBits, AttachmentBuilder} = require("discord.js");
const {Presences} = require("../models/presence.model");
const {PresenceMessages} = require("../models/presenceMessage.model");
const {Sequelize, Op} = require("sequelize");
const moment = require("moment");
const {createImage} = require("../modules/stat.group");



const data = new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Permet de sortir des statistiques')
    .addSubcommand(subcommand =>
        subcommand
            .setName('presence')
            .setDescription('Récupération des données des présences').addStringOption(option => option.setName('duree').setDescription('test').addChoices({
                name: '3 jours',
                value: '3'
            },
            {name: '1 semaine', value: '7'},
            {name: '2 semaines', value: '14'})));

module.exports = {
    data,
    async execute(interaction) {
        try {
            await interaction.reply({content: 'Génération en cours...', ephemeral: true})
            const today = moment(new Date(), 'YYYY-MM-DD 00:00:00').subtract(1, 'days').format('YYYY-MM-DD 00:00:00');
            const duree = parseInt(interaction.options.getString("duree") || 3);
            const minusDays = moment().subtract(duree, 'days').format('YYYY-MM-DD 23:59:59');
            console.log(today, minusDays);

            const guildId = interaction.guild.id;

            const presenceMessagesLast7Days = await PresenceMessages.findAll(
                {
                    where: {
                        // date: [Op.between]{$and: [{$gte: minusDays}, {$lt: today}]},
                        createdAt: {
                            [Op.between]: [minusDays, today]
                        },
                        guild: {
                            [Op.eq]: guildId
                        }, //interaction.guild.id
                    }
                });

            const users = {};
            for (const presenceMessage of presenceMessagesLast7Days) {
                const presences = await Presences.findAll({
                    where: {
                        message: presenceMessage.messagePresence,
                    }
                });

                for (const presence of presences) {
                    users[presence.user] = users[presence.user] || {};
                    users[presence.user][0] = users[presence.user][0] || presenceMessagesLast7Days.length;
                    for(let i = 1; i <= 3; i++) {
                        users[presence.user][i] = users[presence.user][i] || 0;
                    }
                    const index = parseInt(presence.presence);
                    users[presence.user][index]++;
                    users[presence.user][0]--;
                }
            }


            const guild = await interaction.client.guilds.fetch(guildId);
            usernamesStats = {};
            // parcourir l'objet users
            for (const user in users) {
                console.log(user)
                const u = await guild.members.fetch(user);
                const displayName = u.displayName || u.username;
                usernamesStats[displayName] = users[user];
            }

            const res = await createImage(usernamesStats);
            const sfbuff = new Buffer.from(res.split(",")[1], "base64");
            const sfattach = new AttachmentBuilder(sfbuff, "output.png");

            // console.log(users);
            await interaction.followUp({content: 'Encore en cours de développement.', ephemeral: true, files: [sfattach]})
        } catch (exception) {
            console.log(exception);
            await interaction.followUp({content: 'Impossible de récupérer les stats, réessayez plus tard.', ephemeral: true})
        }
    },
};

