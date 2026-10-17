'use client';

import { useMemo, useState } from 'react';

interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
}

function buildTree(paths: string[]): FileNode[] {
  const root: FileNode[] = [];
  for (const path of paths) {
    const parts = path.split('/');
    let level = root;
    let current = '';
    parts.forEach((part, index) => {
      current = current ? `${current}/${part}` : part;
      const isLeaf = index === parts.length - 1;
      let node = level.find((candidate) => candidate.name === part && (candidate.children !== undefined) === !isLeaf);
      if (!node) {
        node = isLeaf
          ? { name: part, path: current }
          : { name: part, path: current, children: [] };
        level.push(node);
      }
      if (!isLeaf && node.children) level = node.children;
    });
  }
  const sortNodes = (nodes: FileNode[]): FileNode[] => {
    nodes.sort((a, b) => {
      const aDir = a.children !== undefined ? 0 : 1;
      const bDir = b.children !== undefined ? 0 : 1;
      return aDir - bDir || a.name.localeCompare(b.name);
    });
    nodes.forEach((node) => node.children && sortNodes(node.children));
    return nodes;
  };
  return sortNodes(root);
}

export function FileTree({
  files,
  activePath,
  onSelect,
  query,
}: {
  files: { path: string }[];
  activePath: string;
  onSelect: (path: string) => void;
  query: string;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const visiblePaths = useMemo(() => {
    const all = files.map((file) => file.path);
    if (!query.trim()) return all;
    const needle = query.trim().toLowerCase();
    return all.filter((path) => path.toLowerCase().includes(needle));
  }, [files, query]);

  const tree = useMemo(() => buildTree(visiblePaths), [visiblePaths]);

  const toggle = (path: string) => {
    setCollapsed((current) => {
      const next = new Set(current);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const renderNodes = (nodes: FileNode[], depth: number): React.ReactNode =>
    nodes.map((node) => {
      const isDir = node.children !== undefined;
      const isCollapsed = collapsed.has(node.path);
      return (
        <div key={node.path}>
          {isDir ? (
            <button
              type="button"
              onClick={() => toggle(node.path)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center gap-1.5 rounded-md py-1 pr-2 text-left text-xs hover:bg-white/5"
              style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
              <span aria-hidden="true" className="text-[var(--gris-neblina)]">
                {isCollapsed ? '▸' : '▾'}
              </span>
              <span className="text-[var(--gris-neblina)]">{node.name}/</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onSelect(node.path)}
              aria-current={activePath === node.path}
              className={`flex w-full items-center rounded-md py-1 pr-2 text-left text-xs transition-colors ${
                activePath === node.path
                  ? 'bg-[var(--azul-electrico)]/25 text-[var(--cian-suave)]'
                  : 'text-[var(--blanco-hielo)]/80 hover:bg-white/5'
              }`}
              style={{ paddingLeft: `${depth * 12 + 24}px` }}
            >
              <span className="mono truncate">{node.name}</span>
            </button>
          )}
          {isDir && !isCollapsed ? renderNodes(node.children!, depth + 1) : null}
        </div>
      );
    });

  return (
    <nav aria-label="Archivos del proyecto" className="thin-scroll overflow-auto">
      {tree.length === 0 ? (
        <p className="p-3 text-xs text-[var(--gris-neblina)]">Sin coincidencias.</p>
      ) : (
        renderNodes(tree, 0)
      )}
    </nav>
  );
}
