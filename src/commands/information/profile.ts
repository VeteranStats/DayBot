import { Command } from "../../structures/Command";
import {
  ActionRowBuilder,
  APIEmbedField,
  ApplicationCommandOptionType,
  ComponentType,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { prisma } from "../../db";

export default new Command({
  name: "profile",
  description: "Everything about your profile.",
  options: [
    {
      name: "view",
      description: "View someone's profile.",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: "user",
          description: "The user to view the profile of.",
          type: ApplicationCommandOptionType.User,
          required: false,
        },
      ],
    },
    {
      name: "settings",
      description: "Update your profile.",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "reset",
      description: "Resets your profile to the default settings.",
      type: ApplicationCommandOptionType.Subcommand,
    },
  ],
  run: async ({ client, interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "view") {
      const user = await prisma.user.findFirst({
        where: {
          id: interaction.user.id,
        },
      });

      const fields: APIEmbedField[] = [];

      const embed = new EmbedBuilder()
        .setAuthor({
          name: interaction.user.tag,
          iconURL: interaction.user.displayAvatarURL(),
        })
        .setColor(client.config.color);

      if (!user || (!user?.youtube && !user?.twitter && !user?.tiktok))
        return interaction.reply({
          embeds: [
            embed.setDescription(
              "This user did not set any public information."
            ),
          ],
        });

      if (user?.youtube)
        fields.push({
          name: "<:yt:1004352372434272317> YouTube",
          value: user.youtube,
          inline: true,
        });
      if (user?.twitter)
        fields.push({
          name: "<:twitter:1035440197766238218> Twitter",
          value: user.twitter,
          inline: true,
        });
      if (user?.tiktok)
        fields.push({
          name: "<:tiktok:1035440419485519882> TikTok",
          value: user.tiktok,
          inline: true,
        });

      return interaction.reply({
        embeds: [embed.setFields(fields)],
      });
    } else if (subcommand === "settings") {
      const modal = new ModalBuilder()
        .setCustomId("profileSettings")
        .setTitle("Update Profile");

      const inputs: TextInputBuilder[] = [
        new TextInputBuilder()
          .setCustomId("youtube")
          .setLabel("YouTube")
          .setPlaceholder("https://youtube.com/c/GraphifyStats")
          .setRequired(false)
          .setStyle(TextInputStyle.Short),
        new TextInputBuilder()
          .setCustomId("twitter")
          .setLabel("Twitter")
          .setPlaceholder("https://twitter.com/GraphifyStats")
          .setRequired(false)
          .setStyle(TextInputStyle.Short),
        new TextInputBuilder()
          .setCustomId("tiktok")
          .setLabel("TikTok")
          .setPlaceholder("https://tiktok.com/@graphifystats")
          .setRequired(false)
          .setStyle(TextInputStyle.Short),
      ];

      modal.addComponents(
        inputs.map((input) =>
          new ActionRowBuilder<TextInputBuilder>().addComponents(input)
        )
      );

      await interaction.showModal(modal);

      await interaction
        .awaitModalSubmit({
          filter: (int) => int.customId === "profileSettings",
          time: 60_000,
        })
        .then(async (int) => {
          int.deferReply({
            ephemeral: true,
          });

          await prisma.user.upsert({
            where: {
              id: int.user.id,
            },
            create: {
              id: int.user.id,
              youtube: int.fields.getTextInputValue("youtube"),
              twitter: int.fields.getTextInputValue("twitter"),
              tiktok: int.fields.getTextInputValue("tiktok"),
            },
            update: {
              youtube: int.fields.getTextInputValue("youtube"),
              twitter: int.fields.getTextInputValue("twitter"),
              tiktok: int.fields.getTextInputValue("tiktok"),
            },
          });

          int.followUp({
            embeds: [
              new EmbedBuilder()
                .setDescription("Changes saved successfully!")
                .setColor("#00ff00"),
            ],
          });
        });
    } else if (subcommand === "reset") {
      interaction.deferReply({
        ephemeral: true,
      });

      await prisma.user.upsert({
        where: {
          id: interaction.user.id,
        },
        create: {
          id: interaction.user.id,
          youtube: null,
          twitter: null,
          tiktok: null,
        },
        update: {
          youtube: null,
          twitter: null,
          tiktok: null,
        },
      });

      interaction.followUp({
        embeds: [
          new EmbedBuilder()
            .setDescription("Profile reset successfully!")
            .setColor("#00ff00"),
        ],
      });
    }
  },
});
