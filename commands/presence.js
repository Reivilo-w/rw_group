const {SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("presence")
        .setDescription("Permet de créer des objectifs pour une soirée"),
    async execute(interaction) {
        await interaction
            .reply("À quelle heure commence la soirée (Format `23h59`) ?")
            .then(() => {
                const filterHeure = (m) =>
                    m.content.length === 5 &&
                    m.content.includes("h") &&
                    m.author.id === interaction.user.id;
                interaction.channel
                    .awaitMessages({
                        filter: filterHeure,
                        max: 1,
                        time: 15000,
                        errors: ["time"],
                    })
                    .then((collectTime) => {
                        const event = new Date();
                        const inputHour = collectTime
                            .first()
                            .content.toLowerCase()
                            .split("h");
                        if (parseInt(inputHour[0]) > 23) inputHour[0] = 0;

                        event.setHours(inputHour[0], inputHour[1]);

                        interaction.followUp("Quel sera le programme ?").then(() => {
                            interaction.channel
                                .awaitMessages({
                                    filter: (m) => m.author.id === interaction.user.id,
                                    max: 1,
                                    time: 30000,
                                    errors: ["time"],
                                })
                                .then((collectProgram) => {
                                    const programme = collectProgram.first().content;

                                    const time = Math.floor(event.getTime() / 1000);
                                    const embedMessage = new EmbedBuilder()
                                        .setDescription(
                                            `Pour le <t:${time}:f>\n\n**Programme:**\n${programme}`
                                        )
                                        .addFields(
                                            {name: "✅ Présent", value: "```0```", inline: true},
                                            {name: "⏳ En Retard", value: "```0```", inline: true},
                                            {name: "❌ Absent", value: "```0```", inline: true}
                                        )
                                        .setTitle('Présence');
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
                                    interaction.channel.send({embeds: [embedMessage], components: [row]});
                                })
                                .catch((collectProgram) => {
                                    console.log(collectProgram);
                                    interaction.channel.bulkDelete(1, false);
                                    interaction.followUp({
                                        content:
                                            "Pas de réponse de votre part sous 30 secondes, fin de la procédure.",
                                        ephemeral: true,
                                    });
                                });
                        });
                    })
                    .catch((collectTime) => {
                        interaction.channel.bulkDelete(1, false);
                        interaction.followUp({
                            content:
                                "Pas de réponse de votre part sous 15 secondes, fin de la procédure.",
                            ephemeral: true,
                        });
                    });
            });
    },
};

