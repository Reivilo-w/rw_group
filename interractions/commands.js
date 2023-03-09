const {client} = require("../modules");
const {Events} = require("discord.js");

const listenCommands = client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "Impossible d'exécuter la commande, une erreur est survenue.",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "Impossible d'exécuter la commande, une erreur est survenue.",
                ephemeral: true,
            });
        }
    }
});

module.exports = {listenCommands};