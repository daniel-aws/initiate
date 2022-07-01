import { PrismaClient } from "@prisma/client";
import { Client, ClientOptions, Intents } from "discord.js";
import { performance } from "perf_hooks";
import config from "./config.json";
import { loadData } from "./data/loadData";
import { events } from "./events";
import { startResetAdventureCDRoutine } from "./routines/adventureCooldown";
import { log, logError } from "./utils/logger";

const prisma = new PrismaClient();
const prismaReadOnly = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_READONLY_URL } },
});

const startTime = performance.now();

const clientOptions: ClientOptions = {
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: [
    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
  presence: {
    status: "online",
    activities: [
      {
        name: config.status,
        type: "WATCHING",
      },
    ],
  },
};

const client = new Client(clientOptions);

function startEventListeners() {
  for (const [eventName, eventMethod] of Object.entries(events)) {
    client.on(eventName, async (...args) => {
      try {
        await eventMethod(...args);
      } catch (error) {
        logError(error);
      }
    });
  }
  log("Started event listeners.");
}

function startRoutines() {
  startResetAdventureCDRoutine();
  log("Started routines.");
}

function startLoadData() {
  loadData();
  log("Loaded data.");
}

startLoadData();

startEventListeners();

client.once("ready", () => {
  startRoutines();
  log(
    `App running in ${((performance.now() - startTime) * 1e-3).toFixed(
      4
    )} seconds.`
  );
});

client.login(process.env.DISCORD_TOKEN);

export { client, prisma, prismaReadOnly };
