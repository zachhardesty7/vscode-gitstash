/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as tmp from 'tmp'
import DirectoryNode from './Explorer/TreeNode/DirectoryNode'
import FileNode from './StashNode/FileNode'
import { FileStage } from './Git/GitStash'
import NodeContainer from './StashNode/NodeContainer'
import { Uri } from 'vscode'

export interface GitUriParams {
    path: string
    ref: string
    submoduleOf?: string
}

export interface GitUriOptions {
    scheme?: string
    replaceFileExtension?: boolean
    submoduleOf?: string
}

/**
 * copied from [VSCode's git
 * extension](https://github.com/microsoft/vscode/blob/5a569e3461c842f836e0dd003ea4203c60464be2/extensions/git/src/uri.ts#L32-L51)
 *
 * can't use directly via `vscode.extensions.getExtension<GitExtension>('vscode.git')`
 * because [the exported API is missing the 3rd
 * param](https://github.com/microsoft/vscode/blob/5a569e3461c842f836e0dd003ea4203c60464be2/extensions/git/src/api/api1.ts#L401-L403)
 */
export function toGitUri(uri: Uri, ref: string, options: GitUriOptions = {}): Uri {
    const params: GitUriParams = {
        path: uri.fsPath,
        ref,
    }

    if (options.submoduleOf) {
        params.submoduleOf = options.submoduleOf
    }

    let { path } = uri

    if (options.replaceFileExtension) {
        path = `${path}.git`
    }
    else if (options.submoduleOf) {
        path = `${path}.diff`
    }

    return uri.with({
        scheme: options.scheme ?? 'git',
        path,
        query: JSON.stringify(params),
    })
}

export default class UriGenerator {
    public static readonly fileScheme = 'git-stash-file-content'
    private readonly supportedBinaryFiles = [
        '.bmp',
        '.gif',
        '.jpe',
        '.jpg',
        '.jpeg',
        '.png',
        '.webp',
    ]

    constructor(
        private nodeContainer: NodeContainer,
    ) {
        tmp.setGracefulCleanup()
    }

    /**
     * Creates a node Uri to be used on Tree items.
     *
     * @param node  the node to be used as base for the URI
     */
    public createForTreeItem(node: FileNode): Uri {
        return Uri.parse(`${UriGenerator.fileScheme}:${node.path}?type=${node.type}&t=${new Date().getTime()}`)
    }

    public createForDirectory(node: DirectoryNode): Uri {
        return Uri.parse(`file:${node.path}`)
    }

    /**
     * Creates a node Uri to be used on Tree items using a node path.
     */
    public createForNodePath(fileNode: FileNode): Uri | undefined {
        const currentPath = fileNode.isRenamed
            ? fileNode.oldPath! // eslint-disable-line @typescript-eslint/no-non-null-assertion
            : fileNode.path

        return fs.existsSync(currentPath) ? Uri.file(currentPath) : undefined
    }

    /**
     * Creates a node Uri to be used on the diff view.
     *
     * @param node  the node to be used as base for the URI
     * @param stage the file stash stage
     */
    public async createForDiff(node: FileNode, stage?: FileStage): Promise<Uri> {
        if (this.supportedBinaryFiles.includes(path.extname(node.fileName))) {
            return Uri.file(
                this.createTmpFile(
                    await this.nodeContainer.getFileContents(node, stage),
                    node.relativePath,
                ).name,
            )
        }

        return this.generateUri(node, stage)
    }

    /**
     * Generates an Uri representing the stash file.
     *
     * @param node the node to be used as base for the URI
     * @param side the editor side
     */
    private generateUri(node: FileNode, side?: string): Uri {
        const timestamp = new Date().getTime()

        const query = `cwd=${encodeURIComponent(node.parent.path)}`
            + `&index=${node.parent.index}`
            + `&path=${encodeURIComponent(node.relativePath)}`
            + `&oldPath=${encodeURIComponent(node.oldRelativePath ?? '')}`
            + `&type=${node.type}`
            + `&side=${side ?? ''}`
            + `&t=${timestamp}`

        return Uri.parse(`${UriGenerator.fileScheme}://${node.path}?${query}`)
    }

    /**
     * Generates a tmp file with the given content.
     *
     * @param content  the string with the content
     * @param filename the string with the filename
     */
    private createTmpFile(content: string, filename: string): tmp.FileResult {
        const file = tmp.fileSync({
            prefix: 'vsx-gitstash-',
            postfix: path.extname(filename),
        })

        fs.writeFileSync(file.name, content)

        return file
    }
}
