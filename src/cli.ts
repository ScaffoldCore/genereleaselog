import type { IChangelogOptions } from '@/src/types.ts'
import { blue, cyan, dim, red, yellow } from 'ansis'
import cac from 'cac'
import { writeChangeLog } from '@/src/changelog.ts'
import { generate } from '@/src/generate.ts'
import { createRelease, updateReleaseAssets } from '@/src/github.ts'
import { version } from '../package.json'

const cli = cac('genereleaselog')

cli.command('')
    .option('--token <token>', 'Github Token', { default: '' })
    .option('--from <ref>', 'From tag', { default: '' })
    .option('--to <ref>', 'To tag', { default: '' })
    .option('--output <output>', 'Output file path', { default: 'CHANGELOG.md' })
    .option('--filter <filter>', 'Filter Conventional Commits Type', { default: '' })
    .option('--assets <assets...>', 'Files to upload as assets to the release. Use quotes to prevent shell glob expansion, e.g., "--assets \'dist/*.js\'"')
    .action(async (options: IChangelogOptions) => {
        console.log()
        console.log(dim(`genereleaselog `) + dim(`v${version}`))
        console.log()

        const { config, rawCommits, markdown } = await generate(options as any)
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
            await writeChangeLog(markdown, config)
        }

        if (!config.token) {
            console.error(red('No GitHub token found, specify it via GITHUB_TOKEN env. Release skipped.'))
            printWebUrl()
            process.exit(1)
        }

        const release = await createRelease(config, markdown)

        if (config.assets && config) {
            await updateReleaseAssets(config, release)
        }
    })

cli.help()
cli.version(version)
cli.parse()
