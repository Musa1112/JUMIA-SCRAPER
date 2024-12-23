import { Actor } from "apify";

export const generatePaginationUrls = async (page) => {
  let totalPaginationLimit = await page.evaluate(() => {
    return Number(
      document
        .querySelector(`section a[aria-label="Last Page"]`)
        ?.href?.split(`=`)[1]
        ?.split(`#`)[0]
    );
  });

  const currentPageUrl = await page.evaluate(`location.href`);

  let generatedPaginationUrls = [];

  while (totalPaginationLimit >= 2) {
    const url = new URL(currentPageUrl);
    url.searchParams.append(`page`, `${totalPaginationLimit}`);
    const modifiedUrl = `${url.href}#catalog-listing`;
    generatedPaginationUrls.push(modifiedUrl);
    totalPaginationLimit--;
  }
  generatedPaginationUrls = generatedPaginationUrls.reverse();
  return generatedPaginationUrls;
};

export const getProductUrls = async (page) => {
  let urls = await page.evaluate(() => {
    return Array.from(
      document.querySelectorAll(
        `main .aim .col12 [data-catalog="true"] article a.core`
      )
    ).map((item) => item.href);
  });

  return urls;
};

export const proxyConfiguration = async ({ proxyConfig, required = false }) => {
  const configuration = await Actor.createProxyConfiguration(proxyConfig);

  // this works for custom proxyUrls
  if (Actor.isAtHome() && required) {
    if (
      !configuration ||
      (!configuration.usesApifyProxy &&
        (!configuration.proxyUrls || !configuration.proxyUrls.length)) ||
      !configuration.newUrl()
    ) {
      throw new Error(
        "\n=======\nYou must use Apify proxy or custom proxy URLs\n\n======="
      );
    }
  }

  return configuration;
};
