export const METRIC_SOURCES = [
  {
    key: 'gdp',
    label: 'GDP',
    fullName: 'Gross Domestic Product',
    unit: 'current US$',
    folderName: 'GDP ( current  US$ )',
    indicatorCode: 'NY.GDP.MKTP.CD',
  },
  {
    key: 'gdpGrowth',
    label: 'GDP growth',
    fullName: 'GDP growth (annual %)',
    unit: 'annual %',
    folderName: 'GDP growth ( annual % )',
    indicatorCode: 'NY.GDP.MKTP.KD.ZG',
  },
  {
    key: 'gdpPerCapita',
    label: 'GDP per capita',
    fullName: 'GDP per capita (current US$)',
    unit: 'current US$',
    folderName: 'GDP per capita ( current US$ )',
    indicatorCode: 'NY.GDP.PCAP.CD',
  },
  {
    key: 'unemployment',
    label: 'unemployment',
    fullName: 'Unemployment, total (% of total labor force) (modeled ILO estimate)',
    unit: '% of total labor force',
    folderName: 'unemployment, total',
    indicatorCode: 'SL.UEM.TOTL.ZS',
  },
]

export const YEAR_RANGE = {
  start: 2015,
  end: 2024,
}
