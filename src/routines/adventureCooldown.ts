import { AnyChannel, TextChannel } from "discord.js";
import { Job, scheduleJob } from "node-schedule";
import { client, prisma } from "../app";
import config from "../config.json";
import { logError } from "../utils/logger";

let resetAdventureCDJob: Job;

export async function startResetAdventureCDRoutine() {
  resetAdventureCDJob = scheduleJob(
    "15 * * * *",
    async () => await resetAdventureCD()
  );
}

async function resetAdventureCD() {
  // Set all user cooldowns to false
  await prisma.character.updateMany({
    data: { adventureCD: false },
  });
  console.log("Adventurer cooldowns reset on DB.");
  try {
    const channel = client.channels.cache.get(config.messageChannelID);
    if (channel == undefined) {
      logError(
        "ERROR: messageChannelID in config.json is not a valid/existing channel!"
      );
    } else if ((channel as AnyChannel).type != "GUILD_TEXT") {
      logError("ERROR: messageChannelID in config.json is not a text channel!");
    } else {
      (channel as TextChannel).send("Adventurer cooldowns have been reset!");
    }
  } catch (error) {
    logError(error);
  }
}

export { resetAdventureCDJob };
