const {
    SlashCommandBuilder,
    PermissionFlagsBits, EmbedBuilder, bold, userMention
} = require("discord.js");
const {GroupMoney} = require("../models");
const {Sequelize} = require("sequelize");

const data = new SlashCommandBuilder()
    .setName('money')
    .setDescription(`Permet de gérer l'argent du groupe.`)
    .addSubcommand(subcommand =>
        subcommand
            .setName('add')
            .setDescription(`Ajouter de l'argent au coffre du groupe`)
            .addIntegerOption(option => option.setName('montant').setDescription('Le montant à ajouter au groupe').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('La raison de la transaction').setRequired(true))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('remove')
            .setDescription(`Retirer de l'argent au coffre du groupe`)
            .addIntegerOption(option => option.setName('montant').setDescription('Le montant à retirer au group').setRequired(true))
            .addStringOption(option => option.setName('description').setDescription('La raison de la transaction').setRequired(true))
    );

module.exports = {
    data,
    async execute(interaction) {
        const subCommand = interaction.options.getSubcommand();
        const amount = parseFloat(interaction.options.getInteger("montant") || 0);
        const reason = interaction.options.getString("description") || '';
        const user = interaction.user.id;

        await GroupMoney.create({
            guild: interaction.guild.id,
            type: subCommand,
            amount: amount,
            description: reason,
            user: user
        });

        const totalPerGuild = await GroupMoney.findAll({
            attributes: ['amount', 'type'], where: {
                guild: interaction.guild.id
            }
        });

        let total = 0;
        totalPerGuild.forEach(line => {
            if (line.type === 'add') total += parseFloat(line.amount);
            if (line.type === 'remove') total -= parseFloat(line.amount);
        });

        const totalToShow = new Intl.NumberFormat("es-US").format(total) + ' $';
        const txAmount = new Intl.NumberFormat("en-US").format(amount) + ' $';
        const txType = subCommand === 'add' ? 'ajouté' : 'retiré';
        const content = `${userMention(user)} a ${txType} ${bold(txAmount)} du groupe pour la raison suivante : "${reason}".\n\nNouveau total: ${bold(totalToShow)}`;

        const embedColor = subCommand === 'add' ? 0x00FF00 : 0xFF0000;

        const embedResponse = new EmbedBuilder().setTitle((subCommand === 'add' ? 'Ajout' : 'Retrait')).setDescription(content).setColor(embedColor);
        await interaction.reply({content: 'Transaction effectuée', ephemeral: true})
        await interaction.channel.send({embeds: [embedResponse]});
    },
};

