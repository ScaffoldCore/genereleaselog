import type { IReleaseResult, ResolvedChangelogOptions } from '@/src/types.ts'
import { readFile } from 'node:fs/promises'
import { basename, resolve } from 'node:path'
import { cyan, green, red } from 'ansis'
import { glob } from 'glob'
import { $fetch } from 'ofetch'

export async function createRelease(options: ResolvedChangelogOptions, markdown: string): Promise<IReleaseResult> {
    const headers = getGithubHeader(options)

    const url = `https://${options.baseUrlApi}/repos/${options.owner}/${options.repo}/releases`

    const result = await $fetch<IReleaseResult>(url, {
        method: 'post',
        headers,
        body: JSON.stringify({
            owner: options.owner,
            repo: options.repo,
            tag_name: options.version,
            name: options.version,
            body: markdown,
            draft: false,
            prerelease: false,
        }),
    })

    console.log(green(`Released on ${result.html_url}`))

    return result
}

export function getGithubHeader(options: ResolvedChangelogOptions) {
    return {
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${options.token}`,
    }
}

export async function updateReleaseAssets(options: ResolvedChangelogOptions, release: IReleaseResult) {
    const headers = getGithubHeader(options)

    let assetList: string[] = []
    if (typeof options.assets === 'string') {
        assetList = options.assets.split(',').map(s => resolve(options.cwd, s.trim())).filter(Boolean)
    }
    else if (Array.isArray(options.assets)) {
        assetList = options.assets.flatMap(item =>
            item.split(',').map(s => resolve(options.cwd, s.trim())),
        ).filter(Boolean)
    }

    const expandedAssets: string[] = []
    for (const pattern of assetList) {
        try {
            // Use the pattern directly without shell expansion
            // const matches = await glob(pattern)
            const matches = await glob(pattern)
            if (matches.length) {
                expandedAssets.push(...matches)
            }
            else {
                // If no matches found, treat as literal path
                expandedAssets.push(pattern)
            }
        }
        catch (error) {
            console.error(red(`Failed to process glob pattern "${pattern}": ${error}`))
            // Keep the original pattern as fallback
            expandedAssets.push(pattern)
        }
    }

    for (const asset of expandedAssets) {
        const filePath = resolve(asset)
        try {
            const fileData = await readFile(filePath)
            const fileName = basename(filePath)

            const uploadUrl = release.upload_url.replace('{?name,label}', `?name=${encodeURIComponent(fileName)}`)
            console.log(cyan(`Uploading ${fileName}...`))
            try {
                await $fetch(uploadUrl, {
                    method: 'POST',
                    headers: {
                        ...headers,
                        'Content-Type': 'application/octet-stream',
                    },
                    body: fileData,
                })
                console.log(green(`Uploaded ${fileName} successfully.`))
            }
            catch (error) {
                console.error(red(`Failed to upload ${fileName}: ${error}`))
            }
        }
        catch (error) {
            console.error(red(`Failed to read file ${filePath}: ${error}`))
        }
    }
}
