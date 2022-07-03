import { CommandInteraction, Formatters } from "discord.js";
import { SlashCommand } from ".";
import { prisma, prismaReadOnly } from "../app";
import { logError } from "../utils/logger";

export const unequipCommand: SlashCommand = {
  commandInfo: {
    name: "unequip",
    description: "Unequips an item in your equipment to your inventory",
    options: [
      {
        name: "slot",
        description: "The equipment slot to choose from.",
        type: 3,
        required: true,
        choices: [
          {
            name: "Mainhand (right)",
            value: "weapon1",
          },
          {
            name: "Offhand (left)",
            value: "weapon2",
          },
          {
            name: "Head",
            value: "head",
          },
          {
            name: "Body",
            value: "chest",
          },
          {
            name: "Legs",
            value: "legs",
          },
          {
            name: "Feet",
            value: "feet",
          },
          {
            name: "Hands",
            value: "hands",
          },
          {
            name: "Neck",
            value: "neck",
          },
          {
            name: "Cape",
            value: "cape",
          },
        ],
      },
    ],
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    // Get data on guild and user
    //const guild = interaction.guild.id;
    const userID = interaction.user.id;

    // Pull existing inventory data
    const inventoryDBData = await prismaReadOnly.inventory.findUnique({
      where: {
        characterId: userID,
      },
    });
    if (inventoryDBData?.items == undefined) {
      logError("ERROR: Equipment data is null when it shouldn't be");
      return;
    }
    const inventoryData = JSON.parse(JSON.stringify(inventoryDBData.items));
    const equipmentSlot = interaction.options.getString("slot");
    if (equipmentSlot == undefined) {
      logError("ERROR: Equipment slot data is null when it shouldn't be");
      return;
    }
    if (inventoryData.length < 10) {
      // Grab character equipment data
      const dbEquipmentData = await prismaReadOnly.equipment.findUnique({
        where: {
          characterId: userID,
        },
      });
      if (dbEquipmentData == null) {
        return;
      }
      const equipmentData: any = dbEquipmentData;
      const equipmentSlotData: any = equipmentData[equipmentSlot];

      if (equipmentSlotData == undefined) {
        logError(
          "ERROR: Equipment slot from DB is undefined when it shouldnt be"
        );
        return;
      }
      if (equipmentSlotData == "") {
        interaction.reply(
          "You are currently not equipping anything in this slot. If this is unintentional, please try again in a slot that is equipped with an item."
        );
      } else {
        // If equip space is not empty, unequip equip slot
        inventoryData.push(equipmentSlotData);
        equipmentData[equipmentSlot] = "";

        // Update on database
        await prisma.equipment.update({
          where: { characterId: userID },
          data: {
            weapon1: equipmentData.weapon1,
            weapon2: equipmentData.weapon2,
            head: equipmentData.head,
            neck: equipmentData.neck,
            chest: equipmentData.chest,
            legs: equipmentData.legs,
            feet: equipmentData.feet,
            hands: equipmentData.hands,
            cape: equipmentData.cape,
          },
        });

        await prisma.inventory.update({
          where: { characterId: userID },
          data: {
            items: inventoryData,
          },
        });
        interaction.reply("Item unequipped!");
      }
    } else {
      interaction.reply(
        "You do not have enough space in your inventory to unequip. Please free up some space, for example by using the vault with " +
          Formatters.inlineCode("/vault") +
          ", and try again."
      );
    }
  },
};
