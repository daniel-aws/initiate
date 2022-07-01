import { CommandInteraction, Formatters } from "discord.js";
import { SlashCommand } from ".";
import { prisma, prismaReadOnly } from "../app";
import { droptable } from "../config.json";
import { data } from "../data/loadData";
import { resetAdventureCDJob } from "../routines/adventureCooldown";
import { log, logError } from "../utils/logger";
import { randomItemInObject, randomNumBetweenRange } from "../utils/random";
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
        // Check if inventory is full and make sure there is one slot available
        const inventoryData = await prismaReadOnly.inventory.findUnique({
          where: {
            characterId: userID,
          },
        });
        if (inventoryData?.items != undefined) {
          let inventoryItems = JSON.parse(JSON.stringify(inventoryData.items));
          if (inventoryItems.length >= 20) {
            interaction.reply(
              "Your inventory is full. Please leave a slot open to get rewards from adventures."
            );
          } else {
            // If not on cooldown, retrieve a random droptable/text

            // set boolean for cooldown to true
            await prisma.character.update({
              where: { id: userID },
              data: { adventureCD: true },
            });

            // Roll for high, med, or low events
            const eventRoll = randomNumBetweenRange(1, 20);
            let adventureDataFile: string;

            if (eventRoll == 20) {
              adventureDataFile = "adventureHighRollData";
            } else if (eventRoll == 1) {
              adventureDataFile = "adventureLowRollData";
            } else {
              adventureDataFile = "adventureMidRollData";
            }
            // Retrieve adventure data
            type dataObjectKey = keyof typeof data;
            const adventureData = data[adventureDataFile as dataObjectKey];
            if (adventureData != undefined) {
              const result = randomItemInObject(adventureData);
              // Grab random item from the drop table
              let item = randomItemInObject(
                result["lootTable" as dataObjectKey]
              );

              let itemAmount = 1;
              let itemName;
              let values = [];
              let foundGold = false;
              values = inventoryItems;
              // If coins, grab random num coins
              if (item == "gold") {
                itemAmount = randomNumBetweenRange(
                  droptable.coinMin,
                  droptable.coinMax
                );
                itemName = item;
                for (let i = 0; i < values.length; i++) {
                  if (values[i].Name == "gold") {
                    values[i].Amount += itemAmount;
                    foundGold = true;
                    break;
                  }
                }
              } else {
                let itemRarity;
                let itemRarityTable: any;
                // Else if rarity distribution is overridden, use that
                if (typeof item == "object") {
                  const itemKeys = Object.keys(item);
                  if (itemKeys.length != 1) {
                    logError(
                      "ERROR: ITEM ENTRY IS INVALID, MULTIPLE/NO ITEM NAMES DETECTED"
                    );
                  }
                  itemRarityTable =
                    item[itemKeys[0] as dataObjectKey][
                      "rarity" as dataObjectKey
                    ];
                  item = itemKeys[0];
                }
                if (typeof item != "string") {
                  logError("ERROR: Item category should be a string");
                } else {
                  // Otherwise grab default rarity distribution
                  if (item == "weapon" || item == "armor") {
                    type defaultEquipDropsKey =
                      keyof typeof droptable.defaultEquipDrops;
                    itemRarityTable =
                      droptable.defaultEquipDrops[
                        adventureDataFile as defaultEquipDropsKey
                      ];
                  } else if (item == "buff_scroll" || item == "potion") {
                    type defaultItemDropsKey =
                      keyof typeof droptable.defaultItemDrops;
                    itemRarityTable =
                      droptable.defaultEquipDrops[
                        adventureDataFile as defaultItemDropsKey
                      ];
                  }
                  // Roll within distribution to get random rarity
                  const rarityTotal = JSON.parse(
                    JSON.stringify(itemRarityTable["total" as dataObjectKey])
                  );
                  const rarityRoll = randomNumBetweenRange(1, rarityTotal);

                  // Roll within distribution to get random item from list based on rarity
                  let place = 0;
                  itemRarityTable = JSON.parse(JSON.stringify(itemRarityTable));
                  const itemRarityTableKeys = Object.keys(itemRarityTable);
                  for (let i = 0; i < itemRarityTableKeys.length; i++) {
                    const itemRarityTablePlace = JSON.parse(
                      JSON.stringify(
                        itemRarityTable[itemRarityTableKeys[i] as dataObjectKey]
                      )
                    );
                    if (
                      typeof itemRarityTablePlace == "number" &&
                      itemRarityTableKeys[i] != "total"
                    ) {
                      place += itemRarityTablePlace;
                      const val = itemRarityTableKeys[i] as dataObjectKey;
                      itemRarityTable[val] = place;
                      if (itemRarityTable[val] >= rarityRoll) {
                        itemRarity = itemRarityTableKeys[i];
                        break;
                      }
                    }
                  }
                  // Retrieve item
                  const itemData = randomItemInObject(
                    data[item][itemRarity as dataObjectKey]
                  );
                  itemName = itemData.name;
                }
              }
              if (!foundGold) {
                const itemObject = JSON.parse(JSON.stringify({}));
                itemObject.Name = itemName;
                itemObject.Amount = itemAmount;
                values.push(itemObject);
              }
              inventoryItems = values;

              // Submit to database
              await prisma.inventory.update({
                where: { characterId: userID },
                data: { items: values },
              });

              // Reply with random text
              const adventureText = result["text" as dataObjectKey];
              if (
                typeof adventureText == "string" &&
                itemAmount != undefined &&
                itemName != undefined
              ) {
                // Give items to player in database
                log(
                  "received ITEM: " + itemName + " AMOUNT: " + itemAmount,
                  interaction.user.username
                );

                interaction.reply(
                  adventureText +
                    "\nReward: " +
                    itemAmount +
                    " " +
                    itemName +
                    "."
                );
              } else {
                logError(
                  "ERROR: ADVENTURE TEXT IS NOT A STRING OR ITEM NAME/AMOUNT IS UNDEFINED"
                );
              }
            }
          }
        }
      }
    }
  },
};
