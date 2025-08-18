import type { ResolvedChangelogOptions } from '@/src/types.ts'
import { green } from 'ansis'
import { $fetch } from 'ofetch'

export async function createRelease(options: ResolvedChangelogOptions, markdown: string) {
    const header = {
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${options.token}`,
    }

    const url = `https://${options.baseUrlApi}/repos/${options.owner}/${options.repo}/releases`

    const result = await $fetch(url, {
        method: 'post',
        headers: header,
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
}
