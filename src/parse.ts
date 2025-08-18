import type { IGitCommit, IRawGitCommit, ResolvedChangelogOptions } from '@/src/types.ts'

export function parseCommits(commit: string, options: ResolvedChangelogOptions): IGitCommit {
    const commits = commit.split('\n').map((item: string) => {
        const [commits, shortHash, body, authorName, authorEmail, date] = item.split('|')

        return {
            commits,
            shortHash,
            body,
            message: body?.split(': ').slice(1).join(''),
            author: {
                authorName,
                authorEmail,
            },
            date,
        }
    }) as IRawGitCommit[]

    return Object.entries(options.types).reduce((acc, [key, value]) => {
        const list = commits.filter(commit => commit.body.startsWith(`${key}`))

        if (list.length) {
            acc[key] = {
                title: value.title,
                commits: list,
            }
        }

        return acc
    }, {} as IGitCommit)
}
