'use strict'

import { spawn } from 'child_process'

export default class {
    /**
     * Executes a command.
     *
     * @param args     the string array with the command and argument list
     * @param cwd      the string with the current working directory
     * @param encoding the BufferEncoding string with the optional encoding to replace utf8
     */
    public async call(
        command: string,
        args: string[],
        {
            cwd,
            encoding,
            usePipe = false,
        }: { cwd?: string; encoding?: BufferEncoding; usePipe?: boolean } = {},
    ): Promise<string> {
        const response: Buffer[] = []
        const errors: string[] = []

        // const cmd = spawn(command, args, { cwd })
        // FIXME: solve pipe issue for new `applySingle()`
        // https://stackoverflow.com/questions/28968662/using-a-pipe-character-with-child-process-spawn
        // https://stackoverflow.com/questions/38273253/using-two-commands-using-pipe-with-spawn/39482486#39482486
        // REVIEW: Invalid time value
        // const cmd = spawn('sh', ['-c', [command, ...args].join(' ')], { cwd })
        const cmd = usePipe
            ? spawn('sh', ['-c', [command, ...args].join(' ')], { cwd })
            : spawn(command, args, { cwd })
        cmd.stderr.setEncoding(encoding || 'utf8')

        return new Promise<string>((resolve, reject) => {
            cmd.on('error', (err: Error) => errors.push(err.message))
            cmd.stdout.on('data', (chunk: Buffer) => response.push(chunk))
            cmd.stdout.on('error', (err: Error) => errors.push(err.message))
            cmd.stderr.on('data', (chunk: string) => errors.push(chunk))
            cmd.stderr.on('error', (err: Error) => errors.push(err.message))

            cmd.on('close', (code: number) => {
                const result = response.length
                    ? Buffer.concat(response).toString(encoding || 'utf8').trim()
                    : ''

                const error = errors.length ? errors.join().trim() : ''

                if (code === 0) {
                    resolve(errors.length === 0 ? result : `${result}\n\n${error}`)
                }
                else {
                    reject(response.length === 0 ? error : `${result}\n\n${error}`)
                }
            })
        })
    }
}
