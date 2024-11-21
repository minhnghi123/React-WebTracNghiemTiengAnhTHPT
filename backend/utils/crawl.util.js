import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export const crawlData = async (url) => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });

  const getExamList = await page.evaluate(() => {
    let items = document.querySelectorAll(".testitem-wrapper");
    let examList = [];

    items.forEach((item) => {
      const titleElement = item.querySelector(".testitem-title");
      const title = titleElement ? titleElement.innerText : "";

      const infoElements = item.querySelectorAll(
        ".testitem-info-wrapper .testitem-info"
      );
      const time = infoElements[0]
        ? infoElements[0].innerText.split("|")[0].trim()
        : "";
      const attempts = infoElements[0]
        ? infoElements[0].innerText.split("|")[1].trim()
        : "";
      const comments = infoElements[0]
        ? infoElements[0].innerText.split("|")[2].trim()
        : "";
      const parts = infoElements[1]
        ? infoElements[1].innerText.split("|")[0].trim()
        : "";
      const questions = infoElements[1]
        ? infoElements[1].innerText.split("|")[1].trim()
        : "";

      const tags = Array.from(item.querySelectorAll(".testitem-tags .tag")).map(
        (tag) => tag.innerText
      );

      examList.push({
        title,
        time,
        attempts,
        comments,
        parts,
        questions,
        tags,
      });
    });

    return examList;
  });

  console.log(getExamList);
  await browser.close();
  // return getExamList;
};
