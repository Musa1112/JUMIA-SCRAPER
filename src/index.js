import { Actor } from "apify";
import { blockPatterns, chromeArgs } from "./constants.js";
import { PuppeteerCrawler, puppeteerUtils, log, sleep } from "crawlee";
import {
  proxyConfiguration,
  generatePaginationUrls,
  getProductUrls,
} from "./helpers.js";

(async () => {
  await Actor.init();

  const input = await Actor.getInput();

  const proxyConfig = await proxyConfiguration({
    proxyConfig: input.proxyConfig,
  });

  let {
    maxItems = 200,
    startUrls,
    maxConcurrency,
    minConcurrency,
    maxRequestRetries,
  } = input;

  // Sannity checks
  if (!maxConcurrency > 50) {
    throw new Error(`You nfeduionfjodnfjndjfk`);
  }

  let requestQueue = await Actor.openRequestQueue();

  for (const url of startUrls) {
    try {
      const parsedUrl = new URL(url);
      const origin = parsedUrl?.origin;

      if (origin?.includes(`ttps://www.jumia.com.n`)) {
        await requestQueue.addRequest({
          url,
          userData: {
            label: "STARTING_URL",
          },
        });
      } else {
        console.log(`${url} is not a Jumia URL`);
      }
    } catch (error) {
      console.log(`Error adding ${url} due invalid URL. Error: ${error}`);
    }
  }

  if (await requestQueue.isEmpty()) {
    throw new Error(`You need to provide at least one URL`);
  }

  let totalItems = 0;

  // Initialoize the crawler
  const crawler = new PuppeteerCrawler({
    requestQueue,
    maxConcurrency: 3,
    minConcurrency,
    maxRequestRetries,
    requestHandlerTimeoutSecs: 60,
    proxyConfiguration: proxyConfig,
    preNavigationHooks: [
      async (crawlingContext, gotoOptions) => {
        const { page } = crawlingContext;
        // gotoOptions.waitUntil = "networkidle2";
        gotoOptions.waitUntil = "domcontentloaded";
        await puppeteerUtils.blockRequests(page, {
          extraUrlPatterns: blockPatterns,
        });
      },
    ],
    async requestHandler({ page, request, response, session }) {
      console.log(request.url);
      try {
        const status = response.status();
        if (status !== "200") {
          session.markBad();
        }

        // Generate pagination URLs
        if (request.userData.label === "STARTING_URL") {
          console.log(`starting url`);
          // 1 - Generate Pagination pages and enqueue
          const paginationUrls = await generatePaginationUrls(page);

          console.log(paginationUrls);

          for (const url of paginationUrls) {
            await requestQueue.addRequest({
              url,
              userData: {
                label: "LISTING",
              },
            });
          }

          // // 2 - Get all direct product URLs and enqueue
          // const productUrls = await getProductUrls(page);
          // for (const url of productUrls) {
          //   await requestQueue.addRequest({
          //     url,
          //     userData: {
          //       label: "PRODUCT",
          //     },
          //   });
          // }
        }

        if (request.userData.label === "LISTING") {
          // 2 - Get all direct product URLs and enqueue
          const productUrls = await getProductUrls(page);
          for (const url of productUrls) {
            await requestQueue.addRequest({
              url,
              userData: {
                label: "PRODUCT",
              },
            });
          }
        }

        if (request.userData.label === "PRODUCT") {
          const product = await page.evaluate(`window.__STORE__?.products[0]`);
          const moreDataSource = await page.evaluate(
            `JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent)`
          );

          let images = moreDataSource?.mainEntity?.image?.contentUrl || [];
          images.unshift(product?.image);

          // const uniqueImages = new Set([...new Set(images)]);

          // Extract needed data points - title, price, images, descrnklfne, ratingb, revoi, sku
          let payload = {
            id: product?.id || null,
            sku: product?.sku,
            title: product?.displayName,
            name: product?.name || null,
            price: product?.prices?.rawPrice,
            currency: product?.prices?.price?.split(` `)[0]?.trim(),
            rating: product?.rating,
            url: request?.url,
            categories: product?.categories,
            images,
          };

          // Only write/push to dataset if dataset lenght is less than 'maxItems'
          if (maxItems > totalItems) {
            console.dir(payload, { depth: null, color: true });
            await Actor.pushData(payload);
            totalItems++;
          } else {
            log.info(`Run completed. Pulled ${totalItems} of ${maxItems} ✅👍`);
            await Actor.exit(0);
          }
        }

        session.markGood();
      } catch (error) {
        log.error(error);
      }
    },
    navigationTimeoutSecs: 30,
    launchContext: {
      launchOptions: {
        headless: false,
        devtools: false,
        args: [...chromeArgs],
        defaultViewport: false,
        // executablePath: process.env.APIFY_CHROME_EXECUTABLE_PATH,
        executablePath: "C:\/Program Files\/Google\/Chrome\/Application\/chrome.exe"
      },
    },
    browserPoolOptions: {
      useFingerprints: true,
      fingerprintOptions: {
        fingerprintGeneratorOptions: {
          browsers: [
            {
              name: "chrome",
              minVersion: 100,
            },
          ],
          devices: ["desktop"],
          operatingSystems: ["windows", "linux", "macos"],
        },
      },
    },
    useSessionPool: true,
    sessionPoolOptions: {
      sessionOptions: {
        maxUsageCount: 1000,
        maxErrorScore: 1,
      },
    },
    persistCookiesPerSession: true,
    async failedRequestHandler({ request, log }) {
      log.error(
        `${request.url} failed ${request.retryCount} times and won't be retried anymore...`
      );
    },
  });

  try {
    await crawler.run();
    await crawler.teardown();
    log.info(`Execution completed ✅`);
  } catch (error) {
    log.info(error);
  } finally {
    await Actor.exit();
  }
})();
