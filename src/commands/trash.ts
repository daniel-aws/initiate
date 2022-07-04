import { CommandInteraction, Formatters } from "discord.js";
import { SlashCommand } from ".";
import { prisma, prismaReadOnly } from "../app";
import { logError } from "../utils/logger";

async function executeDeleteQuery(userID: any, inventoryData: any) {
  await prisma.inventory.update({
    where: { characterId: userID },
    data: {
      items: inventoryData,
    },
  });
}

export const trashCommand: SlashCommand = {
  commandInfo: {
    name: "trash",
    description: "Trashes an item in your inventory",
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
    // Confirm to delete item
    // Errors: ['time'] treats ending because of the time limit as an error
    const filter = (response: any) => {
      return (
        (response.content.toLowerCase() === "yes" ||
          response.content.toLowerCase() === "y") &&
        response.author.id === userID
      );
    };
    if (interaction.channel == null) {
      logError("ERROR: Channel does not exist");
      return;
    }
    interaction
      .reply({
        content:
          "Are you sure you would like to delete: " +
          inventoryData[inventorySlot].Name +
          " x " +
          inventoryData[inventorySlot].Amount +
          "? Confirm by typing 'y' or 'yes' in the chat within 10 seconds.",
        fetchReply: true,
      })
      .then(() => {
        if (interaction.channel == null) {
          logError("ERROR: Channel does not exist");
          return;
        }
        interaction.channel
          .awaitMessages({ filter, max: 1, time: 10000, errors: ["time"] })
          .then((_collected) => {
            inventoryData.splice(inventorySlot, 1);
            executeDeleteQuery(userID, inventoryData);
            interaction.followUp(`Item trashed!`);
          })
          .catch((_collected) => {
            interaction.followUp(
              "You have not confirmed whether you would like to trash your item."
            );
          });
      });
  },
};
