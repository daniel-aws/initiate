import { GuildEntity } from "@/entities/guild";
import { Guild } from "discord.js";
import { getRepository } from "typeorm";

export async function run(guild: Guild) {
  const serverRepo = getRepository(GuildEntity);
  const newServer = new GuildEntity(Number(guild.id));
  await serverRepo.save(newServer);
}
