import { ethers } from 'ethers'
import { useState } from 'react'

const SignMsg = () => {
  const [message, setMessage] = useState<string>('')
  const [signature, setSignature] = useState<string>('')
  const sign = async () => {
    // @ts-ignore
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    setSignature(await signer.signMessage(message))
  }
  return (
    <div className="max-w-xl border p-4 m-4 mx-auto flex flex-col gap-10">
      <textarea
        className="input input-bordered"
        onChange={e => setMessage(e.target.value)}
      ></textarea>
      <button className="btn" onClick={sign}>
        Sign
      </button>
      <p>{signature}</p>
    </div>
  )
}
export default SignMsg
