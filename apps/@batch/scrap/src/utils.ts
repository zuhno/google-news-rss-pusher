import type { AxiosStatic } from "axios";
import * as cheerio from "cheerio";

import type { IRssResponseItem } from "./types";
import { excludeTitleRegex, metaPropNamesForPreviewImage } from "./constants";

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

// ! unexport
const getRootLink = (link: string) => {
  const removeProtocolLink = link.replace(/(https:\/\/|http:\/\/)/, "");
  const end = removeProtocolLink.indexOf("/");
  const domain = removeProtocolLink.slice(0, end);
  const protocol = link.match(/(https:\/\/|http:\/\/)/)[0];

  return protocol + domain;
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

export const getOpengraphImage = async (link: string, axiosGet: AxiosStatic["get"]) => {
  try {
    const { data } = await axiosGet(link).catch(async () => {
      const rootLink = getRootLink(link);
      return await axiosGet(rootLink);
    });

    const $ = cheerio.load(data);

    let imageUrl: undefined | string;
    for (const propName of metaPropNamesForPreviewImage) {
      imageUrl = $(`meta[property='${propName}']`).prop("content");
      if (!!imageUrl) break;
    }

    if (imageUrl?.startsWith("https://") || imageUrl?.startsWith("http://")) {
      return imageUrl;
    } else if (imageUrl?.startsWith("/")) {
      const rootLink = getRootLink(link);

      return rootLink + imageUrl;
    } else {
      return;
    }
  } catch (error) {
    console.log("getOpengraphImage() error : ", error.message);
    return;
  }
};
