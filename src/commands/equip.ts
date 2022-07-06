import { Equipment } from "@prisma/client";
import { CommandInteraction, Formatters } from "discord.js";
import { SlashCommand } from ".";
import { prisma, prismaReadOnly } from "../app";
import { gameData } from "../data/loadData";
import { logError } from "../utils/logger";

export const equipCommand: SlashCommand = {
  commandInfo: {
    name: "equip",
    description: "Equips an item in your inventory to your equipment",
    options: [
      {
        name: "slot",
        description: "The inventory slot (1-10) to choose from.",
        type: 4,
        required: true,
        choices: [
          {
            name: "Slot 1",
            value: 0,
          },
          {
            name: "Slot 2",
            value: 1,
          },
          {
            name: "Slot 3",
            value: 2,
          },
          {
            name: "Slot 4",
            value: 3,
          },
          {
            name: "Slot 5",
            value: 4,
          },
          {
            name: "Slot 6",
            value: 5,
          },
          {
            name: "Slot 7",
            value: 6,
          },
          {
            name: "Slot 8",
            value: 7,
          },
          {
            name: "Slot 9",
            value: 8,
          },
          {
            name: "Slot 10",
            value: 9,
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
      interaction.reply(
        "Your character is not yet created. Use " +
          Formatters.inlineCode("/start") +
          " to create your character first."
      );
      return;
    }
    const inventoryData = JSON.parse(JSON.stringify(inventoryDBData.items));
    // Error check if selected inventory slot is empty
    const inventorySlot = interaction.options.getInteger("slot");

    if (inventorySlot == undefined) {
      logError("ERROR: Inventory slot is null when it should not be");
      return;
    }
    if (inventoryData.length < inventorySlot + 1) {
      interaction.reply(
        "You do not have any items in this inventory slot. Please try again with an inventory slot that has an item. You can check with " +
          Formatters.inlineCode("/inv") +
          "or " +
          Formatters.inlineCode("/inventory")
      );
      return;
    }
    // Grab data from the item (which slot it goes in)
    const inventoryItemName = inventoryData[inventorySlot].Name;
    const inventoryItemType = inventoryData[inventorySlot].Type;
    // If item is not equippable (not weapon or armor) then return error
    if (inventoryItemType != "weapon" && inventoryItemType != "armor") {
      interaction.reply(
        "The item in that inventory slot is not equippable. Please try again with an equippable item, such as a weapon or armor."
      );
      return;
    }
    // Grab inventory item data
    const inventoryItemRarity = inventoryData[inventorySlot].Rarity;
    const inventoryItemData = await gameData.get(inventoryItemType);
    let inventoryItem = inventoryItemData[inventoryItemRarity].filter(function (
      obj: any
    ) {
      return obj.name === inventoryItemName;
    });
    // Grab character equipment data
    const equipmentData = await prismaReadOnly.equipment.findUnique({
      where: {
        characterId: userID,
      },
    });
    if (inventoryItem.length != 1) {
      logError("ERROR: Item search resulted in duplicate or no entry");
      return;
    }
    if (equipmentData == null) {
      logError("ERROR: Equipment data from DB is null when it should not be");
      return;
    }
    inventoryItem = inventoryItem[0];
    let equipmentDestination: keyof Equipment = inventoryItemType;
    const newEquipmentData: any = equipmentData;
    // If item is a weapon
    if (inventoryItemType == "weapon") {
      // Set slot to place weapon
      if (inventoryItem.slot == 1) {
        equipmentDestination = "weapon1";
      } else if (inventoryItem.slot == 2) {
        equipmentDestination = "weapon2";
      }
      // If two handed weapon
      if (
        // If both slots are occupied, check if there is a free slot in inventory
        inventoryItem.two_handed == true
      ) {
        if (
          equipmentData?.weapon1 != "" &&
          equipmentData?.weapon2 != "" &&
          inventoryData.length >= 10
        ) {
          interaction.reply(
            "You do not have enough space in your inventory to equip this item. Please free up some space, for example by using the vault with " +
              Formatters.inlineCode("/vault") +
              ", and try again."
          );
          return;
        }
        // Unequip opposite side
        if (equipmentDestination == "weapon1" && equipmentData.weapon2 != "") {
          inventoryData.push(equipmentData.weapon2);
          equipmentData.weapon2 = "";
        } else if (
          equipmentDestination == "weapon2" &&
          equipmentData.weapon1 != ""
        ) {
          inventoryData.push(equipmentData.weapon1);
          equipmentData.weapon1 = "";
        }
      } else {
        let otherEquipmentDestination;
        if (equipmentDestination == "weapon1") {
          otherEquipmentDestination = "weapon2";
        } else if (equipmentDestination == "weapon2") {
          otherEquipmentDestination = "weapon1";
        }
        if (otherEquipmentDestination == undefined) {
          logError("ERROR: Equipment target location should not be null");
          return;
        }
        const equipmentToReplace: any =
          newEquipmentData[otherEquipmentDestination];
        if (
          equipmentToReplace.two_handed != undefined &&
          equipmentToReplace.two_handed == true
        ) {
          inventoryData.push(equipmentToReplace);
          newEquipmentData[otherEquipmentDestination] = "";
        }
      }
    } else if (inventoryItemType == "armor") {
      equipmentDestination = inventoryItem.slot;
    }
    const equipmentToReplace: any = newEquipmentData[equipmentDestination];
    if (equipmentDestination != undefined) {
      // If equip space is not empty, unequip equip slot
      if (equipmentToReplace != "") {
        inventoryData.push(equipmentToReplace);
      }
      newEquipmentData[equipmentDestination] = "";

      // Equip new item from inventory to equipment slot
      newEquipmentData[equipmentDestination] = inventoryData[inventorySlot];
      inventoryData.splice(inventorySlot, 1);
    }
    // Update on database
    await prisma.equipment.update({
      where: { characterId: userID },
      data: {
        weapon1: newEquipmentData.weapon1,
        weapon2: newEquipmentData.weapon2,
        head: newEquipmentData.head,
        neck: newEquipmentData.neck,
        chest: newEquipmentData.chest,
        legs: newEquipmentData.legs,
        feet: newEquipmentData.feet,
        hands: newEquipmentData.hands,
        cape: newEquipmentData.cape,
      },
    });

    await prisma.inventory.update({
      where: { characterId: userID },
      data: {
        items: inventoryData,
      },
    });
    interaction.reply("Item equipped!");
  },
};
