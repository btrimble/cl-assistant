from scrapy.item import Item, Field

class ClItem(Item):
  pass

class ClLocationItem(Item):
  Region    = Field()
  Subregion = Field()
  City      = Field()
  Url       = Field()
