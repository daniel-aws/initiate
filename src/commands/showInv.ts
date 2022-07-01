import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";
import { showInventoryCommand } from "./showInventory";

export const showInvCommand: SlashCommand = {
  commandInfo: {
    name: "Show Inventory",
    description: "Displays your current inventory slots",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    showInventoryCommand.executeSlashCommand(interaction);
  },
};
