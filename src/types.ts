export interface IChangelogOptions {
    '--'?: any[]
    'types': Record<string, { title: string }>
    'from'?: string
    'to'?: string
    'cwd'?: string
    'owner'?: string
    'repo'?: string
    'baseUrl'?: string
    'baseUrlApi'?: string
    'version'?: string
    'token'?: string
    'output'?: string
    'filter'?: string
}

export type ResolvedChangelogOptions = Required<IChangelogOptions>

export interface IRawGitCommit {
    commits: string
    shortHash: string
    body: string
    message: string
    author: {
        authorName: string
        authorEmail: string
    }
    date: string
}

export type IGitCommit = Record<string, {
    title: string
    commits: IRawGitCommit[]
}>
