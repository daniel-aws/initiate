import { AnyChannel, TextChannel } from "discord.js";
import { Job, scheduleJob } from "node-schedule";
import { client, prisma } from "../app";
import { logError } from "../utils/logger";

let resetAdventureCDJob: Job;

export async function startResetAdventureCDRoutine() {
  resetAdventureCDJob = scheduleJob(
    "15 * * * *",
    async () => await resetAdventureCD()
  );
}

async function resetAdventureCD() {
  // Get all character data
  const characterData = await prisma.character.findMany();
  // Set new characterdata based on existing
  await prisma.$transaction(
    characterData.map((character) =>
      prisma.character.upsert({
        where: { id: character.id },
        update: {
          runs: character.stamina,
        },
        create: { id: character.id },
      })
    )
  );

  console.log("Adventurer cooldowns reset on DB.");
  try {
    if (process.env.MESSAGE_CHANNEL_ID == undefined) {
      logError("MESSAGECHANNELID IS NOT VALID");
      return;
    }
    const channel = client.channels.cache.get(process.env.MESSAGE_CHANNEL_ID);
    if (channel == undefined) {
      logError(
        "messageChannelID in config.json is not a valid/existing channel!"
      );
    } else if ((channel as AnyChannel).type != "GUILD_TEXT") {
      logError("messageChannelID in config.json is not a text channel!");
    } else {
      (channel as TextChannel).send("Adventurer cooldowns have been reset!");
    }
  } catch (error) {
    logError(error);
  }
}

export { resetAdventureCDJob };
