/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import * as vscode from 'vscode'
import StashGit, { FileStage } from '../Git/StashGit'
import FileNodeType from '../StashNode/FileNodeType'

export default class implements vscode.TextDocumentContentProvider {
    private onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>()

    public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const params = uri.query.split('&').reduce<Record<string, string>>((data, kv) => {
            const [key, value] = kv.split('=')
            data[key] = value
            return data
        }, {})

        const cwd = params.cwd
        const index = parseInt(params.index, 10)
        const path = params.path
        const oldPath = params.oldPath
        const type = params.type as FileNodeType
        const side = params.side as FileStage

        if (!cwd || !path || index < 0) {
            console.error(`cwd: ${cwd}, path: ${path}, index: ${index}`)
            return ''
        }

        const stashGit = new StashGit()
        let contents: Promise<string> = Promise.resolve<string>('')

        try {
            if (type === FileNodeType.Added) {
                contents = stashGit.getStashContents(cwd, index, path)
            }
            else if (type === FileNodeType.Deleted) {
                contents = stashGit.getParentContents(cwd, index, path)
            }
            else if (type === FileNodeType.Modified) {
                contents = side === FileStage.Parent
                    ? stashGit.getParentContents(cwd, index, path)
                    : stashGit.getStashContents(cwd, index, path)
            }
            else if (type === FileNodeType.Renamed) {
                contents = side === FileStage.Parent
                    ? stashGit.getParentContents(cwd, index, oldPath)
                    : stashGit.getStashContents(cwd, index, path)
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            else if (type === FileNodeType.Untracked) {
                contents = stashGit.getThirdParentContents(cwd, index, path)
            }
            else {
                console.warn(`provideTextDocumentContent type[${params.type}] side[${side}]`)
                console.warn(uri.query)
            }
        }
        catch (e) {
            console.log(`provideTextDocumentContent type[${type}] side[${side}]`)
            console.log(uri.query)
            console.log(e)
        }

        return contents
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this.onDidChangeEmitter.event
    }

    public update(uri: vscode.Uri): void {
        this.onDidChangeEmitter.fire(uri)
    }
}
