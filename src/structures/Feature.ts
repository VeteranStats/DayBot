import { Bot } from "./Client";

export class Feature {
  constructor(public run: (c: Bot) => any) {}
}
