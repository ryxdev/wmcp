import { useEffect, useRef, useState } from "react";
import type { ModelContextTool } from "../webmcp";

function registerToolFn():
  | NonNullable<Document["modelContext"]>["registerTool"]
  | undefined {
  const fn = document.modelContext?.registerTool;
  return typeof fn === "function" ? fn : undefined;
}

/**
 * Register tools for the current view via `document.modelContext.registerTool`.
 * ChatGPT desktop often injects `modelContext` after first paint, so this hook
 * keeps polling while the view is mounted. Passes an AbortSignal and aborts
 * when the view unmounts. Does not touch `navigator.modelContext`.
 */
export function useViewTools(tools: readonly ModelContextTool[]): boolean {
  const toolsRef = useRef(tools);
  toolsRef.current = tools;
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let intervalId = 0;

    const registerAll = async (
      registerTool: NonNullable<ReturnType<typeof registerToolFn>>,
    ) => {
      for (const tool of toolsRef.current) {
        if (controller.signal.aborted) return;
        try {
          await registerTool.call(
            document.modelContext,
            {
              name: tool.name,
              title: tool.title,
              description: tool.description,
              inputSchema: tool.inputSchema,
              annotations: tool.annotations,
              execute: (input, options) => {
                if (options.signal.aborted) {
                  throw options.signal.reason ??
                    new DOMException("Aborted", "AbortError");
                }
                const current = toolsRef.current.find((t) => t.name === tool.name);
                if (!current) {
                  throw new Error("Tool is not registered for this view");
                }
                return current.execute(input, options);
              },
            },
            { signal: controller.signal },
          );
        } catch (err) {
          if (controller.signal.aborted) return;
          console.warn(`WebMCP registerTool(${tool.name}) failed`, err);
        }
      }
      if (!cancelled && !controller.signal.aborted) setRegistered(true);
    };

    const tryStart = (): boolean => {
      const registerTool = registerToolFn();
      if (!registerTool) return false;
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = 0;
      }
      void registerAll(registerTool);
      return true;
    };

    if (!tryStart()) {
      intervalId = window.setInterval(() => {
        if (controller.signal.aborted) {
          window.clearInterval(intervalId);
          intervalId = 0;
          return;
        }
        tryStart();
      }, 250);
    }

    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
      controller.abort();
      setRegistered(false);
    };
  }, []);

  return registered;
}
