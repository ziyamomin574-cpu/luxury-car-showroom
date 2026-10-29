import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const INTEGRITY_ALGO = 'sha384'

/**
 * (E-01/E-02) Integrity hardening for the deployed site.
 *
 * Adds `integrity`/`crossorigin` attributes to script and stylesheet tags in
 * the built index.html and writes `dist/sri-manifest.json` mapping every
 * emitted asset to its sha384 digest. Run inside `vite build` via the
 * `closeBundle` hook.
 */
export function sriManifestPlugin() {
  let outDir = ''

  return {
    name: 'sri-manifest',
    apply: 'build',
    configResolved(config) {
      outDir = config.build.outDir
    },
    async closeBundle() {
      const indexPath = resolve(outDir, 'index.html')
      let html
      try {
        html = await readFile(indexPath, 'utf8')
      } catch {
        return
      }

      const manifest = {}

      const expr = /<(script|link)\b([^>]*\b(?:src|href)=")(\/assets\/[^"]+)("[^>]*)(\/?>)/g
      let result = ''
      let index = 0
      let match
      while ((match = expr.exec(html)) !== null) {
        result += html.slice(index, match.index)
        const [, tag, attrHead, assetPath, attrTail, close] = match
        const filePath = resolve(outDir, assetPath.slice(1))
        const body = await readFile(filePath)
        if (assetPath.match(/\.(js|css)$/)) {
          const digest = createHash(INTEGRITY_ALGO).update(body).digest('base64')
          const integrity = `${INTEGRITY_ALGO}-${digest}`
          manifest[assetPath] = { integrity, bytes: body.byteLength }
          result += `<${tag}${attrHead}${assetPath}${attrTail} integrity="${integrity}" crossorigin="anonymous"${close}`
        } else {
          result += match[0]
        }
        index = match.index + match[0].length
      }
      result += html.slice(index)

      await writeFile(indexPath, result, 'utf8')

      // Cover lazy-loaded chunks too (E-02): any js/css emitted to assets/
      // that is not referenced from index.html still gets a manifest entry.
      const { readdir } = await import('node:fs/promises')
      const { join } = await import('node:path')
      const assetsDir = join(outDir, 'assets')
      try {
        const all = await readdir(assetsDir)
        for (const name of all) {
          if (!/\.(js|css)$/.test(name)) continue
          const assetPath = `/assets/${name}`
          if (manifest[assetPath]) continue
          const body = await readFile(join(assetsDir, name))
          const digest = createHash(INTEGRITY_ALGO).update(body).digest('base64')
          manifest[assetPath] = { integrity: `${INTEGRITY_ALGO}-${digest}`, bytes: body.byteLength }
        }
      } catch {
        /* assets dir missing — nothing to cover */
      }

      await writeFile(resolve(outDir, 'sri-manifest.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8')

      this.info?.(
        `[sri] integrity applied to ${Object.keys(manifest).length} assets; manifest at dist/sri-manifest.json`,
      )
    },
  }
}