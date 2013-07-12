# Scrapy settings for cl project
#
# For simplicity, this file contains only the most important settings by
# default. All the other settings are documented here:
#
#     http://doc.scrapy.org/topics/settings.html
#

BOT_NAME = 'cl'
BOT_VERSION = '1.0'

SPIDER_MODULES = ['cl.spiders']
NEWSPIDER_MODULE = 'cl.spiders'
DEFAULT_ITEM_CLASS = 'cl.items.ClItem'
USER_AGENT = '%s/%s' % (BOT_NAME, BOT_VERSION)

