import { useCallback, useRef, useEffect } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Box } from '@mui/material';
import { useTopologyStore } from '../lib/store';
import { exportToYaml } from '../lib/converter';

let editorInstance: editor.IStandaloneCodeEditor | null = null;

export function getEditorContent(): string {
  return editorInstance?.getValue() || '';
}

export function jumpToNodeInEditor(nodeName: string): void {
  if (!editorInstance) return;

  const content = editorInstance.getValue();
  const lines = content.split('\n');
  let inNodesSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*nodes:\s*$/.test(line)) {
      inNodesSection = true;
      continue;
    }
    if (inNodesSection && /^[a-zA-Z]/.test(line) && !line.startsWith(' ')) {
      inNodesSection = false;
    }
    if (inNodesSection && line.includes(`name: ${nodeName}`)) {
      editorInstance.revealLineInCenter(i + 1);
      editorInstance.setPosition({ lineNumber: i + 1, column: line.length + 1 });
      return;
    }
  }
}

export function jumpToSimNodeInEditor(simNodeName: string): void {
  if (!editorInstance) return;

  const content = editorInstance.getValue();
  const lines = content.split('\n');
  let inSimNodesSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*simNodes:\s*$/.test(line)) {
      inSimNodesSection = true;
      continue;
    }
    if (inSimNodesSection && /^[a-zA-Z]/.test(line) && !line.startsWith(' ')) {
      inSimNodesSection = false;
    }
    if (inSimNodesSection && line.includes(`name: ${simNodeName}`)) {
      editorInstance.revealLineInCenter(i + 1);
      editorInstance.setPosition({ lineNumber: i + 1, column: line.length + 1 });
      return;
    }
  }
}

export function jumpToLinkInEditor(sourceNode: string, targetNode: string): void {
  if (!editorInstance) return;

  const content = editorInstance.getValue();
  const lines = content.split('\n');

  let linksStart = -1;
  let linksIndent = 0;
  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(/^(\s*)links:\s*$/);
    if (match) {
      linksStart = i;
      linksIndent = match[1].length;
      break;
    }
  }

  if (linksStart === -1) return;

  const listItemIndent = linksIndent + 2;
  const linkStanzas: { start: number; end: number; content: string }[] = [];
  let currentStart = -1;

  for (let i = linksStart + 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;

    if (trimmed.length > 0 && indent <= linksIndent && !trimmed.startsWith('-')) {
      if (currentStart !== -1) {
        linkStanzas.push({ start: currentStart, end: i - 1, content: lines.slice(currentStart, i).join('\n') });
      }
      break;
    }

    if (trimmed.startsWith('- ') && indent === listItemIndent) {
      if (currentStart !== -1) {
        linkStanzas.push({ start: currentStart, end: i - 1, content: lines.slice(currentStart, i).join('\n') });
      }
      currentStart = i;
    }
  }

  if (currentStart !== -1) {
    linkStanzas.push({ start: currentStart, end: lines.length - 1, content: lines.slice(currentStart).join('\n') });
  }

  for (const stanza of linkStanzas) {
    const isRegularLink = stanza.content.includes(`node: ${sourceNode}`) && stanza.content.includes(`node: ${targetNode}`);
    const isSimLink = stanza.content.includes(`node: ${sourceNode}`) && stanza.content.includes(`simNode: ${targetNode}`);

    if (isRegularLink || isSimLink) {
      editorInstance.revealLineInCenter(stanza.start + 1);
      editorInstance.setSelection({
        startLineNumber: stanza.start + 1,
        startColumn: 1,
        endLineNumber: stanza.end + 1,
        endColumn: lines[stanza.end].length + 1,
      });
      return;
    }
  }
}

export default function YamlEditor() {
  const {
    topologyName, namespace, operation, nodes, edges,
    nodeTemplates, linkTemplates, simulation,
    importFromYaml, yamlRefreshCounter, darkMode,
  } = useTopologyStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const getYamlFromState = () => exportToYaml({
    topologyName, namespace, operation, nodes, edges, nodeTemplates, linkTemplates, simulation,
  });

  useEffect(() => {
    if (yamlRefreshCounter > 0 && editorRef.current) {
      isRefreshingRef.current = true;
      editorRef.current.setValue(getYamlFromState());
      setTimeout(() => { isRefreshingRef.current = false; }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yamlRefreshCounter]);

  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
    editorInstance = editor;
  };

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined || isRefreshingRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => importFromYaml(value), 500);
  }, [importFromYaml]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          language="yaml"
          theme={darkMode ? 'vs-dark' : 'light'}
          defaultValue={getYamlFromState()}
          onMount={handleEditorMount}
          onChange={handleEditorChange}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            folding: true,
            renderLineHighlight: 'all',
            tabSize: 2,
            scrollbar: { verticalScrollbarSize: 10, horizontalScrollbarSize: 10 },
          }}
        />
      </Box>
    </Box>
  );
}
