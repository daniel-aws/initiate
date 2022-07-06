import { CacheType, Interaction } from "discord.js";
import { commands } from "../commands";
import { submitInstancedAction } from "../routines/gameLoop";
import { log } from "../utils/logger";

export async function onInteractionCreate(interaction: Interaction<CacheType>) {
  if (!interaction.isCommand()) {
    if (interaction.isButton()) {
      submitInstancedAction();
    }
    return;
  }
  const command = commands[interaction.commandName];

  if (!command || !("executeSlashCommand" in command)) {
    throw Error(`Slash command: ${interaction.commandName} not found`);
  }

  await command.executeSlashCommand(interaction);
  log(
    `executed command as interaction: ${interaction.commandName}`,
    interaction.user.username
  );
}
