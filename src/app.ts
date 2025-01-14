import { Client, ClientOptions, Intents } from "discord.js";
import { performance } from "perf_hooks";
import config from "./config.json";
import { events } from "./events";
//import { startFlaskRoutine } from "./routines/flask";
//import { startWordleRoutine } from "./routines/wordle";
import { log, logError } from "./utils/logger";

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
  //startFlaskRoutine();
  //startWordleRoutine();
  log("Started routines.");
}

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

export { client };
