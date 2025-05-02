const { SlashCommandBuilder } = require('discord.js');
const { generateWithLlama } = require('../../utils/localLlama');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('aitest')
        .setDescription('Test the local AI model')
        .addStringOption(option =>
            option.setName('prompt')
                .setDescription('The prompt to send to the AI')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply();
        
        try {
            const prompt = interaction.options.getString('prompt');
            
            // Generate response with local Llama
            const response = await generateWithLlama(prompt);
            
            // Send the response
            await interaction.editReply(`**Your prompt:** ${prompt}\n\n**AI response:** ${response}`);
        } catch (error) {
            console.error('Error testing AI:', error);
            await interaction.editReply('An error occurred while testing the AI. Make sure Ollama is running on your machine.');
        }
    },
};
