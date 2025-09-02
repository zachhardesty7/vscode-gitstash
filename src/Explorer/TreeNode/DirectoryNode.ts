/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import * as path from 'path'
import FileNode from '../../StashNode/FileNode'
import TreeNode from './TreeNode'

export default class DirectoryNode extends TreeNode {
    constructor(
        public repositoryPath: string,
        public basePath: string,
        public dirName: string,
        public directories: DirectoryNode[],
        public files: FileNode[],
    ) {
        super()
    }

    /**
     * Gets the full path corresponding to this node.
     */
    public get path(): string {
        return path.normalize(
            `${this.repositoryPath}${path.sep}${this.basePath}${path.sep}${this.dirName}`,
        )
    }

    public get children(): (DirectoryNode | FileNode)[] {
        return [...this.directories, ...this.files]
    }

    public get id(): string {
        return `D.${this.path.replaceAll(/[^a-zA-Z0-9]/g, '-')}`
    }
}
