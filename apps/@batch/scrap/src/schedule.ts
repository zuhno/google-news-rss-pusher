import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { clippedNews, getRealLink } from "./util";

const supabaseAnonClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
const supabaseServiceRoleClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const job = async () => {
  try {
    // Read Category List
    const { data: categoryData, error: categoryErr } = await supabaseAnonClient
      .from("Category")
      .select("*");

    if (categoryErr) throw new Error(categoryErr.message);
    if (categoryData.length === 0) return;

    for await (const categoryItem of categoryData) {
      // Read the list of saved feeds by category
      const { data: feedData, error: feedErr } = await supabaseAnonClient
        .from("Feed")
        .select("*")
        .eq("category_id", categoryItem.id)
        .order("id", { ascending: false })
        .limit(3);

      if (feedErr) throw new Error(feedErr.message);

      const prevTitles = feedData.map((feed) => feed.title || "");

      // Clip new non-overlapping news against saved feed titles
      const newFeeds = await clippedNews(prevTitles, categoryItem.title);

      if (newFeeds.length === 0) {
        console.log(`There is no clipping '${categoryItem.title}' news`);
        return;
      }

      const query = [];
      for await (const feed of newFeeds) {
        const realLink = await getRealLink(feed.link);

        query.push({
          title: feed.title,
          publisher: feed.source || "-",
          link: realLink,
          category_id: categoryItem.id,
        });
      }

      // Insert new news data
      const { data, error } = await supabaseServiceRoleClient.from("Feed").insert(query).select();

      if (error) throw new Error(error.message);

      console.log(`${data.length} new '${categoryItem.title}' news has been added.`);
    }
  } catch (error: unknown) {
    if (axios.isAxiosError<{ message: string }>(error)) {
      console.log("AxiosError : ", error.response.status, error.response?.data.message);
    } else if (error instanceof Error) {
      console.log("Error : ", error.message);
    } else {
      console.log("Unkown Error : ", error);
    }
  }
};
