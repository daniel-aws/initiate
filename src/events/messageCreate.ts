import { ClientEvents, Message, User } from "discord.js";
import { client } from "../app";
import { commands } from "../commands";
import { log } from "../utils/logger";

export async function onMessageCreate(message: Message) {
  const isMentionsJune =
    !message.mentions.everyone && message.mentions.has(client.user as User);

  const isInThread =
    message.channel.type === "GUILD_PUBLIC_THREAD" ||
    message.channel.type === "GUILD_PRIVATE_THREAD";

  const isBotThread = isInThread && message.channel.ownerId === client.user?.id;

  if (
    !isBotThread ||
    !isMentionsJune ||
    !message.channel.isText() ||
    message.author.id === client.user?.id
  ) {
    return;
  }
}
