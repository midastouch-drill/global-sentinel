
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
    name: 'CDC Emergency Preparedness',
    url: 'https://www.cdc.gov/phpr/whatsnew.htm',
    category: 'Health',
    selectors: {
      title: '.list-item-title a',
      summary: '.list-item-description',
      date: '.list-item-date',
      link: '.list-item-title a'
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
