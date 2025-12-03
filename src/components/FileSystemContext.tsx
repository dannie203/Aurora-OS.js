import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

export interface FileNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: FileNode[];
  permissions?: string;
  size?: number;
  modified?: Date;
}

// Efficient deep clone function for FileNode
function deepCloneFileNode(node: FileNode): FileNode {
  const cloned: FileNode = {
    name: node.name,
    type: node.type,
    content: node.content,
    permissions: node.permissions,
    size: node.size,
    modified: node.modified ? new Date(node.modified) : undefined,
  };

  if (node.children) {
    cloned.children = node.children.map(child => deepCloneFileNode(child));
  }

  return cloned;
}

// Efficient deep clone for entire file system
function deepCloneFileSystem(root: FileNode): FileNode {
  return deepCloneFileNode(root);
}

interface FileSystemContextType {
  fileSystem: FileNode;
  currentPath: string;
  setCurrentPath: (path: string) => void;
  getNodeAtPath: (path: string) => FileNode | null;
  createFile: (path: string, name: string, content?: string) => boolean;
  createDirectory: (path: string, name: string) => boolean;
  deleteNode: (path: string) => boolean;
  writeFile: (path: string, content: string) => boolean;
  readFile: (path: string) => string | null;
  listDirectory: (path: string) => FileNode[] | null;
  moveNode: (fromPath: string, toPath: string) => boolean;
}

const initialFileSystem: FileNode = {
  name: '/',
  type: 'directory',
  children: [
    {
      name: 'Users',
      type: 'directory',
      children: [
        {
          name: 'guest',
          type: 'directory',
          children: [
            {
              name: 'Documents',
              type: 'directory',
              children: [
                { name: 'README.txt', type: 'file', content: 'Welcome to the Desktop OS!\n\nThis is a fully functional desktop environment.', size: 72 },
                { name: 'Projects', type: 'directory', children: [] },
              ],
            },
            {
              name: 'Downloads',
              type: 'directory',
              children: [
                { name: 'example.pdf', type: 'file', content: 'Mock PDF content', size: 1024 },
              ],
            },
            {
              name: 'Pictures',
              type: 'directory',
              children: [
                { name: 'Vacation', type: 'directory', children: [] },
                { name: 'Screenshots', type: 'directory', children: [] },
              ],
            },
            {
              name: 'Music',
              type: 'directory',
              children: [
                { name: 'Playlists', type: 'directory', children: [] },
              ],
            },
            {
              name: 'Desktop',
              type: 'directory',
              children: [],
            },
          ],
        },
      ],
    },
    {
      name: 'Applications',
      type: 'directory',
      children: [
        { name: 'Finder.app', type: 'directory', children: [] },
        { name: 'Terminal.app', type: 'directory', children: [] },
        { name: 'Settings.app', type: 'directory', children: [] },
      ],
    },
    {
      name: 'System',
      type: 'directory',
      children: [
        { name: 'Library', type: 'directory', children: [] },
      ],
    },
  ],
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export function FileSystemProvider({ children }: { children: ReactNode }) {
  const [fileSystem, setFileSystem] = useState<FileNode>(initialFileSystem);
  const [currentPath, setCurrentPath] = useState('/Users/guest');

  const getNodeAtPath = useCallback((path: string): FileNode | null => {
    if (path === '/') return fileSystem;

    const parts = path.split('/').filter(p => p);
    let current: FileNode | null = fileSystem;

    for (const part of parts) {
      if (!current || current.type !== 'directory' || !current.children) {
        return null;
      }
      current = current.children.find(child => child.name === part) || null;
    }

    return current;
  }, [fileSystem]);

  const listDirectory = useCallback((path: string): FileNode[] | null => {
    const node = getNodeAtPath(path);
    if (!node || node.type !== 'directory') return null;
    return node.children || [];
  }, [getNodeAtPath]);

  const readFile = useCallback((path: string): string | null => {
    const node = getNodeAtPath(path);
    if (!node || node.type !== 'file') return null;
    return node.content || '';
  }, [getNodeAtPath]);

  const deleteNode = useCallback((path: string): boolean => {
    if (path === '/') return false;

    const parts = path.split('/').filter(p => p);
    const name = parts.pop();
    if (!name) return false;

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      let parent = newFS;

      for (const part of parts) {
        if (parent.children) {
          parent = parent.children.find((child: FileNode) => child.name === part)!;
        }
      }

      if (parent && parent.children) {
        parent.children = parent.children.filter((child: FileNode) => child.name !== name);
      }

      return newFS;
    });

    return true;
  }, []);

  const moveNode = useCallback((fromPath: string, toPath: string): boolean => {
    const node = getNodeAtPath(fromPath);
    if (!node) return false;

    const success = deleteNode(fromPath);
    if (!success) return false;

    // This is simplified - in reality would need to add to new location
    return true;
  }, [getNodeAtPath, deleteNode]);

  const createFile = useCallback((path: string, name: string, content: string = ''): boolean => {
    const node = getNodeAtPath(path);
    if (!node || node.type !== 'directory') return false;

    const newFile: FileNode = {
      name,
      type: 'file',
      content,
      size: content.length,
      modified: new Date(),
    };

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = path.split('/').filter(p => p);
      let current = newFS;

      for (const part of parts) {
        if (current.children) {
          current = current.children.find(child => child.name === part)!;
        }
      }

      if (current && current.children) {
        current.children.push(newFile);
      }
      return newFS;
    });

    return true;
  }, [getNodeAtPath]);

  const createDirectory = useCallback((path: string, name: string): boolean => {
    const node = getNodeAtPath(path);
    if (!node || node.type !== 'directory') return false;

    const newDir: FileNode = {
      name,
      type: 'directory',
      children: [],
      modified: new Date(),
    };

    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = path.split('/').filter(p => p);
      let current = newFS;

      for (const part of parts) {
        if (current.children) {
          current = current.children.find((child: FileNode) => child.name === part)!;
        }
      }

      if (current && current.children) {
        current.children.push(newDir);
      }

      return newFS;
    });

    return true;
  }, [getNodeAtPath]);

  const writeFile = useCallback((path: string, content: string): boolean => {
    setFileSystem(prevFS => {
      const newFS = deepCloneFileSystem(prevFS);
      const parts = path.split('/').filter(p => p);
      let current = newFS;

      for (let i = 0; i < parts.length - 1; i++) {
        if (current.children) {
          current = current.children.find((child: FileNode) => child.name === parts[i])!;
        }
      }

      if (current && current.children) {
        const file = current.children.find((child: FileNode) => child.name === parts[parts.length - 1]);
        if (file && file.type === 'file') {
          file.content = content;
          file.size = content.length;
          file.modified = new Date();
        }
      }

      return newFS;
    });

    return true;
  }, []);


  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
        currentPath,
        setCurrentPath,
        getNodeAtPath,
        createFile,
        createDirectory,
        deleteNode,
        writeFile,
        readFile,
        listDirectory,
        moveNode,
      }}
    >
      {children}
    </FileSystemContext.Provider>
  );
}

export function useFileSystem() {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within FileSystemProvider');
  }
  return context;
}
