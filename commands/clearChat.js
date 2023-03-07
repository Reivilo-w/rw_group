const { SlashCommandBuilder } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("cc")
		.setDescription("Permet d'effacer les messages")
		.addIntegerOption((option) =>
			option
				.setName("nombre")
				.setDescription("Le nombre de messages à effacer")
				.setRequired(true)
		),
	async execute(interaction) {
		const nb = interaction.options.getInteger("nombre") ?? 1;
		await interaction.channel.bulkDelete(nb, false);
		await interaction.reply({
			content: "Les messages ont bien été supprimés",
			ephemeral: true,
		});
	},
};

