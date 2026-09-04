import { useCallback, useEffect, useState } from "react";

function currentPath(): string {
  return window.location.pathname;
}

export function usePath(): [string, (next: string) => void] {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onPop = () => setPath(currentPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = useCallback((next: string) => {
    if (currentPath() === next) {
      setPath(next);
      return;
    }
    window.history.pushState({}, "", next);
    setPath(next);
  }, []);

  return [path, navigate];
}
