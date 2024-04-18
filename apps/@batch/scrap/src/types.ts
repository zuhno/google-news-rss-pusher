import { Database } from "supabase-type";

export interface IRssResponseItem {
  title: string;
  link: string;
  pubDate: string;
  source?: string;
}

export interface IRssResponse {
  rss: {
    channel: {
      title: string;
      link: string;
      language: string;
      copyright: string;
      description: string;
      item: IRssResponseItem | IRssResponseItem[];
    };
  };
}

export type IFeedInsertData = Database["public"]["Tables"]["Feed"]["Insert"];

export type IFeedViewInsertData = Database["public"]["Tables"]["FeedView"]["Insert"];
