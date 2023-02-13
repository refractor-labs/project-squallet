import { create } from "ipfs-http-client";
import { useState } from "react";

const projectId = "2LeRQnoqwGBEevYmOWyugMmDQRT";
const projectSecret = "6e5587db2185d495bed44d32fa2d35c5";
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);

const client = create({
  url: "https://ipfs.infura.io:5001",
  headers:{
    authorization
  }
})

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
    const { cid } = await client.add(code)
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
