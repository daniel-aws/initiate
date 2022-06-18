import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";

export const startCommand: SlashCommand = {
  commandInfo: {
    name: "start",
    description: "Starts your character",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    interaction.reply("Creating a character!");
  },
};
