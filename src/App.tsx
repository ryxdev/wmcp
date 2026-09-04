import { useCallback, useState } from "react";
import { usePath } from "./hooks/usePath";
import { isStatusPath } from "./lib/routes";
import { loadDesk, saveDesk, type DeskState } from "./lib/session";
import { OpsStatusView } from "./ops/OpsStatusView";
import { OpsView } from "./ops/OpsView";
import { isOpsPath, isOpsStatusPath } from "./ops/paths";
import { loadOpsDesk, saveOpsDesk, type OpsDeskState } from "./ops/session";
import { DumpView } from "./views/DumpView";
import { StatusView } from "./views/StatusView";

export function App() {
  const [path, navigate] = usePath();
  const [state, setStateRaw] = useState<DeskState>(loadDesk);
  const [opsState, setOpsStateRaw] = useState<OpsDeskState>(loadOpsDesk);

  const setState = useCallback((updater: (prev: DeskState) => DeskState) => {
    setStateRaw((prev) => {
      const next = updater(prev);
      saveDesk(next);
      return next;
    });
  }, []);

  const setOpsState = useCallback((updater: (prev: OpsDeskState) => OpsDeskState) => {
    setOpsStateRaw((prev) => {
      const next = updater(prev);
      saveOpsDesk(next);
      return next;
    });
  }, []);

  if (isOpsStatusPath(path)) {
    return <OpsStatusView state={opsState} navigate={navigate} />;
  }
  if (isOpsPath(path)) {
    return <OpsView state={opsState} setState={setOpsState} navigate={navigate} />;
  }

  const onStatus = isStatusPath(path);

  return onStatus ? (
    <StatusView state={state} navigate={navigate} />
  ) : (
    <DumpView state={state} setState={setState} navigate={navigate} />
  );
}
