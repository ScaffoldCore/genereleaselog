import type { IChangelogOptions, IOptions } from '@/src/types.ts'
import * as process from 'node:process'
import { getGithubRepo, getLastTagCommit, getLatestTag, getMatchingTagsCommit } from '@/src/git.ts'

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

// 获取配置
export async function resolveConfig(options: IOptions) {
    const { loadConfig } = await import('c12')

    const config = await loadConfig<IChangelogOptions>({
        name: 'genereleaselog',
        defaults: defaultConfig,
        // eslint-disable-next-line ts/ban-ts-comment
        // @ts-expect-error
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

    return config
}
