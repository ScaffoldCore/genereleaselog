import type { IChangelogOptions, ResolvedChangelogOptions } from '@/src/types.ts'
import { getGithubRepo, getLastTagCommit, getLatestTag, getMatchingTagsCommit } from '@/src/git.ts'
import { filterGitCommitsType } from '@/src/utils.ts'

const defaultConfig = {
    types: {
        feat: {
            title: '🎉 Features',
        },
        perf: {
            title: '🔥 Performance',
        },
        fix: {
            title: '🐞 Bug Fixes',
        },
        refactor: {
            title: '💅 Refactors',
        },
        docs: {
            title: '📚 Documentation',
        },
        build: {
            title: '📦 Build',
        },
        types: {
            title: '🌊 Types',
        },
        chore: {
            title: '🏡 Chore',
        },
        examples: {
            title: '🏀 Examples',
        },
        test: {
            title: '✅ Tests',
        },
        style: {
            title: '🎨 Styles',
        },
        ci: {
            title: '🤖 CI',
        },
    },
    from: '',
    to: '',
    cwd: '',
    version: '',
} satisfies IChangelogOptions

/**
 * Resolve config
 * @param options
 */
export async function resolveConfig(options: IChangelogOptions) {
    const { loadConfig } = await import('c12')
    const config = await loadConfig<IChangelogOptions>({
        name: 'genereleaselog',
        defaults: defaultConfig,
        overrides: options,
    }).then((r) => {
        return {
            ...r.config || defaultConfig,
            cwd: r.cwd || process.cwd(),
        }
    })

    config.baseUrl = config.baseUrl ?? 'github.com'
    config.baseUrlApi = config.baseUrlApi ?? 'api.github.com'
    config.token = config.token || process.env.GITHUB_TOKEN
    config.version = config.version || await getLatestTag(config.cwd)
    config.from = config.from || await getMatchingTagsCommit(config.cwd)
    config.to = config.to || await getLastTagCommit(config.cwd)

    const remote = await getGithubRepo(config.cwd)
    config.owner = remote.owner
    config.repo = remote.repo

    config.types = options.filter && options.filter !== '' ? filterGitCommitsType(config.types, options.filter.split(',')) : config.types

    return config as ResolvedChangelogOptions
}
