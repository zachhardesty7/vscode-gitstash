/*
 * Copyright (c) Arturo Rodríguez V.
 * GPL-3.0-only. See LICENSE.md in the project root for license details.
 */

import * as path from 'path'
import BaseNodeContainer from '../../StashNode/NodeContainer'
import DirectoryNode from './DirectoryNode'
import FileNode from '../../StashNode/FileNode'
import MessageNode from './MessageNode'
import Node from '../../StashNode/Node'
import StashNode from '../../StashNode/StashNode'

/**
 * A repository implementation using another name to avoid confusion with git repos.
 */
export default class NodeContainer extends BaseNodeContainer {
    /**
    * getDirectoryNode
    */
    public makeDirectoryNode(parent: StashNode, files: FileNode[]): DirectoryNode {
        const baseDirNode: DirectoryNode = new DirectoryNode(
            parent, '', parent.parent.dirName, [], [],
        )

        files.forEach((fileNode) => {
            let dirNode = baseDirNode
            const segments = fileNode.relativePath.split(path.sep)

            if (segments.length === 1) {
                dirNode.files.push(fileNode)
            }
            else {
                for (let i = 0; i < segments.length; i += 1) {
                    if (i < segments.length - 1) {
                        const basePath = segments.slice(0, i).join(path.sep)
                        const segment = segments[i]

                        const subDir: DirectoryNode = dirNode.directories
                            .find((subDir) => subDir.dirName === segment)
                            ?? new DirectoryNode(parent, basePath, segment, [], [])

                        dirNode.directories.push(subDir)
                        dirNode = subDir
                    }
                    else {
                        dirNode.files.push(fileNode)
                    }
                }
            }
        })

        return baseDirNode
    }

    /**
     * Creates a message node.
     */
    public makeMessageNode(message: string, parent?: Node): MessageNode {
        return new MessageNode(message, parent)
    }
}
