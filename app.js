const dotenv = require("dotenv");
const env = dotenv.config();
const fs = require("node:fs");
const path = require("node:path");

if (env.error) {
    throw env.error;
}

const Sequelize = require('sequelize');

const {
    Client, Collection, Events, GatewayIntentBits, REST, Routes,
    userMention, codeBlock
} = require("discord.js");

const sequelize = new Sequelize(env.parsed.DB_NAME, env.parsed.DB_USER, env.parsed.DB_PASS, {
    host: env.parsed.DB_HOST,
    dialect: 'mysql',
    logging: false,
    // SQLite only
    storage: 'database.sqlite',
});

sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});


// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();
const commandsToJson = [];

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
        commandsToJson.push(command.data.toJSON());
    } else {
        console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

const rest = new REST({ version: '10' }).setToken(env.parsed.DISCORD_BOT_KEY);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commandsToJson.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(env.parsed.DISCORD_APPLICATION_ID),
            { body: commandsToJson },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

const modelsPath = path.join(__dirname, "models");
const modelFiles = fs
    .readdirSync(modelsPath)
    .filter((file) => file.endsWith(".model.js"));

for (const file of modelFiles) {
    const filePath = path.join(modelsPath, file);

    const model = require(filePath)(sequelize);
}
console.log(sequelize.models)
// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {
    sequelize.models.rw_presence.sync().then(() => {
        console.log('Presences table created successfully!');
    }).catch((error) => {
        console.error('Unable to create table : ', error);
    });

    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
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
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

const presenceArray = {
    1: '✅ Présent',
    2: '⏳ En Retard',
    3: '❌ Absent',
};

const presenceValues = {
    present: 1,
    retard: 2,
    absent: 3,
}

client.on(Events.InteractionCreate, interaction => {
    if (!interaction.isButton()) return;
    if (interaction.customId.startsWith('rw_presence')) {
        const updateStatus = interaction.customId.split(':')[1];
        const message = interaction.message;

        /*for (id in message.embeds[0].data.fields) {
            console.log(message.embeds[0].data.fields[id])
            message.embeds[0].data.fields[id].value = userMention(interaction.user.id);
        }*/

        sequelize.models.rw_presence.destroy({where: {user: interaction.user.id, message: message.id}});

        sequelize.models.rw_presence.create({
            message: message.id,
            user: interaction.user.id,
            presence: presenceValues[updateStatus]
        }).then(res => {
            sequelize.models.rw_presence.findAll({
                where: {
                    message: message.id
                }
            }).then(results => {
                const p = {1: [], 2: [], 3: []};
                for (let pKey in results) {
                    p[results[pKey].presence].push(results[pKey].user);
                }
                const fields = [];
                for (const [pKey, element] of Object.entries(p)) {
                    let content = codeBlock(element.length);
                    for (k in element) {
                        content += "\n" + userMention(element[k])
                    }
                    fields.push({name: presenceArray[pKey], inline: true, value: content})
                }
                message.embeds[0].data.fields = fields;
                interaction.message.edit({embeds: message.embeds});
            });
        }).catch((error) => {
            console.error('Failed to create a new record : ', error);
        });


    }
    interaction.reply({content: 'Votre participation a bien été enregistrée', ephemeral: true});
});

// Log in to Discord with your client's token
client.login(env.parsed.DISCORD_BOT_KEY);
