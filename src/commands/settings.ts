import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";
import settings from "../settings.json";
import { logError } from "../utils/logger";

export const settingsCommand: SlashCommand = {
  // Description of command
  commandInfo: {
    name: "settings",
    description: "Sets the settings for the game.",
    options: [
      {
        name: "immersion",
        description: "The immersion mode for the game.",
        type: 3,
        required: true,
        choices: [
          {
            name: "serious",
            value: "serious",
          },
          {
            name: "fun",
            value: "fun",
          },
          {
            name: "both",
            value: "both",
          },
        ],
      },
    ],
  },

  // Called when command is executed
  executeSlashCommand: async (interaction: CommandInteraction) => {
    const currentOptions = interaction.options;
    if (currentOptions.getString("immersion")) {
      const immersionSetting = currentOptions.getString("immersion");
      console.log("CURRENT SETTING FOR IMMERSION: " + settings.immersionMode);
      if (immersionSetting == undefined) {
        logError("ERROR: Immersion setting undefined.");
        interaction.reply("Internal Error setting immersion setting.");
      } else {
        settings.immersionMode = immersionSetting;
        interaction.reply("Set immersion mode: " + immersionSetting);
      }
    }
  },
};
