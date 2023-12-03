import type { AxiosStatic } from "axios";

import type { IRssResponseItem } from "./types";
import { excludeTitleRegex } from "./constants";

// ! unexport
const _textMatchRate = (text1: string, text2: string) => {
  const itemA = text1.toLowerCase().replace(excludeTitleRegex, "").split(" ");
  const itemB = text2.toLowerCase().replace(excludeTitleRegex, "").split(" ");

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

  return Number((sameArr.length / originArr.length).toFixed(2));
};

export const rawUnduplicatedRatio = (texts: string[], target: string) => {
  let max = 0;

  for (let i = 0; i < texts.length; i++) {
    const rate = _textMatchRate(texts[i], target);

    max = Math.max(max, rate);
  }

  return max;
};

export const rawUnduplicatedFeeds = (items: IRssResponseItem[], ratio: number) => {
  const copiedItems = [...items];
  for (let i = 0; i < copiedItems.length; i++) {
    for (let j = copiedItems.length - 1; j >= 0; j--) {
      if (i === j || !copiedItems[i]?.title || !copiedItems[j]?.title) continue;
      const rate = _textMatchRate(copiedItems[i].title, copiedItems[j].title);

      if (rate >= ratio) {
        copiedItems.splice(j, 1, null);
      }
    }
  }
  return copiedItems.filter((text) => !!text);
};

export const extractValidTitle = (title: string, source?: string) =>
  title.replace(` - ${source}`, "").replace(/\s?<\s?[\w가-힣]*\s?/g, "");

export const getRealLink = async (originLink: string, axiosGet: AxiosStatic["get"]) => {
  try {
    const { data } = await axiosGet(originLink);

    const match = String(data).match(/<a[^>]*>(.*?)<\/a>/);

    if (!match?.[1]) return originLink;
    return match[1];
  } catch (error) {
    return originLink;
  }
};
