import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";

export const showInventoryCommand: SlashCommand = {
  commandInfo: {
    name: "Show Inventory",
    description: "Displays your current inventory slots",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    interaction.reply("pong");
  },
};
