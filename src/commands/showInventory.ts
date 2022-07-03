import { CommandInteraction, Formatters, MessageEmbed } from "discord.js";
import { SlashCommand } from ".";
import { prismaReadOnly } from "../app";

export const showInvCommand: SlashCommand = {
  commandInfo: {
    name: "inv",
    description: "Displays your current inventory slots",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    showInventoryCommand.executeSlashCommand(interaction);
  },
};

export const showInventoryCommand: SlashCommand = {
  commandInfo: {
    name: "inventory",
    description: "Displays your current inventory slots",
  },
  executeSlashCommand: async (interaction: CommandInteraction) => {
    //interaction.reply("pong");

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
        runs: true,
      },
    });
    // Return instructions for creating a character if there is no character entry
    if (characterData == null) {
      interaction.reply(
        "Your character is not yet created. Use " +
        Formatters.inlineCode("/start") +
        " to create your character first."
      );
    }
    else {

      const exampleEmbed = new MessageEmbed()
      .setTitle(interaction.user.username + '\'s Inventory');

      const inventoryData = await prismaReadOnly.inventory.findUnique({
        where: {
          characterId: userID,
        },
      });

      if (inventoryData?.items != undefined) {
        const inventoryItems = JSON.parse(JSON.stringify(inventoryData.items));
        console.log(inventoryItems)
        if (inventoryItems.length == 0) {
          
          exampleEmbed.addField('Inventory', 'Your inventory is empty. Go exploring!', true);
          await interaction.reply({ embeds: [exampleEmbed] });
        }
        else {
          for (let i = 0; i < inventoryItems.length; i++) {
            const obj = inventoryItems[i];
            exampleEmbed.addField('Slot ' + String(i), 'Name: ' + obj.Name + '\n' + 'Amount: ' + String(obj.Amount) + '\n');
           // exampleEmbed.addField('Amount: ', String(obj.Amount) + '\n',true);

          }
          await interaction.reply({ embeds: [exampleEmbed] });
        }
      }


      
    }
  },
};
