const {EmbedBuilder, codeBlock} = require("discord.js");

const presenceEmbed = (optn => {
    const embedMessage = optn.embed || new EmbedBuilder();
    const fieldsContent = optn.fieldsContent || {1: codeBlock('0'), 2: codeBlock('0'), 3: codeBlock('0')};
    const embedDescription = optn.description || false;

    if (embedDescription !== false) embedMessage.setDescription(embedDescription);

    embedMessage.setFields(
        {name: "✅ Présent", value: fieldsContent[1], inline: true},
        {name: "⏳ En Retard", value: fieldsContent[2], inline: true},
        {name: "❌ Absent", value: fieldsContent[3], inline: true}
    ).setTitle('Présence');

    return embedMessage;
});

module.exports = {presenceEmbed};