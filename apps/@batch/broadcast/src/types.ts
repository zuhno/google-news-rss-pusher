import { Database } from "supabase-type";

export enum IntervalTimeEnum {
  THREE = 3,
  SIX = 6,
  TWELVE = 12,
}

export type FeedMap = Record<
  number,
  Database["public"]["Tables"]["Feed"]["Row"] & { category_title: string }
>;

export type Releases = Database["public"]["Tables"]["Release"]["Insert"][];

export type Categories = Database["public"]["Tables"]["Category"]["Row"][];
