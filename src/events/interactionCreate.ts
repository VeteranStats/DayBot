import { Event } from "../structures/Event";
import { CmdInteraction } from "../typings/Command";
import { EmbedBuilder, GuildMember } from "discord.js";

export default new Event("interactionCreate", async (client, interaction) => {
  if (interaction.isCommand()) {
    const command = client.commands.get(interaction.commandName);

    if (!command)
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ We couldn't find that command.")
            .setColor("Red"),
        ],
        ephemeral: true,
      });

    try {
      command.run({
        client,
        interaction: interaction as CmdInteraction,
      });
    } catch (err) {
      console.log(err);
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle("❌ An error occured.")
            .setDescription(`\`\`\`${err}\`\`\``)
            .setColor("Red"),
        ],
        ephemeral: true,
      });
    }
  }
});
