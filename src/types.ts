export interface IChangelogOptions {
    types: Record<string, { title: string }>
    from: string
    to: string
    cwd: string
    owner?: string
    repo?: string
    baseUrl?: string
    baseUrlApi?: string
    version: string
    token?: string
    output?: string
    filter?: string
}

export interface IOptions {
    '--': any[]
    'token'?: string
    'from'?: string
    'to'?: string
    'output'?: string
    'filter'?: string
}

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
