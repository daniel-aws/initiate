import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";
import { adventureCommand } from "./adventure";

export const advCommand: SlashCommand = {
  commandInfo: {
    name: "adv",
    description: "Sets your character out on an adventure",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    adventureCommand.executeSlashCommand(interaction);
  },
};
