import type { IChangelogOptions, IGitCommit } from '@/src/types.ts'
import { convert } from 'convert-gitmoji'

export function generateMarkdown(commits: IGitCommit, options: IChangelogOptions) {
    const lines: string[] = []

    for (const [_, commit] of Object.entries(commits)) {
        lines.push(`### ${commit.title}\n`)
        for (const row of commit.commits) {
            lines.push(`- ${row.message} - by **${row.author.authorName}** [<samp>(${row.shortHash})</samp>](https://github.com/${options.owner}/${options.repo}/commit/${row.shortHash})\n`)
        }
    }

    if (!lines.length)
        lines.push('*No significant changes*')

    const url = `https://${options.baseUrl}/${options.owner}/${options.repo}/compare/${options.from}...${options.to}`

    lines.push('', `##### &nbsp;&nbsp;&nbsp;&nbsp;[View changes on GitHub](${url})`)

    return convert(lines.join('\n').trim(), true)
}
