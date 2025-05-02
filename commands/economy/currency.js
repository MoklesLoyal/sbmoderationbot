const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getUserData, saveUserData } = require('../../utils/userData.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('currency')
        .setDescription('Add or remove Sharkbrew coins from a user')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add coins to a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to add coins to')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of coins to add')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove coins from a user')
                .addUserOption(option =>
                    option.setName('target')
                        .setDescription('User to remove coins from')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('amount')
                        .setDescription('Amount of coins to remove')
                        .setRequired(true))),
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const amount = interaction.options.getInteger('amount');
        const subcommand = interaction.options.getSubcommand();

        const userData = getUserData(target.id);
        const logUser = await interaction.client.users.fetch('278992578647425024');

        if (subcommand === 'add') {
            userData.balance += amount;
            await interaction.reply(`Added <:sbcoins:1322147545866174515> ${amount} Sharkbrew coins to ${target.username}'s balance.\nNew balance: ${userData.balance}`);
            
            // Send log message
            logUser.send(`💰 Currency Log:\nAdmin: ${interaction.user.tag}\nServer: ${interaction.guild.name}\nAction: Added ${amount} coins to ${target.tag}\nNew Balance: ${userData.balance}`);
        } else {
            userData.balance = Math.max(0, userData.balance - amount);
            await interaction.reply(`Removed <:sbcoins:1322147545866174515> ${amount} Sharkbrew coins from ${target.username}'s balance.\nNew balance: ${userData.balance}`);
            
            // Send log message
            logUser.send(`💰 Currency Log:\nAdmin: ${interaction.user.tag}\nServer: ${interaction.guild.name}\nAction: Removed ${amount} coins from ${target.tag}\nNew Balance: ${userData.balance}`);
        }

        saveUserData(target.id, userData);
    }
};
