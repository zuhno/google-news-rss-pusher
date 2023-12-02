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
