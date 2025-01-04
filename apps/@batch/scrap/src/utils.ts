import { type Page } from "puppeteer";

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

// ! unexport
const _getRootLink = (link: string) => {
  const removeProtocolLink = link.replace(/(https:\/\/|http:\/\/)/, "");
  const end = removeProtocolLink.indexOf("/");
  const domain = removeProtocolLink.slice(0, end);
  const protocol = link.match(/(https:\/\/|http:\/\/)/)[0];

  return protocol + domain;
};

// ! unexport
const _recursiveCheckUrl = (
  originUrl: string,
  page: Page,
  limitCount: number,
  pResolve: (value?: any) => void
) => {
  if (limitCount > 10) {
    pResolve();
    return;
  }

  const removeQueryOriginUrl = originUrl.split("?")[0];
  const removeQueryPageUrl = page.url().split("?")[0];
  if (removeQueryOriginUrl === removeQueryPageUrl) {
    setTimeout(() => _recursiveCheckUrl(originUrl, page, limitCount + 1, pResolve), 1000);
  } else pResolve();
};

// const getRandomUserAgent = () => {
//   return userAgents[Math.floor(Math.random() * userAgents.length)];
// };

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
