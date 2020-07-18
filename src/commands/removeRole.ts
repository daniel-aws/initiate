import config from "@/config.json";
import { Command, Reply } from "@/utils/command";
import { Message, MessageEmbed } from "discord.js";
import { getRepository } from "typeorm";
import { RoleEntity } from "@/entities/role";

async function execute(_: any, message: Message): Promise<Reply> {
  const roleEntities = await getRepository(RoleEntity).find({
    where: {
      guild: message.guild.id,
    },
  });
  const roleNames = roleEntities.map((role) => role.roleName);
  const reply = new MessageEmbed();
  return reply;
}

const removeRole: Command = {
  dm: false,
  admin: false,
  execute,
};

export default removeRole;
