# Jumia Scraper

Jumia Scraper extracts data from any Jumia product, catalog or category pages - parses and converts the data to structured formats: HTML table, JSON, CSV, Excel and XML.

By providing a search term (keyword) and/or category URL, you can extract prices, product descriptions, images, stock availability, brand, category, sku, etc.

## Why scrape Jumia products?
The extracted data can be useful in the following ways:
- Optimize product prices
- Monitor practices employed by your competitors
- Understand market dynamics to boost productivity
- Harness the power of prevailing trends, etc.

## Cost of usage
Apify generously offers you $5 free usage credits monthly. From our tests, you can scrape upto 400,000 results. This should be good enough for most of your use cases but you can upgrade to a higher plan to extract even more data.

## Sample input parameter
Below is a sample of the input
```json
{
  "startUrls": ["https://www.jumia.com.ng/health-beauty/"],
  "maxItems": 2000,
  "proxyConfig": {
    "useApifyProxy": false
  },
  "maxConcurrency": 1,
  "handlePageTimeoutSecs": 30000,
  "maxRequestRetries": 3
}
```

- `maxItems`: this specifies the maximum number or results you want to extract for a given run.
- `proxyConfig`: This field provides you with the option to use a proxy for the run or not. You can set the value to `{"useApifyProxy": true}` if you are getting blocked. By default, the scraper will use Apify's datacenter proxies but you can provide one instead, manually.
- `maxConcurrency`: This specifies the number of concurrent operations. To get your results quickly, set this to a higher number.
- `handlePageTimeoutSecs`: Number of seconds elapsed to mark a page as timeout.
- `maxRequestRetries`: Number of times the scraper will retry handling a failed page. The default value is `3` times.
- `startUrls`: This is an array of static URLs to be added to the request queue. It can be a product or category page.

## Sample output
```json
{
	"sku": "HP246CL18EREXNAFAMZ",
	"name": "Notebook 15 Intel Core I3 (12GB RAM, 1TB HDD)-Win 10 + MOUSE",
	"displayName": "Hp Notebook 15 Intel Core I3 (12GB RAM, 1TB HDD)-Win 10 + MOUSE",
	"brand": "Hp",
	"sellerId": "<redacted>",
	"categories": "Computing/Computers & Accessories/Computers & Tablets/Laptops",
	"prices": {
		"rawPrice": "259999.00",
		"price": "₦ 259,999",
		"priceEuro": "597.07",
		"taxEuro": "41.66",
		"oldPrice": "₦ 290,000",
		"oldPriceEuro": "665.96",
		"discount": "10%"
	},
	"rating": {
		"average": 4,
		"totalRatings": 54
	},
	"image": "https://ng.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/74/591817/1.jpg?4227",
	"url": "https://www.jumia.com.ng/hp-notebook-15-intel-core-i3-12gb-ram-1tb-hdd-win-10-mouse-71819547.html",
	"isBuyable": true,
	"simples": [
		{
			"sku": "HP246CL18EREXNAFAMZ-100123623",
			"isBuyable": true,
			"name": "",
			"prices": {
				"rawPrice": "259999.00",
				"price": "₦ 259,999",
				"priceEuro": "597.07",
				"taxEuro": "41.66",
				"oldPrice": "₦ 290,000",
				"oldPriceEuro": "665.96",
				"discount": "10%"
			}
		}
	],
	"selectedVariation": "HP246CL18EREXNAFAMZ-100123623",
	"price": "₦ 259,999"
}
```

## Supported URL types
- Product page: [https://www.jumia.com.ng/umidigi-a13-pro-6gb128gb-rom-5150mah-nfc-48mp8mp5mp16mp-sunglow-gold-108702503.html](https://www.jumia.com.ng/umidigi-a13-pro-6gb128gb-rom-5150mah-nfc-48mp8mp5mp16mp-sunglow-gold-108702503.html)
- Category page: [https://www.jumia.com.ng/desktop-computers/?seller_score=3-5&page=2#catalog-listing](https://www.jumia.com.ng/desktop-computers/?seller_score=3-5&page=2#catalog-listing)
- Catalog page: [https://www.jumia.com.ng/catalog/?q=laptop&price_discount=40-100&page=3#catalog-listing](https://www.jumia.com.ng/catalog/?q=laptop&price_discount=40-100&page=3#catalog-listing)

## Limitation and solution
Category and Catalog pages can return a maximum of `2,000` results (this is a hard limit by Jumia). To extract more data, you can apply several filters e.g by price, brand, etc.

## Pagination
The scraper handles category and catalog pages pagination automatically, in a bid to extract as much data as possible. You can then use the `maxCrawledProducts` parameter to set the maximum number of the results to be obtained.
