/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

export default class ExecError extends Error {
    constructor(
        public code: number,
        public stderr: string,
        public stdout?: string,
        public cause?: Error,
    ) {
        super(`${stderr}${stdout}`.trim(), { cause })
    }

    static fromError(code: number, error: Error): ExecError {
        return new ExecError(code, `[ExErr] ${error.message}`, undefined, error)
    }
}
