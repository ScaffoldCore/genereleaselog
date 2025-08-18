/**
 * Filter git commits type
 * @param obj
 * @param keysToRemove
 */
export function filterGitCommitsType<T extends object, K extends keyof T>(
    obj: T,
    keysToRemove: K[],
): Omit<T, K> {
    const entries = Object.entries(obj).filter(
        ([key]) => !keysToRemove.includes(key as K),
    )
    return Object.fromEntries(entries) as Omit<T, K>
}
