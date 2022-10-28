import { ClientEvents } from "discord.js";
import { Bot } from "./Client";

export class Event<Key extends keyof ClientEvents> {
  constructor(
    public event: Key,
    public run: (c: Bot, ...args: ClientEvents[Key]) => any
  ) {}
}
