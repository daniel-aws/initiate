import {
  APIApplicationCommandPermission,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord-api-types/v10";
import { CommandInteraction, Message } from "discord.js";
import { helpCommand } from "./help";
import { pingCommand } from "./ping";
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
  //[chatCommand.commandInfo.name]: chatCommand,
  [startCommand.commandInfo.name]: startCommand,
  [helpCommand.commandInfo.name]: helpCommand,
};

export function isInteraction(source: CommandInteraction | Message): boolean {
  return !!(source as CommandInteraction).commandId;
}
