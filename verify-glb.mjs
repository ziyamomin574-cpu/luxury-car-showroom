/**
 * GLB model verifier.
 *
 * Scans public/models/*.glb and sanity-checks the GLB container: magic,
 * version, JSON chunk, mesh/material/node counts. Pass `--material <name>`
 * to additionally require a material with that name (the paint material the
 * frontend recolours at runtime).
 *
 * Usage: node scripts/verify-glb.mjs [--material Body_Paint]
 * Exits non-zero if any file fails.
 */
import { existsSync, readdirSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(join(fileURLToPath(import.meta.url), '..', '..'))

const materialArg = process.argv.indexOf('--material')
const requiredMaterial = materialArg >= 0 ? process.argv[materialArg + 1] : null

const modelsDir = join(root, 'public', 'models')
if (!existsSync(modelsDir)) {
  console.log('No public/models directory yet — nothing to verify.')
  process.exit(0)
}

const files = readdirSync(modelsDir).filter((f) => f.endsWith('.glb'))
if (files.length === 0) {
  console.log('No .glb files in public/models yet.')
  process.exit(0)
}

let failed = 0

for (const file of files.sort()) {
  const buf = await readFile(join(modelsDir, file))

  if (buf.length < 12 || buf.toString('ascii', 0, 4) !== 'glTF') {
    console.error(`✗ ${file}: not a GLB (bad magic)`)
    failed += 1
    continue
  }

  const version = buf.readUInt32LE(4)
  const declaredLength = buf.readUInt32LE(8)
  if (declaredLength > buf.length) {
    console.error(`✗ ${file}: header says ${declaredLength} bytes but file is ${buf.length}`)
    failed += 1
    continue
  }

  let json
  try {
    let offset = 12
    const chunkLen = buf.readUInt32LE(offset)
    const chunkType = buf.readUInt32LE(offset + 4)
    if (chunkType !== 0x4e4f534a) {
      throw new Error(`first chunk is ${chunkType.toString(16)}, expected JSON (0x4E4F534A)`)
    }
    json = JSON.parse(buf.subarray(offset + 8, offset + 8 + chunkLen).toString('utf8'))
  } catch (err) {
    console.error(`✗ ${file}: JSON chunk invalid — ${err.message}`)
    failed += 1
    continue
  }

  const meshes = json.meshes?.length ?? 0
  const nodes = json.nodes?.length ?? 0
  const cameras = json.cameras?.length ?? 0
  const materials = (json.materials ?? []).map((m) => m.name).filter(Boolean)

  const hasPaint =
    requiredMaterial === null || (materials.length > 0 && materials.includes(requiredMaterial))

  const status = hasPaint ? '✓' : '✗'
  console.log(`${status} ${file}: glTF ${version}, json=${json.asset?.version ?? '?'}, meshes=${meshes}, nodes=${nodes}, cameras=${cameras}`)
  console.log(`   materials: ${materials.length ? materials.join(', ') : '(none)'}`)

  if (!hasPaint) {
    console.error(`   missing required paint material "${requiredMaterial}" (got: ${materials.join(', ') || 'none'})`)
    failed += 1
  }
}

console.log(failed ? `\n${failed} file(s) failed verification.` : '\nAll models pass verification.')
process.exit(failed ? 1 : 0)