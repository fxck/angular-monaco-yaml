/* eslint-disable @typescript-eslint/no-explicit-any */
export interface MonacoEditorModel {
  value?: string;
  language?: string;
  fileName?: string;
}

export interface MonacoConfig {
  baseUrl?: string;
  requireConfig?: { [key: string]: any; };
  defaultOptions?: { [key: string]: any; };
  monacoRequire?: () => any;
  onMonacoLoad?: () => any;
}
