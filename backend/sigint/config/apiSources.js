
module.exports = {
  gdelt: {
    name: 'GDELT Project',
    baseUrl: 'https://api.gdeltproject.org/api/v2/doc/doc',
    category: 'Conflict',
    priority: 'high',
    params: {
      query: 'conflict OR crisis OR threat',
      mode: 'artlist',
      maxrecords: 20,
      format: 'json'
    }
  },
  worldBank: {
    name: 'World Bank Data',
    baseUrl: 'https://api.worldbank.org/v2/country/all/indicator/NY.GDP.MKTP.CD',
    category: 'Economic',
    priority: 'medium',
    params: {
      format: 'json',
      date: new Date().getFullYear(),
      per_page: 50
    }
  },
  usgs: {
    name: 'USGS Earthquake Data',
    baseUrl: 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_day.geojson',
    category: 'Natural',
    priority: 'high'
  }
};
