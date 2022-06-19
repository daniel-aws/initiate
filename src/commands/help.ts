import { CommandInteraction, Formatters } from "discord.js";
import { SlashCommand } from ".";

export const helpCommand: SlashCommand = {
  commandInfo: {
    name: "help",
    description: "Provides general information to get you started.",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    interaction.reply(
      "Hi there! This bot provides a unique RPG experience where you create a character, adventure and train every 30 minutes to obtain gear and loot, and climb the initiates' tower as high as possible to gain exp and rewards." +
        "\n\nTo get started, type " +
        Formatters.inlineCode("/start") +
        "to create your character, every 30 minutes type " +
        Formatters.inlineCode("/adv") +
        " or " +
        Formatters.inlineCode("/adventure") +
        " to embark on an adventure, and type " +
        Formatters.inlineCode("/ascend") +
        " to start an ascent through the tower to fight strong enemies."
    );
  },
};
