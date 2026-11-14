import { Product } from "../models/Product.js";
import { PriceHistory } from "../models/PriceHistory.js";

const currencyMap = {
  "£": "GBP",
  $: "USD",
  "€": "EUR",
  "₹": "INR",
};

export async function saveProduct(data) {
  const symbol = data.price.match(/[£$€₹]/)?.[0];

  const price = Number(data.price.replace(/[^\d.]/g, ""));

  if (!data.title || !data.url || !Number.isFinite(price)) {
    throw new Error("Invalid product data");
  }

  const currency = currencyMap[symbol] || "UNKNOWN";

  let product = await Product.findOne({
    url: data.url,
  });

  if (!product) {
    product = await Product.create({
      title: data.title,
      url: data.url,
      currentPrice: price,
      currency,
      availability: data.availability,
      rating: data.rating,
      lastScrapedAt: data.scrapedAt,
    });

    await PriceHistory.create({
      productId: product._id,
      price,
      currency,
    });

    console.log("New product saved:", data.title);

    return;
  }

  const priceChanged = product.currentPrice !== price;

  product.title = data.title;
  product.availability = data.availability;
  product.rating = data.rating;
  product.lastScrapedAt = data.scrapedAt;

  if (priceChanged) {
    console.log(`Price changed: ${product.currentPrice} → ${price}`);

    product.currentPrice = price;
    product.currency = currency;

    await PriceHistory.create({
      productId: product._id,
      price,
      currency,
    });
  }

  await product.save();
}
