
module.exports = {
  who: {
    name: 'WHO Emergency Updates',
    url: 'https://www.who.int/emergencies/disease-outbreak-news',
    category: 'Health',
    selectors: {
      title: '.sf-item-header-title a',
      summary: '.sf-item-header-summary',
      date: '.sf-item-header-date',
      link: '.sf-item-header-title a'
    },
    priority: 'critical'
  },
  cdc: {
    name: 'CDC Health Topics',
    url: 'https://www.cdc.gov/az/index.html',
    category: 'Health',
    selectors: {
      title: '.topic-name a',
      summary: '.topic-name a',
      date: '',
      link: '.topic-name a'
    },
    priority: 'high'
  },
  fema: {
    name: 'FEMA Disasters',
    url: 'https://www.fema.gov/disasters',
    category: 'Natural',
    selectors: {
      title: '.views-field-title a',
      summary: '.views-field-field-summary',
      date: '.views-field-created',
      link: '.views-field-title a'
    },
    priority: 'high'
  }
};
