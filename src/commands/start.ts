import { Prisma } from "@prisma/client";
import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";
import { prisma, prismaReadOnly } from "../app";

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
    const existingCharacter = await prismaReadOnly.character.findMany({
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

      // Create empty list for buffs and items
      const emptyList = [] as Prisma.JsonArray;

      // Add new character to database
      await prisma.character.create({
        data: {
          id: userID,
          stats: {
            create: {
              id: 0,
            },
          },
          activebuffs: {
            create: {
              buffs: emptyList,
            },
          },
          inventory: {
            create: {
              id: 0,
              items: emptyList,
            },
          },
          vault: {
            create: {
              id: 0,
              items: emptyList,
            },
          },
          equipment: {
            create: {
              weapon1: "",
              weapon2: "",
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
