'use client';

import { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

function extensionFor(path: string) {
  if (path.endsWith('.tsx') || path.endsWith('.ts')) return javascript({ typescript: true, jsx: true });
  if (path.endsWith('.js') || path.endsWith('.mjs') || path.endsWith('.cjs')) return javascript();
  if (path.endsWith('.html')) return html();
  if (path.endsWith('.css')) return css();
  if (path.endsWith('.json')) return json();
  if (path.endsWith('.md')) return markdown();
  return [];
}

export function CodeViewer({ path, content }: { path: string; content: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="code-surface flex h-full min-h-[420px] flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-2.5">
        <p className="mono truncate text-xs text-[var(--cian-suave)]">{path}</p>
        <div className="flex items-center gap-2">
          <span aria-live="polite" className="text-xs text-[var(--verde-exito)]">
            {copied ? 'Copiado' : ''}
          </span>
          <button type="button" className="btn-ghost !px-3 !py-1.5 text-xs" onClick={copy}>
            Copiar código
          </button>
        </div>
      </div>
      <div className="thin-scroll flex-1 overflow-auto">
        <CodeMirror
          value={content}
          height="100%"
          theme={oneDark}
          extensions={[extensionFor(path)]}
          readOnly
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            highlightActiveLine: true,
            searchKeymap: true,
          }}
        />
      </div>
    </div>
  );
}
