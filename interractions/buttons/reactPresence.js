const {client} = require("../../modules");
const {Events, codeBlock, userMention} = require("discord.js");
const {Presences} = require("../../models");

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

            const fields = [];
            for (const key in p) {
                const listOfUsers = p[key];

                let content = codeBlock(listOfUsers.length);

                listOfUsers.forEach(e => content += `\n${userMention(e)}`);

                fields.push({name: presenceArray[key], inline: true, value: content})
            }
            message.embeds[0].data.fields = fields;
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