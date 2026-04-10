import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildWorldBankDataset } from '../src/data/worldBankLoader.js'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const workspaceRoot = path.resolve(scriptDir, '..')
const outputDir = path.resolve(workspaceRoot, 'src/data/generated')
const outputFile = path.resolve(outputDir, 'worldBankDataset.json')
const summaryFile = path.resolve(outputDir, 'worldBankStructureSummary.json')

fs.mkdirSync(outputDir, { recursive: true })

const dataset = buildWorldBankDataset({ workspaceRoot })

fs.writeFileSync(outputFile, JSON.stringify(dataset, null, 2), 'utf8')
fs.writeFileSync(summaryFile, JSON.stringify(dataset.structures, null, 2), 'utf8')

console.log(`Generated dataset: ${outputFile}`)
console.log(`Generated structure summary: ${summaryFile}`)
