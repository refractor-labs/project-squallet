import useApi from "@/hooks/useApi";
import { TransactionDetailed } from "@refactor-labs-lit-protocol/api-client";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import Transaction from "./transaction";

function Transactions ( ) {
  const [transactions, setTransactions] = useState<TransactionDetailed[] | null>(null);

  const router = useRouter();
  const { safeApi } = useApi();
  const safe = router.query.safe as string;

  const loadData = useCallback(() => {
    if (!safe || !safeApi) {
      return
    }
    safeApi.getTransactions(safe).then(r => setTransactions(r.data));
  }, [safeApi, safe]);

  useEffect(() => loadData(), [loadData])

  if (!transactions) {
    return null
  }

  return (
    <div className="divide-y">
      {
        transactions.map(t => <Transaction key={t.id} transaction={t} onUpdate={loadData} />)
      }
    </div>
  )
}

export default Transactions;
