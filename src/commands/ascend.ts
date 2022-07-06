import { CommandInteraction } from "discord.js";
import { SlashCommand } from ".";

export const ascendCommand: SlashCommand = {
  commandInfo: {
    name: "ascend",
    description: "Starts your ascent up the initiate tower",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    interaction.reply("pong");
    // Add session data to local variable

    // If new session, starts countdown for starting session, create thread with perms for ONLY players to type
    // If joining session in countdown, adds player to session in database, gets current countdown time, adds player to thread

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
