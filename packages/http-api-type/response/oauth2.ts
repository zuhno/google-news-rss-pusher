import type { Database } from "supabase-type";

export class PostOAuth2SlackAccessResponse {
  readonly active: Database["public"]["Tables"]["Subscriber"]["Row"]["active"];
  readonly channelId: Database["public"]["Tables"]["Subscriber"]["Row"]["ch_id"];
  readonly channelName: Database["public"]["Tables"]["Subscriber"]["Row"]["ch_name"];
  readonly channelUrl: Database["public"]["Tables"]["Subscriber"]["Row"]["ch_url"];
  readonly notificationInterval: Database["public"]["Tables"]["Subscriber"]["Row"]["interval_time"];
}
