import type { IOptions } from '@/src/types.ts'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { blue, cyan, dim, red, yellow } from 'ansis'
import cac from 'cac'
import { generate } from '@/src/generate.ts'
import { createRelease } from '@/src/github.ts'
import { generateChangelog } from '@/src/markdown.ts'
import { version } from '../package.json'

const cli = cac('genereleaselog')

cli.command('')
    .option('--token <token>', 'Github Token')
    .option('--from <ref>', 'From tag')
    .option('--to <ref>', 'To tag')
    .option('--output <output>', 'Output file path', { default: 'CHANGELOG.md' })
    .action(async (options: IOptions) => {
        console.log()
        console.log(dim(`genereleaselog `) + dim(`v${version}`))
        console.log()

        const { config, rawCommits, markdown } = await generate(options)
        const webUrl = `https://${config.baseUrl}/${config.owner}/${config.repo}/releases/new?title=${encodeURIComponent(String(config.version))}&body=${encodeURIComponent(String(markdown))}&tag=${encodeURIComponent(String(config.version))}`

        console.log(cyan(config.from) + dim(' -> ') + blue(config.to) + dim(` (${rawCommits.length} commits)`))
        console.log(dim('--------------'))
        console.log()
        console.log(markdown.replace(/&nbsp;/g, ''))
        console.log()
        console.log(dim('--------------'))

        const printWebUrl = () => {
            console.log()
            console.error(yellow('Using the following link to create it manually:'))
            console.error(yellow(webUrl))
            console.log()
        }

        if (config.output && config.output !== 'false') {
            await writeFile(resolve(config.cwd, config.output), `${generateChangelog(markdown, config)}\n\n`, {
                encoding: 'utf-8',
                flag: 'a',
            })
        }

        if (!config.token) {
            console.error(red('No GitHub token found, specify it via GITHUB_TOKEN env. Release skipped.'))
            printWebUrl()
            process.exit(1)
        }

        await createRelease(config, markdown)
    })

cli.help()
cli.version(version)
cli.parse()
