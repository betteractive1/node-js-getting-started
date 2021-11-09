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
    await page.waitForSelector("#page-tracking div div");
    const result = await page.evaluate(() => {
      try {
        const root = document.querySelector("div[data-barcode]");
        if (root) {
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
        } else {
          const head = document.body.parentNode;
          return {
            error: "ok",
            message: "error content",
            content: "<html>" + head.innerHTML + "</html>",
          };
        }
      } catch (err) {
        return { error: "ok", message: err };
      }
    });
    if (result.content && req.query.print) {
      return res.send(result.content);
    }
    res.json(result);
  } catch (err) {
    console.log(err);
    res.json({ error: "ok", message: err });
  } finally {
    browser.close();
  }
};
