import "dotenv/config";
import { CheerioCrawler, Dataset } from "crawlee";
import { proxyConfiguration } from "../config/proxy.js";
import { connectDB } from "../config/database.js";
import { saveProduct } from "../services/priceTracker.js";

await connectDB();
const crawler = new CheerioCrawler({
  proxyConfiguration,

  maxConcurrency: 1,
  maxRequestsPerCrawl: 30,
  maxRequestRetries: 2,
  sameDomainDelaySecs: 2,
  respectRobotsTxtFile: true,

  async requestHandler({ request, $, enqueueLinks }) {
    console.log("Scraping:", request.url);
    const label = request.userData.label;

    // Product detail page
    if (label === "PRODUCT") {
      const title = $("div.product_main h1").first().text().trim();

      const price = $("div.product_main .price_color").first().text().trim();

      const availability = $("div.product_main .availability")
        .first()
        .text()
        .trim()
        .replace(/\s+/g, " ");

      const rating = $("div.product_main p.star-rating")
        .attr("class")
        ?.split(" ")
        .find((value) =>
          ["One", "Two", "Three", "Four", "Five"].includes(value),
        );

      const product = {
        title,
        price,
        availability,
        rating,
        url: request.url,
        scrapedAt: new Date(),
      };

      console.log("Extracted product:", product);

      if (!title || !price || !request.url.startsWith('https://')) {
        console.log("Invalid product:", product);
        return;
      }

      await saveProduct(product);
      console.log("Saved:", title);
      return;
    }
    // Product listing page
    await enqueueLinks({
      selector: "article.product_pod h3 a",
      label: "PRODUCT",
    });

    // Pagination
    await enqueueLinks({
      selector: "li.next a",
      label: "LIST",
    });
  },
});

await crawler.run([
  {
    url: "https://books.toscrape.com/",
    userData: { label: 'LIST' }
  },
]);

console.log("Scraping completed!");
