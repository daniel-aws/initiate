import { prismaReadOnly } from "../app";
import { gameData, sessionData } from "../data/loadData";

export async function loadPlayerData(userID: string) {
  console.log("Loading user: " + userID);
}

export async function startFloor(guildId: string, sessionId: string) {
  console.log("Starting floor");

  // Grab session data
  const currentSessionData = await sessionData.get(sessionId);
  const floorData = await gameData.get("FloorData");

  // Add floor data
  if (floorData.FloorData[currentSessionData.floor - 1].type == "rewards") {
    console.log("REWARDS GIVEN FOR FLOOR " + currentSessionData.floor);
    // For each reward item, check if inventory is full, if not, check if vault is full, if both are empty then ask player to pick an inventory/vault slot to replace, otherwise nothing is given. If inventory/vault is not full, put the item in there. Also set a time limit for response, if not reponding in time then item is not given.
    // Update database with new info
    currentSessionData.floor += 1;
    await sessionData.set(sessionId, currentSessionData);
  }

  // Add all players in queue to the player list
  for (let i = 0; i < currentSessionData.queue.length; i++) {
    const playerID = currentSessionData.queue[i];
    currentSessionData.queue.splice(i, 1);
    const playerData = {
      playerID: {
        Base: {},
        Current: {},
        "Floors Cleared": 0,
        Items: {},
        Buffs: [],
        Equipment: {},
        Current_Action: {
          target: "",
          action: "",
        },
      },
    };
    const characterData = await prismaReadOnly.character.findUnique({
      where: {
        id: playerID,
      },
      include: {
        inventory: true,
        equipment: true,
        stats: true,
      },
    });
    // Initialize the players' data
    // Calculate base stats based on level
    if (characterData?.inventory?.items != undefined) {
      playerData.playerID.Items = characterData?.inventory?.items;
    }
    if (characterData?.equipment != undefined) {
      playerData.playerID.Equipment = characterData.equipment;
    }
    currentSessionData.players.push(playerData);
  }
  if (floorData.FloorData[currentSessionData.floor - 1].type == "boss") {
    console.log("boss detected");
    currentSessionData.enemies =
      floorData.FloorData[currentSessionData.floor - 1].enemies;
  }

  // Set variables to the session data
  await sessionData.set(sessionId, currentSessionData);
}

export function submitInstancedAction() {
  sessionData.get("test");
  // GAME LOOP STARTS HERE********************
  //    COMBAT LOOP:
  //    Reset action points
  //    Check for buffs and debuff resets if they ran out
  //    Calculate order of turns based on speed
  //    Calculate moves and sequences/attacks in the queue including boss mechanics
  //    Send all moves/events of the turns in chat
  //    If player health reaches 0, give rewards and remove player
  //    If all players are dead or disconnected, end game
  //    If boss health reaches 0, start new floor (iterate on floors cleared and floor variable)
  //    Calculate and display new combat image
  //    Poll data from character with 2 min time limit, if time limit is reached player is removed, otherwise add their moves to the queue
}
