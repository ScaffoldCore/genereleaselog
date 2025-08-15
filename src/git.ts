import { x } from 'tinyexec'

/**
 * Get github repo
 * @param cwd
 */
export async function getGithubRepo(cwd: string): Promise<{ owner: string, repo: string }> {
    // git config --get remote.origin.url | sed -E 's#(git@|https://)github.com[:/]([^/]+)/([^/]+)\.git#{"owner":"\2","repo":"\3"}#'
    const url = await execCommand('git', ['config', '--get', 'remote.origin.url'], cwd)
    const {
        owner,
        repo,
    } = JSON.parse(url.replace(/(git@|https:\/\/)github\.com[:/]([^/]+)\/([^/]+)\.git/, '{"owner":"$2","repo":"$3"}'))

    return {
        owner,
        repo,
    }
}

/**
 * Get the last commit hash
 * @param cwd
 */
export async function getLastTagCommit(cwd: string): Promise<string> {
    // git rev-list -1 HEAD
    return await execCommand('git', ['rev-list', '-1', 'HEAD'], cwd)
}

/**
 * Get the prev tags commit
 * @param cwd
 */
export async function getMatchingTagsCommit(cwd: string): Promise<string> {
    // git tag --sort=-creatordate | sed -n 2p
    const tag = await execCommand('git', ['tag', '--sort=-creatordate', '|', 'sed', '-n', '2p'], cwd)
    return await getCommitByTag(tag, cwd) || await getFirstGitCommit(cwd)
}

/**
 * Get the latest tag
 * @param cwd
 */
export async function getLatestTag(cwd: string): Promise<string> {
    // git describe --tags --abbrev=0
    return await execCommand('git', ['describe', '--tags', '--abbrev=0'], cwd)
}

/**
 * Get all git tags
 * @param cwd
 */
export async function getAllTags(cwd: string) {
    // git tag --sort=-creatordate
    return await execCommand('git', ['tag', '--sort=-creatordate'], cwd)
}

/**
 * Get first git commit
 * @param cwd
 */
export async function getFirstGitCommit(cwd: string): Promise<string> {
    // git rev-list --max-parents=0 HEAD
    return await execCommand('git', ['rev-list', '--max-parents=0', 'HEAD'], cwd)
}

/**
 * Get commit by tag
 * @param tag
 * @param cwd
 */
export async function getCommitByTag(tag: string, cwd: string): Promise<string> {
    // git rev-list -n 1 v0.0.4
    return await execCommand('git', ['rev-list', '-n', '1', `${tag}`], cwd)
}

/**
 * Get commit logs
 * @param from
 * @param to
 * @param cwd
 */
export async function getCommitLogs(from: string, to: string, cwd: string): Promise<string> {
    // git log <from>>..<to> --pretty=format:"%H|%h|%s|%an|%ae|%ad" --date=format:"%Y-%m-%d %H:%M:%S"
    return await execCommand('git', [
        'log',
        `${from}..${to}`,
        '--pretty=format:"%H|%h|%s|%an|%ae|%ad"',
        '--date=format:"%Y-%m-%d %H:%M:%S"',
    ], cwd)
}

export async function execCommand(cmd: string, args: string[], cwd: string): Promise<string> {
    return (await x(cmd, args, {
        nodeOptions: {
            cwd,
            shell: true,
        },
    })).stdout.trim()
}
