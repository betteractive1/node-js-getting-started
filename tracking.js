const puppeteer = require("puppeteer");
const LAUNCH_PUPPETEER_OPTS = {
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1920x1080",
  ],
  headless: true,
};

const PAGE_PUPPETEER_OPTS = {
  networkIdle2Timeout: 5000,
  waitUntil: "networkidle2",
  timeout: 10000,
};

module.exports = async function (req, res) {
  const { id } = req.params;
  const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
  const page = await browser.newPage();
  await page.goto(`https://www.pochta.ru/tracking#${id}`, PAGE_PUPPETEER_OPTS);
  await page.waitForSelector("div[data-barcode]");
  const data = await page.evaluate(() => {
    const root = document.querySelector("div[data-barcode]");
    const container = root.children[1];
    const itemsContainer = container.children[0].children[0];
    const items = [].slice.call(itemsContainer.children);
    return items.map((el) => {
      const status = el.querySelectorAll("span");
      return {
        text: el.querySelector("h2").innerText,
        status: status.length > 0 ? status[1].innerText : "",
      };
    });
  });
  res.json({ data });
};
