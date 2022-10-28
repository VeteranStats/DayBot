import { Command } from "../../structures/Command";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ChannelType,
  ColorResolvable,
  EmbedBuilder,
  ModalBuilder,
  TextChannel,
  TextInputBuilder,
  TextInputStyle,
  NewsChannel,
} from "discord.js";

export default new Command({
  name: "embed",
  description: "Everything about embeds.",
  options: [
    {
      name: "create",
      description: "Create an embed.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "channel",
          description: "The channel to send in the embed in.",
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
          required: false,
        },
      ],
    },
    {
      name: "delete",
      description: "Delete an embed.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "message_id",
          description: "The message ID of the embed you want to delete.",
          type: ApplicationCommandOptionType.String,
          required: true,
        },
        {
          name: "channel",
          description: "The channel the embed was sent in.",
          type: ApplicationCommandOptionType.Channel,
          channelTypes: [ChannelType.GuildText, ChannelType.GuildAnnouncement],
          required: false,
        },
      ],
    },
  ],
  defaultMemberPermissions: ["Administrator"],
  run: async ({ client, interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "create") {
      const channel =
        (interaction.options.getChannel("channel") as
          | TextChannel
          | NewsChannel) || interaction.channel;

      const modal = new ModalBuilder()
        .setCustomId("embedCreate")
        .setTitle("Create Embed");

      const inputs: TextInputBuilder[] = [
        new TextInputBuilder()
          .setCustomId("title")
          .setLabel("Title")
          .setRequired(true)
          .setStyle(TextInputStyle.Short),
        new TextInputBuilder()
          .setCustomId("description")
          .setLabel("Description")
          .setRequired(true)
          .setStyle(TextInputStyle.Paragraph),
        new TextInputBuilder()
          .setCustomId("color")
          .setLabel("Color")
          .setRequired(false)
          .setStyle(TextInputStyle.Short)
          .setPlaceholder(String(client.config.color)),
      ];

      modal.addComponents(
        inputs.map((input) =>
          new ActionRowBuilder<TextInputBuilder>().addComponents(input)
        )
      );

      await interaction.showModal(modal);

      await interaction
        .awaitModalSubmit({
          filter: (int) => int.customId === "embedCreate",
          time: 86_400_000,
        })
        .then(async (int) => {
          await channel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle(int.fields.getTextInputValue("title"))
                .setDescription(int.fields.getTextInputValue("description"))
                .setColor(
                  int.fields.getTextInputValue("color") !== ""
                    ? (int.fields.getTextInputValue("color") as ColorResolvable)
                    : client.config.color
                ),
            ],
          });

          int
            .reply({
              embeds: [
                new EmbedBuilder()
                  .setDescription("Embed created successfully!")
                  .setColor("#00ff00"),
              ],
              ephemeral: true,
            })
            .catch(() => {});
        })
        .catch(() => {
          return interaction.reply({
            embeds: [
              new EmbedBuilder()
                .setDescription("You ran out of time.")
                .setColor("#ff0000"),
            ],
          });
        });
    } else if (subcommand === "delete") {
      const id = interaction.options.getString("message_id");
      const channel =
        (interaction.options.getChannel("channel") as
          | TextChannel
          | NewsChannel) || interaction.channel;

      const message = await channel.messages.fetch(id);

      if (!message)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("That embed no longer exists.")
              .setColor("#ff0000"),
          ],
          ephemeral: true,
        });

      if (message.author.id !== client.user.id)
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setDescription("That embed was not sent by me.")
              .setColor("#ff0000"),
          ],
          ephemeral: true,
        });

      await message.delete();

      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setDescription("Embed successfully deleted!")
            .setColor("#00ff00"),
        ],
        ephemeral: true,
      });
    }
  },
});
