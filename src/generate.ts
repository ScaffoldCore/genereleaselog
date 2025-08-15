import type { IChangelogOptions, IGitCommit, IOptions } from '@/src/types.ts'
import { resolveConfig } from '@/src/config.ts'
import { getCommitLogs } from '@/src/git.ts'
import { generateMarkdown } from '@/src/markdown.ts'
import { parseCommits } from '@/src/parse.ts'

export async function generate(options: IOptions): Promise<{
    config: IChangelogOptions
    commits: IGitCommit
    markdown: string
    rawCommits: string[]
}> {
    const config = await resolveConfig(options)
    const rawCommits = await getCommitLogs(config.from, config.to, config.cwd)
    const commits = parseCommits(rawCommits, config)
    const markdown = generateMarkdown(commits, config)

    return {
        config,
        commits,
        markdown,
        rawCommits: rawCommits.split('\n'),
    }
}
