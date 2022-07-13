import { CommandInteraction, Formatters, TextChannel } from "discord.js";
import * as timer from "timers/promises";
import { SlashCommand } from ".";
import { prisma, prismaReadOnly } from "../app";
import { guildSessionsData, sessionData } from "../data/loadData";
import { logError } from "../utils/logger";
import { makeID } from "../utils/random";

export const ascendCommand: SlashCommand = {
  commandInfo: {
    name: "ascend",
    description: "Starts your ascent up the initiate tower",
    options: [
      {
        name: "id",
        description:
          "Optionally the 4 letter ID of an in-progress tower ascension to join.",
        type: 3,
        required: false,
      },
    ],
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    // Get data on guild and user
    const userID = interaction.user.id;

    // Create thread with perms for ONLY players to type, adds player to thread
    const channel = interaction.channel as TextChannel;

    // Check if joining a game
    const joinGameID = interaction.options.getString("id");

    // Check if you are already in a session
    const characterData = await prismaReadOnly.character.findUnique({
      where: {
        id: userID,
      },
    });
    if (characterData?.inSession == true) {
      interaction.reply(
        "You are already in a session. Please finish your current ascension to embark on a new one."
      );
      return;
    }

    if (joinGameID != undefined) {
      // If invalid code length
      if (joinGameID.length != 4 || /\d/.test(joinGameID)) {
        interaction.reply(
          "Join code is not valid. Please use a valid 4 letter ID to join a session. To see current sessions type " +
            Formatters.inlineCode("/sessions") +
            "."
        );
        return;
      }
      // Check if session exists, if it does not exist then reply that it is not valid
      if ((await sessionData.get(joinGameID)) == undefined) {
        interaction.reply(
          "There are no sessions that exist with that code. Please use a valid 4 letter ID to join a session. To see current sessions type " +
            Formatters.inlineCode("/sessions") +
            "."
        );
        return;
      }
      // Otherwise join the session, join the queue, add to thread etc

      const joinSessionInfo = await sessionData.get(joinGameID);

      if (joinSessionInfo == undefined) {
        logError("ERROR: Session exists but has no valid data");
        return;
      }

      if (joinSessionInfo.queue.includes(userID)) {
        logError(
          "ERROR: User already in queue for session, user should have been denied due to being in session"
        );
        return;
      }

      // Add user to queue
      joinSessionInfo.queue.push(userID);
      await sessionData.set(joinGameID, joinSessionInfo);

      // Add user to thread
      const thread = channel.threads.cache.find(
        (x) => x.id === joinSessionInfo.thread.id
      );

      if (thread == undefined) {
        logError("ERROR: Thread for session should exist but is not found");
        return;
      }

      await thread.members.add(userID);

      interaction.reply(
        "Joined the game. Enter the thread for the lobby to watch the current floor and you will start when the floor is completed."
      );
    } else {
      // If not joining a game

      // Add session data to local variable
      if (interaction.guildId == undefined) {
        logError("ERROR: Guild ID is an error when it should not be");
        return;
      }

      // Generate session ID with 4 letter code
      let sessionID = makeID();

      // Make another session ID if a session with the code already exists
      while ((await sessionData.get(sessionID)) != undefined) {
        sessionID = makeID();
      }

      const newThread = await channel.threads.create({
        name: "Ascension lobby (code - " + sessionID + ")",
        autoArchiveDuration: 60,
        reason:
          "Lobby in progress! To join, type " +
          Formatters.inlineCode("/ascend <CODE>") +
          "with a 4 letter code ID of the session.",
      });

      // Create empty skeleton session data
      const newSessionData = {
        players: [],
        queue: [userID],
        floor: 1,
        enemies: [],
        thread: newThread,
      };

      // Add data/variables
      const existingSessions = await guildSessionsData.get(interaction.guildId);

      if (existingSessions == undefined) {
        await guildSessionsData.set(interaction.guildId, [sessionID]);
      } else {
        existingSessions.push(sessionID);
        await guildSessionsData.set(interaction.guildId, existingSessions);
      }

      await sessionData.set(sessionID, newSessionData);

      // Set player as in a session
      await prisma.character.update({
        where: { id: userID },
        data: {
          inSession: true,
        },
      });

      // Add user to thread
      const thread = channel.threads.cache.find(
        (x) => x.id === newSessionData.thread.id
      );

      if (thread == undefined) {
        logError("ERROR: Thread for session should exist but is not found");
        return;
      }

      await thread.members.add(userID);

      interaction.reply("Game created!");
      channel.send(
        "Lobby " +
          sessionID +
          " will start in 30 seconds! For other players: If you would like to join the ascension before it starts type " +
          Formatters.inlineCode("/ascend " + sessionID)
      );
      // If new session, starts countdown for starting session
      const wait = timer.setTimeout;
      await wait(30000);
      channel.send(
        "Lobby " +
          sessionID +
          " has started! For other players: If you would like to join the ascension on the next round type " +
          Formatters.inlineCode("/ascend " + sessionID)
      );

      // Start game loop
    }

    //
    //
    //
    // Set local variables for in-game combat

    // If game has not started and counter reaches 0, start game loop

    // GAME LOOP STARTS HERE********************
    //    NEW FLOOR CODE:
    //        Find random boss to add
    //        Reset some combat variables
    //        If player is in queue, add them to the game
    //    COMBAT LOOP:
    //    Reset action points
    //    Check for buffs and debuff resets if they ran out
    //    Calculate order of turns based on speed
    //    Calculate moves and sequences/attacks in the queue including boss mechanics
    //    Send all moves/events of the turns in chat
    //    If all players are dead or disconnected, end game
    //    If player health reaches 0, give rewards and remove player
    //    If boss health reaches 0, start new floor
    //    Calculate and display new combat image
    //    Poll data from character with 2 min time limit, if time limit is reached player is removed, otherwise add their moves to the queue

    // NOTE* How do we separate the game loop which is player agnostic and the player input portion...?
  },
};
