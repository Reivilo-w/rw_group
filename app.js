const dotenv = require("dotenv");
const env = dotenv.config();
const fs = require("node:fs");
const path = require("node:path");
const {client} = require('./modules');

if (env.error) {
    throw env.error;
}

const {
    Collection, Events, REST, Routes,
    userMention, codeBlock
} = require("discord.js");


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

const rest = new REST({version: '10'}).setToken(env.parsed.DISCORD_BOT_KEY);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commandsToJson.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(
            Routes.applicationCommands(env.parsed.DISCORD_APPLICATION_ID),
            {body: commandsToJson},
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
client.once(Events.ClientReady, (c) => {

    client.user.setPresence({
        activities: [{name: env.parsed.DEBUG === 'true' ? 'debug' : 'Problem Childs', type: 3}], status: 'dnd'
    });
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

require('./interractions');

// Log in to Discord with your client's token
client.login(env.parsed.DISCORD_BOT_KEY);
