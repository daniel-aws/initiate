import {
  APIApplicationCommandPermission,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import { CommandInteraction, Message } from "discord.js";
import { advCommand, adventureCommand } from "./adventure";
import { equipCommand } from "./equip";
import { helpCommand } from "./help";
import { pingCommand } from "./ping";
import { settingsCommand } from "./settings";
import { showInvCommand, showInventoryCommand } from "./showInventory";
import { startCommand } from "./start";
import { trashCommand } from "./trash";
import { unequipCommand } from "./unequip";

export interface SlashCommand {
  commandInfo: RESTPostAPIApplicationCommandsJSONBody;
  permissions?: APIApplicationCommandPermission;
  executeSlashCommand: (
    interaction: CommandInteraction,
    ...args: any
  ) => Promise<void>;
}

export const commands: Record<string, SlashCommand> = {
  [pingCommand.commandInfo.name]: pingCommand,
  [adventureCommand.commandInfo.name]: adventureCommand,
  [advCommand.commandInfo.name]: advCommand,
  [startCommand.commandInfo.name]: startCommand,
  [helpCommand.commandInfo.name]: helpCommand,
  [equipCommand.commandInfo.name]: equipCommand,
  [unequipCommand.commandInfo.name]: unequipCommand,
  [trashCommand.commandInfo.name]: trashCommand,
  [settingsCommand.commandInfo.name]: settingsCommand,
  [showInventoryCommand.commandInfo.name]: showInventoryCommand,
  [showInvCommand.commandInfo.name]: showInvCommand,
};

export function isInteraction(source: CommandInteraction | Message): boolean {
  return !!(source as CommandInteraction).commandId;
}
