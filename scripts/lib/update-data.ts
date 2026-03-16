import fs from 'fs'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'lib', 'builders', 'data.ts')

type TargetArray = 'coreBuilders' | 'communityBuilders'

/**
 * Count existing makeBuilder( occurrences to determine next gradient index.
 */
function countBuilders(source: string): number {
  return (source.match(/makeBuilder\(/g) ?? []).length
}

/**
 * Find the closing `]` of the named const array using bracket counting.
 * Returns the index of the closing `]` character.
 */
function findArrayClosingBracket(source: string, arrayName: string): number {
  const startMarker = `const ${arrayName}`
  const arrayStart = source.indexOf(startMarker)
  if (arrayStart === -1) {
    throw new Error(`Could not find array "${arrayName}" in data.ts`)
  }

  // Find the opening `[`
  const openBracket = source.indexOf('[', arrayStart)
  if (openBracket === -1) {
    throw new Error(`Could not find opening [ for "${arrayName}"`)
  }

  let depth = 0
  for (let i = openBracket; i < source.length; i++) {
    if (source[i] === '[') depth++
    else if (source[i] === ']') {
      depth--
      if (depth === 0) return i
    }
  }

  throw new Error(`Could not find closing ] for "${arrayName}"`)
}

export function appendBuilder(
  name: string,
  role: string,
  active: boolean,
  imagePath: string | null,
  targetArray: TargetArray
): void {
  const source = fs.readFileSync(DATA_FILE, 'utf-8')
  const gradientIndex = countBuilders(source)

  const imageArg = imagePath ? `, '${imagePath}'` : ''
  const activeStr = active ? 'true' : 'false'
  const newLine = `  makeBuilder('${name}', '${role}', ${activeStr}, ${gradientIndex}${imageArg}),`

  const closingBracket = findArrayClosingBracket(source, targetArray)

  // Insert before the closing bracket, on a new line
  const updated =
    source.slice(0, closingBracket) + '\n' + newLine + '\n' + source.slice(closingBracket)

  fs.writeFileSync(DATA_FILE, updated, 'utf-8')
}
