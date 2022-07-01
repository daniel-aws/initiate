import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";

export const showInvCommand: SlashCommand = {
  commandInfo: {
    name: "Show Inventory",
    description: "Displays your current inventory slots",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    showInventoryCommand.executeSlashCommand(interaction);
  },
};

export const showInventoryCommand: SlashCommand = {
  commandInfo: {
    name: "Show Inventory",
    description: "Displays your current inventory slots",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    interaction.reply("pong");
  },
};
