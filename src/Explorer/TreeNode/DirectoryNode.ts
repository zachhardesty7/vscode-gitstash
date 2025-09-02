/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import * as path from 'path'
import FileNode from '../../StashNode/FileNode'
import TreeNode from './TreeNode'
import StashNode from '../../StashNode/StashNode'

export default class DirectoryNode extends TreeNode {
    constructor(
        protected _parent: StashNode,
        protected _basePath: string,
        protected _dirName: string,
        public directories: DirectoryNode[],
        public files: FileNode[],
    ) {
        super()
        this.makeId('d', _parent.hash, this.path)
    }

    public get dirName(): string {
        return this._dirName
    }

    /**
     * The full path corresponding to this node.
     */
    public get path(): string {
        return path.normalize(
            `${this._parent.parent.path}${path.sep}${this._basePath}${path.sep}${this._dirName}`,
        )
    }

    public get children(): (DirectoryNode | FileNode)[] {
        return [...this.directories, ...this.files]
    }
}
