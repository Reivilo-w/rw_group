const {client} = require("../../modules");
const {Events, codeBlock, userMention, roleMention} = require("discord.js");
const {Presences} = require("../../models");
const {Settings} = require("../../models/settings.model");
const {PresenceMessages} = require("../../models/presenceMessage.model");

const presenceArray = {
    1: '✅ Présent',
    2: '⏳ En Retard',
    3: '❌ Absent',
};

const presenceValues = {
    present: 1,
    retard: 2,
    absent: 3,
};

const listenButtonPresence = client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith('rw_presence')) {
        try {
            const updateStatus = interaction.customId.split(':')[1];
            const message = interaction.message;

            await Presences.destroy({where: {user: interaction.user.id, message: message.id}});

            await Presences.create({
                message: message.id,
                user: interaction.user.id,
                presence: presenceValues[updateStatus]
            });

            const results = await Presences.findAll({
                where: {
                    message: message.id
                }
            });

            const p = {1: [], 2: [], 3: []};
            results.forEach(e => {
                p[e.presence].push(e.user);
            });

            const voted = [];
            const fields = [];
            for (const key in p) {
                const listOfUsers = p[key];

                let content = codeBlock(listOfUsers.length);

                listOfUsers.forEach(e => {
                    content += `\n${userMention(e)}`
                    voted.push(e);
                });

                fields.push({name: presenceArray[key], inline: true, value: content})
            }

            message.embeds[0].data.fields = fields;

            const presence_ping_role = await Settings.findOne({
                attributes: ['value'],
                where: {guild: interaction.guild.id, name: 'rw:presence_ping_role'}
            });
            if (presence_ping_role !== null) {
                let roleMessageContent = roleMention(presence_ping_role.value);
                const presence_role = await interaction.guild.roles.fetch(presence_ping_role.value);
                if (presence_role !== null) {
                    const startMessage = "\n Non votants:"
                    roleMessageContent += startMessage;
                    presence_role.members.forEach(m => {
                        if (!voted.includes(m.id)) {
                            roleMessageContent += `\n${userMention(m.id)}`;
                        }
                    });
                    if(roleMessageContent.endsWith(startMessage)) {
                        roleMessageContent = '✅ Tous les participants ont voté';
                    }

                    const msgPing = await PresenceMessages.findOne({
                        attributes: ['messagePing'],
                        where: {
                            messagePresence: interaction.message.id,
                        }
                    });

                    if(msgPing !== null) {
                        const msgToEdit = await interaction.channel.messages.fetch(msgPing.messagePing);
                        msgToEdit.edit(roleMessageContent);
                    }
                }
            }
            interaction.message.edit({embeds: message.embeds});
            interaction.reply({content: 'Votre participation a bien été enregistrée', ephemeral: true});
        } catch (e) {
            console.log(e);
            interaction.reply({
                content: `Une erreur est survenue, merci de contacter ${userMention(env.parsed.DISCORD_MASTER_ID)}`,
                ephemeral: true
            });
        }
    }
});

module.exports = {listenButtonPresence};