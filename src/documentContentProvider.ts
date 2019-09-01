'use strict';

import * as vscode from 'vscode';
import StashGit, { FileStage } from './StashGit';
import { URLSearchParams } from 'url';
import { NodeType } from './StashNode';

export class DocumentContentProvider implements vscode.TextDocumentContentProvider {
    private _onDidChange = new vscode.EventEmitter<vscode.Uri>();

    public async provideTextDocumentContent(uri: vscode.Uri): Promise<string> {
        const params = new URLSearchParams(uri.query);

        const cwd = params.get('cwd');
        const index = parseInt(params.get('index'), 10);
        const path = params.get('path');
        const oldPath = params.get('oldPath');
        const type = params.get('type');
        const side = params.get('side');

        const stashGit = new StashGit();
        let contents: Promise<any>;

        try {
            if (type === NodeType.Deleted) {
                contents = stashGit.getParentContents(cwd, index, path);
            }
            else if (type === NodeType.IndexAdded) {
                contents = stashGit.getStashContents(cwd, index, path);
            }
            else if (type === NodeType.Modified) {
                contents = side === FileStage.Parent
                    ? stashGit.getParentContents(cwd, index, path)
                    : stashGit.getStashContents(cwd, index, path);
            }
            else if (type === NodeType.Renamed) {
                contents = side === FileStage.Parent
                    ? stashGit.getParentContents(cwd, index, oldPath)
                    : stashGit.getStashContents(cwd, index, path);
            }
            else if (type === NodeType.Untracked) {
                contents = stashGit.getThirdParentContents(cwd, index, path);
            }
        } catch (e) {
            console.log(e);
        }
        console.log(`provideTextDocumentContent type[${type}] side[${side}]`);
        console.log(uri.query);

        return (await contents).toString();
    }

    get onDidChange(): vscode.Event<vscode.Uri> {
        return this._onDidChange.event;
    }

    public update(uri: vscode.Uri) {
        this._onDidChange.fire(uri);
    }
}
