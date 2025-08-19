export type ConfigTypes = Record<string, { title: string }>

export interface IChangelogOptions {
    '--'?: any[]
    'types': ConfigTypes
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

export interface IParseCommit {
    raw: IRawGitCommit
    type: string
    scope: string
    message: string
    pr: string
    issue: string
}

export type CategoryGitCommit = Record<string, ICategoryRawCommit>

export interface ICategoryRawCommit {
    title: string
    scopes: GitScopeCommit
}

export type GitScopeCommit = Record<string, IParseCommit[]>

export type IGitCommit = Record<string, {
    title: string
    commits: IRawGitCommit[]
}>

interface IUserConfigBase {
    types?: ConfigTypes
    overrideTypes?: boolean
}

type ExclusiveConfig<T> = T extends { include: any }
    ? T extends { exclude: any }
        ? never // Never when both include and exclude exist
        : T
    : T extends { exclude: any }
        ? T
        : T

export type IUserConfig = ExclusiveConfig<
    IUserConfigBase & {
        include?: string | string[]
        exclude?: string | string[]
    }
>
