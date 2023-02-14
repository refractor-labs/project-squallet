import { ipfs } from "@/utils/ipfs";
import { useState } from "react";

const defaultCode = `
const go = async () => {  
  // this requests a signature share from the Lit Node
  // the signature share will be automatically returned in the HTTP response from the node
  // all the params (message, publicKey, sigName) are passed in from the LitJsSdk.executeJs() function
  const sigShare = await Lit.Actions.ethPersonalSignMessageEcdsa({ message, publicKey , sigName });
};

go();
`
export default function Ipfs({onUpload}) {
  const [cid, setCid] = useState('');
  const [code, setCode] = useState(defaultCode);
  const onClickCreate = async () => {
    const { cid } = await ipfs.add(code)
    console.log(cid)
    setCid(cid.toString());
    onUpload(cid.toString());
  }

  return (
    <div>
      Ipfs
      <br />
      <textarea style={{width: '100%'}} rows={10} onChange={e => setCode(e.target.value)}>{code}</textarea>
      cid: {cid}<br />
      <button onClick={onClickCreate}>upload</button>
    </div>
  )
}
