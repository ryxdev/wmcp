/**
 * Minimal typings for the WebMCP imperative API
 * (https://webmachinelearning.github.io/webmcp/).
 *
 * Feature-detect only `document.modelContext?.registerTool`.
 * Do not use `navigator.modelContext`.
 */

export interface ToolAnnotations {
  readOnlyHint?: boolean;
  untrustedContentHint?: boolean;
}

export interface ToolExecuteCallbackOptions {
  signal: AbortSignal;
}

export type ToolExecuteCallback = (
  inputObject: Record<string, unknown>,
  options: ToolExecuteCallbackOptions,
) => Promise<unknown> | unknown;

export interface ModelContextTool {
  name: string;
  title?: string;
  description: string;
  inputSchema?: object;
  execute: ToolExecuteCallback;
  annotations?: ToolAnnotations;
}

export interface ModelContextRegisterToolOptions {
  signal?: AbortSignal;
  exposedTo?: string[];
}

export interface ModelContext extends EventTarget {
  registerTool(
    tool: ModelContextTool,
    options?: ModelContextRegisterToolOptions,
  ): Promise<void>;
}

declare global {
  interface Document {
    modelContext?: ModelContext;
  }
}

export {};
