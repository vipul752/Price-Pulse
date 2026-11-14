import "dotenv/config";
import { ProxyConfiguration } from "crawlee";

const { WEBSHARE_HOST, WEBSHARE_PORT, WEBSHARE_USERNAME, WEBSHARE_PASSWORD } =
  process.env;

if (!WEBSHARE_USERNAME || !WEBSHARE_PASSWORD) {
  throw new Error("Missing Webshare credentials");
}

const proxyUrl = new URL(`http://${WEBSHARE_HOST}:${WEBSHARE_PORT}`);

proxyUrl.username = WEBSHARE_USERNAME;
proxyUrl.password = WEBSHARE_PASSWORD;

export const proxyConfiguration = new ProxyConfiguration({
  proxyUrls: [proxyUrl.toString()],
});
