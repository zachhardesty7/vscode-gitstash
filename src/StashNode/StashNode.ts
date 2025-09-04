/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import FileNode from './FileNode'
import Node from './Node'
import RepositoryNode from './RepositoryNode'

export default class StashNode extends Node {
    constructor(
        protected _index: number,
        protected _parent: RepositoryNode,
        protected _subject: string,
        protected _date: Date,
        protected _hash: string,
        protected _shortHash: string,
        protected _parentHashes: string[],
        protected _description: string,
        protected _branch?: string,
        protected _note?: string,
        protected _children?: FileNode[],
    ) {
        super()
        this.makeId('s', this.path, _shortHash)
    }

    /**
     * The node index.
     */
    public get index(): number {
        return this._index
    }

    /**
     * The node index with the stash@{N} format.
     */
    public get atIndex(): string {
        return `stash@{${this._index}}`
    }

    /**
     * The node parent index.
     */
    public get parent(): RepositoryNode {
        return this._parent
    }

    /**
     * The absolute path of the repository containing this stash.
     * `/path/to/repository`
     */
    public get path(): string {
        return this.parent.path
    }

    /**
     * The stash subject, commonly in the form of "On some_branch_name: This is the msg set"
     */
    public get subject(): string {
        return this._subject
    }

    /**
     * The stash generation date.
     */
    public get date(): Date {
        return this._date
    }

    /**
     * The stash hash.
     */
    public get hash(): string {
        return this._hash
    }

    /**
     * The stash abbreviated hash.
     */
    public get shortHash(): string {
        return this._shortHash
    }

    /**
     * The hashes of the parents.
     */
    public get parentHashes(): string[] {
        return this._parentHashes
    }

    /**
     * Basically what was defined as message.
     */
    public get description(): string {
        return this._description
    }

    /**
     * The node branch name.
     * This relies on the default git behavior (prepending the branch name in the
     * description). If a stash is manually created with `stash store - m msg` this
     * most probably will be undefined (unless manually prepending 'On branchname: msg').
     */
    public get branch(): string | undefined {
        return this._branch
    }

    /**
     * The stash note.
     */
    public get note(): string | undefined {
        return this._note
    }

    /**
     * The loaded children.
     */
    public get children(): FileNode[] | undefined {
        return this._children
    }

    /**
     * The children count if available.
     */
    public get childrenCount(): number | undefined {
        return this._children
            ? this._children.length
            : undefined
    }

    /**
     * Sets the node children.
     */
    public setChildren(children: FileNode[]): this {
        this._children = children
        return this
    }
}
