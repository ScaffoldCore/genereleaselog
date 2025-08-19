import type {
    CategoryGitCommit,
    ConfigTypes,
    IParseCommit,
    IRawGitCommit,
    ResolvedChangelogOptions,
} from '@/src/types.ts'
import { isNotNull } from '@/src/utils.ts'

export function transformCommits(commit: string): IRawGitCommit[] {
    return commit.split('---\n')
        .splice(1)
        .map((item: string) => {
            const [firstLine = '', ..._body] = item.split('\n')

            const [commits, shortHash, message, authorName, authorEmail, date] = firstLine.split('|')

            return {
                commits,
                shortHash,
                message,
                author: {
                    authorName,
                    authorEmail,
                },
                date,
                body: _body.join('\n'),
            }
        }) as IRawGitCommit[]
}

export function parseCommits(commit: string): IParseCommit[] {
    return transformCommits(commit)
        .map(commit => parseGitCommit(commit))
        .filter(isNotNull)
}

const ConventionalCommitRegex = /^(?<type>\w+)(?:\((?<scope>[^)]+)\))?: (?<message>.+?)(?: \((?<pr>#\d+)\))?$/
const IssueRE = /(#\d+)/

/**
 * Parse a conventional commit message
 * @param commit
 */
export function parseGitCommit(commit: IRawGitCommit): IParseCommit | null {
    const match = commit.message.match(ConventionalCommitRegex)
    if (!match) {
        return null
    }

    const [, type = '', scope = '', message = '', pr = ''] = match
    const issue = commit.message.match(IssueRE)

    return {
        raw: commit,
        type,
        scope: scope.trim(),
        message: message.trim(),
        pr,
        issue: issue ? pr !== issue[0] ? issue[0] : '' : '',
    }
}

export function groupByCommits(commits: IParseCommit[], options: ResolvedChangelogOptions): CategoryGitCommit {
    const categories: CategoryGitCommit = {}

    const configTypes: ConfigTypes = options.types

    // init configTypes
    for (const [type, config] of Object.entries(configTypes)) {
        categories[type] = {
            title: config.title,
            scopes: {},
        }
    }

    for (const parsed of commits) {
        const { type, scope } = parsed as IParseCommit

        if (!configTypes[type])
            continue

        // Without scope is classified as "other"
        const scopeKey = scope || 'other'

        if (!categories[type]) {
            categories[type] = { title: type, scopes: {} }
        }
        if (!categories[type].scopes[scopeKey]) {
            categories[type].scopes[scopeKey] = []
        }

        categories[type].scopes[scopeKey].push({ ...parsed })
    }

    return Object.fromEntries(
        Object.entries(categories).filter(([_, value]) =>
            Object.keys(value.scopes).length > 0,
        ),
    ) as CategoryGitCommit
}
