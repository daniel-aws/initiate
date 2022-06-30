import { Prisma } from "@prisma/client";
import { CommandInteraction, Formatters } from "discord.js";
import { SlashCommand } from ".";
import { prismaReadOnly } from "../app";
import { resetAdventureCDJob } from "../routines/adventureCooldown";
import { logError } from "../utils/logger";
import { randomNumBetweenRange } from "../utils/random";
import { minDiffBetweenDates, secDiffBetweenDates } from "../utils/timeDiff";

export const adventureCommand: SlashCommand = {
  commandInfo: {
    name: "adventure",
    description: "Sets your character out on an adventure",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    // Returns as there is no guild
    if (!interaction.guild) return;

    // Get data on guild and user
    //const guild = interaction.guild.id;
    const userID = interaction.user.id;

    // Check if command is on cooldown
    // Query DB if there is already a character entry with the same user ID
    const characterData = await prismaReadOnly.character.findUnique({
      where: {
        id: userID,
      },
      select: {
        adventureCD: true,
      },
    });
    // Return instructions for creating a character if there is no character entry
    if (characterData == null) {
      interaction.reply(
        "Your character is not yet created. Use " +
          Formatters.inlineCode("/start") +
          " to create your character first."
      );
    } else {
      // If on cooldown, reply that there is cooldown with X time left
      if (characterData.adventureCD == true) {
        if (resetAdventureCDJob == null) {
          throw Error(`ERROR: Adventure CD Job is not properly set/created.`);
        } else {
          const nextAdventureResetTime = resetAdventureCDJob.nextInvocation();
          const currentTime = new Date();
          let timeDiff = secDiffBetweenDates(
            nextAdventureResetTime,
            currentTime
          );
          if (timeDiff <= 60) {
            interaction.reply(
              "Your character is currently resting from their last adventure. Wait " +
                Formatters.bold(timeDiff.toString()) +
                " seconds to head out again."
            );
          } else {
            timeDiff = minDiffBetweenDates(nextAdventureResetTime, currentTime);
            interaction.reply(
              "Your character is currently resting from their last adventure. Wait " +
                Formatters.bold(timeDiff.toString()) +
                " minutes to head out again."
            );
          }
        }
      } else {
        // If not on cooldown, retrieve a random droptable/text

        // Roll for high, med, or low events
        const eventRoll = randomNumBetweenRange(1, 20);
        let tableVal = "";

        if (eventRoll == 20) {
          console.log("High roll");
          tableVal = "HighRollAdventures";
        } else if (eventRoll == 1) {
          console.log("Low roll");
          tableVal = "LowRollAdventures";
        } else {
          console.log("Med roll");
          tableVal = "MedRollAdventures";
        }

        if (tableVal == "" || undefined) {
          logError("ERROR: Table value is empty");
        } else {
          const result: Object = await prismaReadOnly.$queryRaw(
            Prisma.sql`SELECT * FROM ${tableVal} ORDER BY RAND() LIMIT 1`
          );
          if (result != undefined) {
            console.log(JSON.stringify(result));
            const jsonObj = JSON.parse(JSON.stringify(result))[0]["data"];
            console.log("ROLL: " + jsonObj["text"]);
          }
        }

        // Randomize and grab resulting items from droptable

        // set boolean for cooldown to true and give droptable items to character
        /*await prisma.character.update({
          where: { id: userID },
          data: { adventureCD: true },
        });*/

        // Reply with random text
        interaction.reply("GOING ON AN ADVENTURE!");
      }
    }
  },
};
