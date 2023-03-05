import { useContext, useEffect, useMemo, useState } from "react";
import {
  Configuration,
  SafeApi
} from '@refactor-labs-lit-protocol/api-client';

function useApi() {
  const config = useMemo(() => new Configuration({
    basePath: "http://localhost:8000",
  }), []);

  const safeApi = useMemo(() => new SafeApi(config), [config])

  return {
    safeApi
  };
}

export default useApi;
