const puppeteer = require("puppeteer");
const LAUNCH_PUPPETEER_OPTS = {
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--window-size=1920x1080",
    "--lang=ru-RU,ru",
  ],
  headless: true,
};

const PAGE_PUPPETEER_OPTS = {
  networkIdle2Timeout: 1000,
  waitUntil: "networkidle2",
  timeout: 2800,
};

module.exports = async function (req, res) {
  const { id } = req.params;
  const browser = await puppeteer.launch(LAUNCH_PUPPETEER_OPTS);
  try {
    const page = await browser.newPage();
    await page.setExtraHTTPHeaders({
      "Accept-Language": "ru",
    });
    await page.goto(
      `https://www.pochta.ru/tracking#${id}`,
      PAGE_PUPPETEER_OPTS
    );
    await page.waitForSelector("div[data-barcode]", { timeout: 2800 });
    const result = await page.evaluate(() => {
      try {
        const root = document.querySelector("div[data-barcode]");
        const container = root.children[1];
        const itemsContainer = container.children[0].children[0];
        const items = [].slice.call(itemsContainer.children);
        const data = items.map((el) => {
          const status = el.querySelectorAll("span");
          return {
            text: el.querySelector("h2").innerText,
            status: status.length > 0 ? status[1].innerText : "",
          };
        });
        return { data };
      } catch (err) {
        return { error: "ok", message: err };
      }
    });

    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: "ok", message: err });
  } finally {
    browser.close();
  }
};
