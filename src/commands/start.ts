import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";
import { prisma } from "../app";

export const startCommand: SlashCommand = {
  // Description of command
  commandInfo: {
    name: "start",
    description: "Starts your character",
  },

  // Called when command is executed
  executeSlashCommand: async (interaction: CommandInteraction) => {
    // Returns as there is no guild
    if (!interaction.guild) return;

    // Get data on guild and user
    //const guild = interaction.guild.id;
    const userID = interaction.user.id;

    // Query DB if there is already a character entry with the same user ID
    const existingCharacter = await prisma.character.findMany({
      where: {
        id: userID,
      },
    });

    // If character entry already exists
    if (existingCharacter.length > 0) {
      interaction.reply("Character already exists.");

      // If character does not exist, create one
    } else {
      console.log("Adding character!");

      // Add new character to database
      await prisma.character.create({
        data: {
          id: userID,
          adventureCD: false,
          stats: {
            create: {
              id: 0,
            },
          },
          currency: {
            create: {
              id: 0,
              balance: 0,
            },
          },
          activebuffs: {
            create: {
              id: 0,
            },
          },
          inventory: {
            create: {
              id: 0,
            },
          },
          equipment: {
            create: {
              id: 0,
              head: "",
              neck: "",
              chest: "",
              legs: "",
              feet: "",
              hands: "",
              cape: "",
            },
          },
        },
      });

      // Print completion to user
      interaction.reply("Character creation complete!");
    }

    // Finds and prints all characters in database to log
    //const allUsers = await prisma.character.findMany();
    //console.log(allUsers);
  },
};
