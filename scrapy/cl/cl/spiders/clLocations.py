from scrapy.spider import BaseSpider

class clLocations_Spider(BaseSpider):
  name='clLocations'
  domain_name = "craigslist.com"
  start_urls = ["http://www.craigslist.com/about/sites"]

  def parse(self, response):
    open('locations.html', 'wb').write(response.body)

SPIDER = clLocations_Spider()

