import { editor } from 'monaco-editor/esm/vs/editor/editor.api';

export const CODE_FIELD_DEFAULT_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  theme: 'vs-dark',
  padding: {
    top: 24,
    bottom: 24
  },
  roundedSelection: true,
  autoIndent: 'full',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  minimap: {
    enabled: false
  },
  tabSize: 2,
  scrollbar: {
    alwaysConsumeMouseWheel: false,
  },
  renderWhitespace: 'all'
};
