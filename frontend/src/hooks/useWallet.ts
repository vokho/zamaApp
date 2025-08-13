import { useState, useEffect } from "react";
import { ethers } from "ethers";

export function useWallet() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string>("");

  const connect = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setProvider(provider);
      setSigner(signer);
      setAddress(await signer.getAddress());
    } else {
      alert("Install MetaMask!");
    }
  };

  return { provider, signer, address, connect };
}
