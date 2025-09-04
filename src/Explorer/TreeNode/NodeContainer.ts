/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import BaseNodeContainer from '../../StashNode/NodeContainer'
import DirectoryNode from './DirectoryNode'
import FileNode from '../../StashNode/FileNode'
import MessageNode from './MessageNode'
import Node from '../../StashNode/Node'
import NodeFactory from './NodeFactory'
import StashNode from '../../StashNode/StashNode'
import WorkspaceGit from '../../Git/WorkspaceGit'

/**
 * A repository implementation using another name to avoid confusion with git repos.
 */
export default class NodeContainer extends BaseNodeContainer {
    protected nodeFactory: NodeFactory

    constructor(workspaceGit: WorkspaceGit) {
        super(workspaceGit)
        this.nodeFactory = new NodeFactory()
    }

    /**
    * Creates a directory node.
    */
    public makeDirectoryNodes(parent: StashNode, files: FileNode[]): (DirectoryNode | FileNode)[] {
        return this.nodeFactory.createDirectoryNodes(parent, files)
    }

    /**
     * Creates a message node.
     */
    public makeMessageNode(message: string, parent?: Node): MessageNode {
        return this.nodeFactory.createMessageNode(message, parent)
    }
}
