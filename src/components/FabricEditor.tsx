import { useCallback, useRef } from 'react';
import Editor, { type OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { Box } from '@mui/material';

import { useTopologyStore } from '../lib/store';

const PLACEHOLDER = `# Define your fabric topology
leafs:
  count: 4
  template: leaf
spines:
  count: 2
  template: spine
# superspines:        # optional
#   count: 2
#   template: superspine
`;

export default function FabricEditor() {
  const { fabricYaml, setFabricYaml, applyFabricYaml } = useTopologyStore();

  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEditorMount: OnMount = (editorInst, monaco) => {
    const themeName = 'ntwfui-dark';
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    monaco.editor.defineTheme(themeName, {
      base: 'vs-dark',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': '#1A222E',
        'editorGutter.background': '#1A222E',
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    monaco.editor.setTheme(themeName);
    editorRef.current = editorInst;
  };

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value === undefined) return;

    setFabricYaml(value);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      applyFabricYaml();
    }, 500);
  }, [setFabricYaml, applyFabricYaml]);

  return (
    <Box data-testid="fabric-editor" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ flex: 1 }}>
        <Editor
          height="100%"
          language="yaml"
          theme="ntwfui-dark"
          defaultValue={fabricYaml || PLACEHOLDER}
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
