import { ActivityType } from "discord.js";
import "dotenv/config";
import { Bot } from "./structures/Client";

export const client = new Bot({
  presence: {
    activities: [
      {
        name: "statistics",
        type: ActivityType.Watching,
      },
    ],
  },
});

client.start();
