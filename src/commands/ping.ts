import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";

export const pingCommand: SlashCommand = {
  commandInfo: {
    name: "ping",
    description: "Replies 'pong'.",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    interaction.reply("pong");
  },
};
