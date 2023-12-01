import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import { IRssResponse, IRssResponseItem } from "./type";
import { excludeTitleRegex } from "./constant";

const xml2json = new XMLParser();

export const getRealLink = async (link: string) => {
  try {
    const { data } = await axios.get(link);

    const match = String(data).match(/<a[^>]*>(.*?)<\/a>/);

    if (!match?.[1]) return link;
    return match[1];
  } catch (error) {
    return link;
  }
};

// unexport: Procedure to return match rate / n : 1
const _rawUnduplicatedRatio = (texts: string[], target: string) => {
  let max = 0;

  for (let i = 0; i < texts.length; i++) {
    const itemA = texts[i].toLowerCase().replace(excludeTitleRegex, "").split(" ");
    const itemB = target.toLowerCase().replace(excludeTitleRegex, "").split(" ");

    const joinItemA = itemA.join("");
    const joinItemB = itemB.join("");

    const sameA = itemA.filter((text) => text.length > 0 && joinItemB.includes(text));
    const sameB = itemB.filter((text) => text.length > 0 && joinItemA.includes(text));

    let sameArr = sameA;
    let originArr = itemA;
    if (sameA.length < sameB.length) {
      sameArr = sameB;
      originArr = itemB;
    }

    max = Math.max(max, Number((sameArr.length / originArr.length).toFixed(2)));
  }

  return max;
};

// unexport: Procedure for returning non-overlapping lists / m : n
const _rawUnduplicated = (items: IRssResponseItem[], ratio: number) => {
  const copiedItems = [...items];
  for (let i = 0; i < copiedItems.length; i++) {
    for (let j = copiedItems.length - 1; j >= 0; j--) {
      if (i === j || !copiedItems[i]?.title || !copiedItems[j]?.title) continue;

      const itemA = copiedItems[i].title.toLowerCase().replace(excludeTitleRegex, "").split(" ");
      const itemB = copiedItems[j].title.toLowerCase().replace(excludeTitleRegex, "").split(" ");

      const joinItemA = itemA.join("");
      const joinItemB = itemB.join("");

      const sameA = itemA.filter((text) => text.length > 0 && joinItemB.includes(text));
      const sameB = itemB.filter((text) => text.length > 0 && joinItemA.includes(text));

      let sameArr = sameA;
      let originArr = itemA;
      if (sameA.length < sameB.length) {
        sameArr = sameB;
        originArr = itemB;
      }

      if (Number((sameArr.length / originArr.length).toFixed(2)) >= ratio) {
        copiedItems.splice(j, 1, null);
      }
    }
  }
  return copiedItems.filter((text) => !!text);
};

// unexport: To extract a valid title
const _extractValidTitle = (title: string, source?: string) =>
  title.replace(` - ${source}`, "").replace(/\s?<\s?[\w가-힣]*\s?/g, "");

export const clippedNews = async (prevTitles: string[], categoryTitle: string) => {
  const newFeeds: IRssResponseItem[] = [];

  const { data } = await axios.get(
    `https://news.google.com/rss/search?q=${categoryTitle}when:1h&hl=ko`
  );

  const parseData = xml2json.parse(data) as IRssResponse;

  const items = parseData?.rss?.channel?.item;

  if (Array.isArray(items)) {
    // Remove publisher from title
    const removeSourceItems = items.map((item) => ({
      ...item,
      title: _extractValidTitle(item.title, item.source),
    }));

    // Duplicate check with saved titles
    const duplicatedCheckByNewFeed = removeSourceItems.filter(
      (feed) => _rawUnduplicatedRatio(prevTitles, feed.title) < 0.4
    );

    // Duplicate check by text - Considered redundant if matched more than 40%
    newFeeds.push(..._rawUnduplicated(duplicatedCheckByNewFeed, 0.4).slice(0, 1));
  } else if (items) {
    items.title = _extractValidTitle(items.title, items.source);

    if (_rawUnduplicatedRatio(prevTitles, items.title) < 0.4) {
      newFeeds.push(items);
    }
  }

  return newFeeds;
};
