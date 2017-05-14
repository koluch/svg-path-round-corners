import type {TData} from './types'

export const getSubPaths = (d: TData): Array<TData> => {
    if (d.length === 0) {
        return []
    }
    else if (d[0].command !== 'M' && d[0].command !== 'm') {
        throw new Error(`Path must start with an "M" or "m" command, not "${d[0].command}" `)
    }

    const result = []
    let nextSubPath = []
    d.forEach((command) => {
        if (command.command === 'M' || command.command === 'm') {
            if (nextSubPath.length > 0) {
                result.push(nextSubPath)
            }
            nextSubPath = [command]
        }
        else if (command.command === 'Z' || command.command === 'z') {
            nextSubPath.push(command)
            result.push(nextSubPath)
            nextSubPath = []
        }
        else {
            nextSubPath.push(command)
        }
    })
    if (nextSubPath.length > 0) {
        result.push(nextSubPath)
    }

    return result
}

