require('dotenv').config(); //initialize dotenv
const { Client, Intents } = require('discord.js'); //import discord.js

const commandHandler = require('./commands');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] }); //create new client

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on('messageCreate', commandHandler);

//make sure this line is the last line
client.login(process.env.CLIENT_TOKEN); //login bot using token

module.exports = client;