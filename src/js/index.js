"use strict";

document.querySelector("#copy").addEventListener("click", async () => {
  const needToDistinct = await getDistinct();
  const needToIgnoreNotHttp = await getIgnoreNotHttp();
  const fromAllWindows = await getAllWindows();
  const rawUrls = [];
  const filterredUrls = [];
  const resUrls = [];

  if (fromAllWindows) {
    const windows = await chrome.windows.getAll({ populate: true });
    rawUrls.push(
      ...windows
        .map((window) => getUrlsFromWindow(window))
        .reduce((prev, current) => {
          prev.push(...current);
          return prev;
        }, [])
    );
  } else {
    const window = await chrome.windows.getCurrent({ populate: true });
    rawUrls.push(...getUrlsFromWindow(window));
  }

  if (needToIgnoreNotHttp) {
    filterredUrls.push(
      ...rawUrls.filter((urlStr) => {
        const url = URL.parse(urlStr);
        return url && (url.protocol === "http:" || url.protocol === "https:");
      })
    );
  } else {
    filterredUrls.push(...rawUrls);
  }

  if (needToDistinct) {
    const distinctedUrls = await distinctUrls(filterredUrls);
    resUrls.push(...distinctedUrls);
  } else {
    resUrls.push(...filterredUrls);
  }

  await navigator.clipboard.writeText(resUrls.join("\n"));
  window.close();
});

const getUrlsFromWindow = (window) => {
  return window.tabs.map((tab) => tab.pendingUrl || tab.url).filter((url) => url !== "");
};

const distinctUrls = async (rawUrls) => {
  const needToIgnoreId = await getIgnoreId();
  const map = new Map();
  for (const urlStr of rawUrls) {
    const url = URL.parse(urlStr);
    const key = needToIgnoreId ? url.origin + url.pathname + url.search : url.href;
    if (!map.has(key)) map.set(key, url.href);
  }
  const res = [];
  map.forEach((value) => res.push(value));
  return res;
};

document.querySelector("#paste").addEventListener("click", async () => {
  const urlsText = await navigator.clipboard.readText();
  const urls = urlsText
    .replace("\r\n", "\n")
    .replace("\r", "\n")
    .split("\n")
    .filter((url) => url !== "" && URL.canParse(url));
  const window = await chrome.windows.getCurrent();
  urls.forEach((url) => {
    chrome.tabs.create({ windowId: window.id, url });
  });
});

const distinctCtl = document.querySelector("#distinct");
const ignoreIdCtl = document.querySelector("#ignore_id");
const ignoreNotHttpCtl = document.querySelector("#ignore_not_http");
const allWindowsCtl = document.querySelector("#all_windows");

distinctCtl.addEventListener("change", async (e) => {
  const ignoreIdControl = document.querySelector("#ignore_id");
  ignoreIdControl.disabled = !e.target.checked;
  await setDistinct(e.target.checked);
});

ignoreIdCtl.addEventListener("change", async (e) => {
  await setIgnoreId(e.target.checked);
});

ignoreNotHttpCtl.addEventListener("change", async (e) => {
  await setIgnoreNotHttp(e.target.checked);
});

allWindowsCtl.addEventListener("change", async (e) => {
  await setAllWindows(e.target.checked);
});

document.addEventListener("DOMContentLoaded", async () => {
  distinctCtl.checked = await getDistinct();
  ignoreIdCtl.checked = await getIgnoreId();
  ignoreIdCtl.disabled = !(await getDistinct());
  ignoreNotHttpCtl.checked = await getIgnoreNotHttp();
  allWindowsCtl.checked = await getAllWindows();
});
