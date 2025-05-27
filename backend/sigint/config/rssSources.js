
module.exports = {
  news: [
    {
      name: 'BBC World News',
      url: 'http://feeds.bbci.co.uk/news/world/rss.xml',
      category: 'General',
      priority: 'high'
    },
    {
      name: 'Reuters World News',
      url: 'https://feeds.reuters.com/reuters/worldnews',
      category: 'General', 
      priority: 'high'
    },
    {
      name: 'Al Jazeera',
      url: 'https://www.aljazeera.com/xml/rss/all.xml',
      category: 'General',
      priority: 'medium'
    },
    {
      name: 'CNN World',
      url: 'http://rss.cnn.com/rss/edition.rss',
      category: 'General',
      priority: 'medium'
    }
  ],
  health: [
    {
      name: 'WHO Health News',
      url: 'https://www.who.int/rss-feeds/news-english.xml',
      category: 'Health',
      priority: 'critical'
    },
    {
      name: 'CDC Health Updates',
      url: 'https://tools.cdc.gov/api/v2/resources/media/132608.rss',
      category: 'Health',
      priority: 'high'
    }
  ],
  security: [
    {
      name: 'Security Week',
      url: 'https://www.securityweek.com/feed/',
      category: 'Cyber',
      priority: 'high'
    },
    {
      name: 'Krebs on Security',
      url: 'https://krebsonsecurity.com/feed/',
      category: 'Cyber',
      priority: 'medium'
    }
  ],
  climate: [
    {
      name: 'NASA Climate News',
      url: 'https://climate.nasa.gov/rss/news.xml',
      category: 'Climate',
      priority: 'medium'
    }
  ]
};
