import {
  APIApplicationCommandPermission,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import { CommandInteraction, Message } from "discord.js";
import { advCommand } from "./adv";
import { adventureCommand } from "./adventure";
import { helpCommand } from "./help";
import { pingCommand } from "./ping";
import { settingsCommand } from "./settings";
import { startCommand } from "./start";

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
  [settingsCommand.commandInfo.name]: settingsCommand,
};

export function isInteraction(source: CommandInteraction | Message): boolean {
  return !!(source as CommandInteraction).commandId;
}
