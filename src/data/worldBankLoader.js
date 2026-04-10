import fs from 'node:fs'
import path from 'node:path'
import { parseCsvText } from './csvParser.js'
import { METRIC_SOURCES, YEAR_RANGE } from './metricSources.js'

const COUNTRY_NAME_OVERRIDES = {
  'Antigua and Barbuda': 'Antigua and Barb.',
  'Bahamas, The': 'Bahamas',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Brunei Darussalam': 'Brunei',
  'Cabo Verde': 'Cape Verde',
  'Central African Republic': 'Central African Rep.',
  'Congo, Dem. Rep.': 'Democratic Republic of the Congo',
  'Congo, Rep.': 'Republic of the Congo',
  "Cote d'Ivoire": "Côte d'Ivoire",
  Curacao: 'Curaçao',
  'Czechia': 'Czech Republic',
  'Dominican Republic': 'Dominican Rep.',
  'Egypt, Arab Rep.': 'Egypt',
  'Equatorial Guinea': 'Eq. Guinea',
  Eswatini: 'Swaziland',
  'Gambia, The': 'Gambia',
  'Hong Kong SAR, China': 'Hong Kong',
  'Iran, Islamic Rep.': 'Iran',
  'Korea, Dem. People’s Rep.': 'North Korea',
  "Korea, Dem. People's Rep.": 'North Korea',
  'Korea, Rep.': 'Korea',
  'Kyrgyz Republic': 'Kyrgyzstan',
  'Lao PDR': 'Lao PDR',
  'Macao SAR, China': 'Macao',
  'Micronesia, Fed. Sts.': 'Micronesia',
  'Russian Federation': 'Russia',
  'Slovak Republic': 'Slovakia',
  'Somalia, Fed. Rep.': 'Somalia',
  'Syrian Arab Republic': 'Syria',
  'Turkiye': 'Turkey',
  'Venezuela, RB': 'Venezuela',
  'West Bank and Gaza': 'Palestine',
  'Yemen, Rep.': 'Yemen',
}

/** 世界银行 CSV 中的聚合体 / 收入组 / 区域 / IDA·IBRD 等（ISO3 代码），不参与国家分析 */
const EXCLUDED_COUNTRY_CODES = new Set([
  'AFE', 'AFW', 'ARB', 'CSS', 'CEB', 'EAR', 'EAS', 'EAP', 'TEA', 'EMU', 'ECS', 'ECA', 'TEC', 'EUU', 'FCS',
  'HPC', 'HIC', 'IBD', 'IBT', 'IDA', 'IDB', 'IDX', 'LAC', 'LCN', 'LDC', 'LIC', 'LMC', 'LMY', 'LTE', 'MEA',
  'MNA', 'TMN', 'MIC', 'NAC', 'OED', 'OSS', 'PSS', 'PRE', 'PST', 'SAS', 'SSA', 'SSF', 'SST', 'TLA', 'TSA',
  'WLD', 'INX',
])

const NON_SOVEREIGN_TERRITORY_CODES = new Set([
  'ABW', 'ASM', 'BMU', 'VGB', 'CYM', 'CHI', 'CUW', 'FRO', 'GIB', 'GRL', 'GUM', 'HKG', 'MAC', 'MNP', 'NCL',
  'PRI', 'PYF', 'SXM', 'TCA', 'VIR'
])

function safeNumber(value) {
  if (value == null || value === '') return null
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function findHeaderIndex(rows) {
  return rows.findIndex((row) => row.includes('Country Name') && row.includes('Indicator Name'))
}

function pickCsvFile(metricRootPath) {
  const csvFiles = fs.readdirSync(metricRootPath).filter((file) => file.toLowerCase().endsWith('.csv'))
  if (csvFiles.length === 0) {
    throw new Error(`No csv file found in ${metricRootPath}`)
  }
  return path.join(metricRootPath, csvFiles[0])
}

function getMapCountryNames(worldMapPath) {
  const worldMap = JSON.parse(fs.readFileSync(worldMapPath, 'utf8'))
  return new Set(worldMap.features.map((feature) => feature?.properties?.name).filter(Boolean))
}

function resolveMapName(countryName, mapCountryNames) {
  if (mapCountryNames.has(countryName)) return countryName
  const override = COUNTRY_NAME_OVERRIDES[countryName]
  if (override && mapCountryNames.has(override)) return override
  return null
}

function isExcludedEntity(countryCode, countryName) {
  if (!countryCode || !countryName) return true
  if (EXCLUDED_COUNTRY_CODES.has(countryCode)) return true
  if (NON_SOVEREIGN_TERRITORY_CODES.has(countryCode)) return true

  const name = countryName.trim()
  if (name === 'World') return true

  const aggregateKeywords = [
    'World',
    'income',
    'IDA',
    'IBRD',
    'dividend',
    'Euro area',
    'European Union',
    'OECD members',
    'states',
    'excluding',
    'Latin America',
    'East Asia',
    'Europe & Central Asia',
    'Middle East',
    'North America',
    'South Asia',
    'Sub-Saharan',
    'Fragile and conflict',
    'classified',
    'Western and Central',
    'Eastern and Southern',
    'Pacific island',
    'Caribbean small',
    'only (IBRD',
    'only (IDA',
    'blend (IDA',
    'total (IDA',
    'IBRD countries',
    'IDA & IBRD',
    'demographic dividend',
  ]

  return aggregateKeywords.some((keyword) => name.includes(keyword))
}

function analyzeAndTransformMetric(filePath, metricSource) {
  const rows = parseCsvText(fs.readFileSync(filePath, 'utf8'))
  const headerIndex = findHeaderIndex(rows)

  if (headerIndex === -1) {
    throw new Error(`Failed to locate header row in ${filePath}`)
  }

  const header = rows[headerIndex]
  const dataRows = rows.slice(headerIndex + 1).filter((row) => row.some((cell) => cell !== ''))

  const countryNameIndex = header.indexOf('Country Name')
  const countryCodeIndex = header.indexOf('Country Code')
  const indicatorNameIndex = header.indexOf('Indicator Name')
  const indicatorCodeIndex = header.indexOf('Indicator Code')

  const yearColumns = header
    .map((column, index) => ({
      year: Number(column),
      index,
    }))
    .filter(({ year }) => Number.isInteger(year) && year >= YEAR_RANGE.start && year <= YEAR_RANGE.end)

  const structure = {
    metricKey: metricSource.key,
    sourceFile: filePath,
    headerRowNumber: headerIndex + 1,
    dataStartRowNumber: headerIndex + 2,
    countryNameColumn: countryNameIndex,
    countryCodeColumn: countryCodeIndex,
    indicatorNameColumn: indicatorNameIndex,
    indicatorCodeColumn: indicatorCodeIndex,
    yearColumns: yearColumns.map((item) => item.year),
    sampleRows: dataRows.slice(0, 3).map((row) => ({
      countryName: row[countryNameIndex],
      countryCode: row[countryCodeIndex],
      indicatorName: row[indicatorNameIndex],
      indicatorCode: row[indicatorCodeIndex],
    })),
  }

  const records = []

  dataRows.forEach((row) => {
    const country = row[countryNameIndex]
    const countryCode = row[countryCodeIndex]
    const indicatorName = row[indicatorNameIndex]
    const indicatorCode = row[indicatorCodeIndex]

    if (!country || !countryCode) return

    yearColumns.forEach(({ year, index }) => {
      records.push({
        country,
        countryCode,
        indicatorName,
        indicatorCode,
        metric: metricSource.key,
        year,
        value: safeNumber(row[index]),
      })
    })
  })

  return {
    structure,
    records,
  }
}

export function buildWorldBankDataset({ workspaceRoot }) {
  const assignmentRoot = path.resolve(workspaceRoot, '..')
  const worldMapPath = path.resolve(workspaceRoot, 'src/assets/world.json')
  const mapCountryNames = getMapCountryNames(worldMapPath)

  const structures = []
  const records = []

  METRIC_SOURCES.forEach((metricSource) => {
    const metricRootPath = path.resolve(assignmentRoot, metricSource.folderName)
    const csvFilePath = pickCsvFile(metricRootPath)
    const result = analyzeAndTransformMetric(csvFilePath, metricSource)
    structures.push({
      metric: metricSource.key,
      label: metricSource.label,
      fullName: metricSource.fullName,
      unit: metricSource.unit,
      ...result.structure,
    })
    records.push(...result.records)
  })

  const countryMap = new Map()

  records.forEach((record) => {
    const key = record.countryCode || record.country
    const existing =
      countryMap.get(key) ??
      {
        country: record.country,
        countryCode: record.countryCode,
        mapName: resolveMapName(record.country, mapCountryNames),
        values: {},
      }

    if (!existing.values[record.year]) {
      existing.values[record.year] = {}
    }

    existing.values[record.year][record.metric] = record.value
    countryMap.set(key, existing)
  })

  const countries = [...countryMap.values()]
    .filter((country) => !isExcludedEntity(country.countryCode, country.country))
    .filter((country) =>
      YEAR_RANGE.start <= YEAR_RANGE.end &&
      METRIC_SOURCES.some((metric) =>
        Array.from({ length: YEAR_RANGE.end - YEAR_RANGE.start + 1 }, (_, offset) => YEAR_RANGE.start + offset).some(
          (year) => Object.prototype.hasOwnProperty.call(country.values[year] ?? {}, metric.key),
        ),
      ),
    )
    .map((country) => ({
      country: country.country,
      countryCode: country.countryCode,
      mapName: country.mapName,
      hasMapMatch: Boolean(country.mapName),
      availableYears: Object.keys(country.values).map(Number).sort((a, b) => a - b),
    }))
    .sort((a, b) => a.country.localeCompare(b.country))

  const allowedCountryCodes = new Set(countries.map((country) => country.countryCode))
  const countryCodeToCountry = Object.fromEntries(countries.map((country) => [country.countryCode, country]))
  const dataIndex = Object.fromEntries(
    [...countryMap.values()]
      .filter((country) => allowedCountryCodes.has(country.countryCode))
      .map((country) => [
        country.countryCode,
        {
          country: country.country,
          countryCode: country.countryCode,
          mapName: country.mapName,
          values: country.values,
        },
      ]),
  )

  const years = Array.from(
    { length: YEAR_RANGE.end - YEAR_RANGE.start + 1 },
    (_, index) => YEAR_RANGE.start + index,
  )

  const mapNameToCountryCode = Object.fromEntries(
    countries.filter((country) => country.mapName).map((country) => [country.mapName, country.countryCode]),
  )

  const unmatchedCountries = countries.filter((country) => !country.mapName)
  const matchingSummary = {
    csvCountries: countries.length,
    mapCountries: mapCountryNames.size,
    matchedCountries: countries.filter((country) => country.mapName).length,
    unmatchedCountriesCount: unmatchedCountries.length,
    unmatchedCountries: unmatchedCountries.map((country) => ({
      country: country.country,
      countryCode: country.countryCode,
    })),
    excludedEntityCounts: {
      aggregateCodes: EXCLUDED_COUNTRY_CODES.size,
      nonSovereignTerritories: NON_SOVEREIGN_TERRITORY_CODES.size,
    },
  }

  return {
    generatedAt: new Date().toISOString(),
    years,
    metrics: METRIC_SOURCES,
    countries,
    records,
    dataIndex,
    mapNameToCountryCode,
    structures,
    countryCodeToCountry,
    matchingSummary,
  }
}
