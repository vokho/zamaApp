import { useState } from "react";
import { ethers, type JsonFragment } from "ethers";
import {
  initSDK,
  createInstance,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/bundle";

import "./App.css";
import PortfolioForm from "./PortfolioForm.tsx";
import SwapForm from "./SwapForm.tsx";
import { FaXTwitter, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa6";

import FHETokenVOKABI from "../../backend/artifacts/contracts/FHETokenVOK.sol/FHETokenVOK.json";
import FHETokenKHOABI from "../../backend/artifacts/contracts/FHETokenKHO.sol/FHETokenKHO.json";

import FHETokenSwapHistoryABI from "../../backend/artifacts/contracts/FHETokenSwapHistory.sol/FHETokenSwapHistory.json";

import TokenSwapABI from "../../backend/artifacts/contracts/TokenSwap.sol/TokenSwap.json";

const fheTokenVOKAddress = "0xf2ae56F330F2837E7f3B62188848123fD6972b12";
const fheTokenVOKABI = FHETokenVOKABI.abi;

const fheTokenKHOAddress = "0x3923b8e9Aa15c2b74F9139c7fB50a6EeFAb653ba";
const fheTokenKHOABI = FHETokenKHOABI.abi;

const fheTokenSwapHistoryAddress = "0xC5629555a00588a65d3d0753558A1b964c72fE8c";
const fheTokenSwapHistoryABI = FHETokenSwapHistoryABI.abi;

const tokenSwapAddress = "0xD996B7565990eD0C928341F860E007bf4b8A8878";
const tokenSwapABI = TokenSwapABI.abi;

/*const USDT_CONTRACT_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];*/

type Tab = {
  id: string;
  label: string;
};

const tabs: Tab[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "swap", label: "Swap" },
];

export interface Token {
  id: string;
  symbol: string;
  rate: number;
  balance: string;
  tokenAddress: string;
  tokenContractABI: JsonFragment[];
}

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("portfolio");

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [vokBalance, setVOKBalance] = useState("");
  const [khoBalance, setKHOBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const tokens: Token[] = [
    {
      id: "vok",
      symbol: "VOK",
      rate: 2.5,
      balance: vokBalance,
      tokenAddress: "0xf2ae56F330F2837E7f3B62188848123fD6972b12",
      tokenContractABI: FHETokenVOKABI.abi,
    },
    {
      id: "kho",
      symbol: "KHO",
      rate: 5,
      balance: khoBalance,
      tokenAddress: "0x3923b8e9Aa15c2b74F9139c7fB50a6EeFAb653ba",
      tokenContractABI: FHETokenKHOABI.abi,
    },
    {
      id: "jen",
      symbol: "JEN",
      rate: 0,
      balance: "0.053",
      tokenAddress: "",
      tokenContractABI: [],
    },
    {
      id: "ale",
      symbol: "ALE",
      rate: 0,
      balance: "0.19",
      tokenAddress: "",
      tokenContractABI: [],
    },
    {
      id: "hon",
      symbol: "HON",
      rate: 0,
      balance: "0.0004",
      tokenAddress: "",
      tokenContractABI: [],
    },
  ];

  const header = () => {
    return (
      <header className="header">
        <div className="logo">FHE Swap</div>
        <nav className="tabs">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => handleTabClick(tab.id)}
            >
              {tab.label}
            </div>
          ))}
        </nav>
        <div className="address">{walletAddress ? walletAddress : ""}</div>
        <div className="wallet">
          <button
            onClick={!walletAddress ? connectWallet : disconnectWallet}
            disabled={isLoading}
            className="connect"
          >
            {isLoading
              ? "Loading..."
              : walletAddress
              ? "Disconnect Wallet"
              : "Connect Wallet"}
          </button>
        </div>
      </header>
    );
  };

  const footer = () => {
    return (
      <footer className="footer">
        <div>
          <p>@ 2025</p>
          <p>All rights reserved</p>
        </div>
        <div>
          <a
            href="https://x.com/Kadrann_nl"
            target="_blank"
            rel="noopener noreferrer"
            className="x-icon-link"
          >
            <FaXTwitter size={24} />
          </a>
          <a
            href="https://x.com/Kadrann_nl"
            target="_blank"
            rel="noopener noreferrer"
            className="x-icon-link"
          >
            <FaYoutube size={24} />
          </a>
          <a
            href="https://x.com/Kadrann_nl"
            target="_blank"
            rel="noopener noreferrer"
            className="x-icon-link"
          >
            <FaDiscord size={24} />
          </a>
          <a
            href="https://x.com/Kadrann_nl"
            target="_blank"
            rel="noopener noreferrer"
            className="x-icon-link"
          >
            <FaInstagram size={24} />
          </a>
        </div>
      </footer>
    );
  };

  const tabForm = () => {
    if (walletAddress == "" || walletAddress == null) {
      return (
        <div className="center">
          <h3>Connect your wallet</h3>
        </div>
      );
    }
    switch (activeTab) {
      case "portfolio":
        return <PortfolioForm tokens={tokens} onHandleFaucet={handleFaucet} />;
      case "swap":
        return (
          <SwapForm
            tokens={tokens}
            vokBalance={vokBalance}
            khoBalance={khoBalance}
            onHandleSwap={handleSwap}
          />
        );
      default:
        return null;
    }
  };

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  const disconnectWallet = () => {
    if (walletAddress) {
      setWalletAddress("");
    }
  };
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Install MetaMask!");
      return;
    }

    setIsLoading(true);

    try {
      // First, try to switch to Sepolia
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }],
      });

      // Wait a moment for the switch to complete
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // 1. Connect Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      setProvider(provider);

      const signer = await provider.getSigner();
      setSigner(signer);

      const address = await signer.getAddress();
      setWalletAddress(address);

      // Check current network
      const network = await provider.getNetwork();
      console.log("Network:", network.name, network.chainId);

      // For Sepolia testnet (chainId 11155111)
      if (network.chainId !== 11155111n) {
        console.error("Wrong network! Switch to Sepolia " + network.chainId);
      }

      // 2. Get VOK balance
      const fheTokenVOKContract = new ethers.Contract(
        fheTokenVOKAddress,
        fheTokenVOKABI,
        provider
      );

      const balanceVOK = await fheTokenVOKContract.balanceOf(address);
      const formattedVOK = ethers.formatUnits(balanceVOK, 18);
      setVOKBalance(formattedVOK);

      // Create FHEVM instance
      /*await initSDK({});

      const instance = await createInstance({
        ...SepoliaConfig,
      });

      const encryptedWalletAddress = await instance
        .createEncryptedInput(fheTokenVOKAddress, address)
        .addAddress(address)
        .encrypt();

      const encryptedWalletBalance = await instance
        .createEncryptedInput(fheTokenVOKAddress, address)
        .add128(balanceVOK)
        .encrypt();


      const tx: ethers.TransactionResponse =
        await fheTokenVOKContract.setEncryptedBalance(
          encryptedWalletAddress.handles[0],
          encryptedWalletBalance.handles[0],
          encryptedWalletBalance.inputProof
        );
      await tx.wait();

      const newEncryptedWalletBalance =
        await fheTokenVOKContract.getEncryptedBalance(
          encryptedWalletAddress.handles[0]
        );

      const ciphertextHandle = newEncryptedWalletBalance;

      const keypair = instance.generateKeypair();
      const handleContractPairs = [
        {
          handle: ciphertextHandle,
          contractAddress: fheTokenVOKAddress,
        },
      ];
      const startTimeStamp = Math.floor(Date.now() / 1000).toString();
      const durationDays = "10"; // String for consistency
      const contractAddresses = [fheTokenVOKAddress];

      const eip712 = instance.createEIP712(
        keypair.publicKey,
        contractAddresses,
        startTimeStamp,
        durationDays
      );

      const signature = await signer.signTypedData(
        eip712.domain,
        {
          UserDecryptRequestVerification:
            eip712.types.UserDecryptRequestVerification,
        },
        eip712.message
      );

      const result = await instance.userDecrypt(
        handleContractPairs,
        keypair.privateKey,
        keypair.publicKey,
        signature.replace("0x", ""),
        contractAddresses,
        signer.address,
        startTimeStamp,
        durationDays
      );

      const decryptedValue = result[ciphertextHandle];

      console.log(decryptedValue);*/
      /////

      // 5. Get KHO balance
      const tokenKHOContract = new ethers.Contract(
        fheTokenKHOAddress,
        fheTokenKHOABI,
        provider
      );

      const balanceKHO = await tokenKHOContract.balanceOf(address);
      const formattedKHO = ethers.formatUnits(balanceKHO, 18);

      setKHOBalance(formattedKHO);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFaucet = async (token: Token) => {
    const tokenContract = new ethers.Contract(
      token.tokenAddress,
      token.tokenContractABI,
      signer
    );

    const amountInTokens = "0.2";

    const parsedAmount = ethers.parseUnits(amountInTokens, 18);

    const tx = await tokenContract.faucet(parsedAmount);
    await tx.wait();

    const balance = await tokenContract.balanceOf(walletAddress);
    const formatted = ethers.formatUnits(balance, 18);

    switch (token.id) {
      case "vok":
        setVOKBalance(formatted);
        break;
      case "kho":
        setKHOBalance(formatted);
        break;
    }
  };

  const handleSwap = async (
    tokenFrom: string,
    tokenTo: string,
    tokenFromAmount: number | undefined,
    tokenToAmount: number | undefined
  ) => {
    const tokenSwapContract = new ethers.Contract(
      tokenSwapAddress,
      tokenSwapABI,
      signer
    );

    const fheTokenVOKContract = new ethers.Contract(
      fheTokenVOKAddress,
      fheTokenVOKABI,
      signer
    );

    const fheTokenKHOContract = new ethers.Contract(
      fheTokenKHOAddress,
      fheTokenKHOABI,
      signer
    );

    if (tokenFromAmount == null || tokenToAmount == null) {
      return;
    }

    const parsedTokenFromAmount = ethers.parseUnits(
      tokenFromAmount.toString(),
      18
    );
    const parsedTokenToAmount = ethers.parseUnits(tokenToAmount.toString(), 18);

    const allowanceFrom: bigint = await fheTokenVOKContract.allowance(
      walletAddress,
      tokenSwapAddress
    );

    if (allowanceFrom < parsedTokenFromAmount) {
      const approveTx = await fheTokenVOKContract.approve(
        tokenSwapAddress,
        parsedTokenFromAmount.toString()
      );
      await approveTx.wait();
    }

    const allowanceTo: bigint = await fheTokenKHOContract.allowance(
      tokenSwapAddress,
      walletAddress
    );

    if (allowanceTo < parsedTokenToAmount) {
      const approveTx = await fheTokenKHOContract.approve(
        walletAddress,
        parsedTokenToAmount
      );
      await approveTx.wait();
    }

    const tx = await tokenSwapContract.swap(
      walletAddress,
      fheTokenVOKAddress,
      fheTokenKHOAddress,
      parsedTokenFromAmount,
      parsedTokenToAmount
    );

    await tx.wait();

    const balanceVOK = await fheTokenVOKContract.balanceOf(walletAddress);
    const formattedVOK = ethers.formatUnits(balanceVOK, 18);
    setVOKBalance(formattedVOK);

    const balanceKHO = await fheTokenKHOContract.balanceOf(walletAddress);
    const formattedKHO = ethers.formatUnits(balanceKHO, 18);
    setKHOBalance(formattedKHO);
  };

  //change
  const getTokenContractData = (tokenId: string) => {
    let tokenContractAddress = "";
    let tokenContractABI: any[] = [];

    switch (tokenId) {
      case "vok":
        tokenContractAddress = fheTokenVOKAddress;
        tokenContractABI = fheTokenVOKABI;
        break;
      case "kho":
        tokenContractAddress = fheTokenKHOAddress;
        tokenContractABI = fheTokenKHOABI;
        break;
    }

    return { tokenContractAddress, tokenContractABI };
  };

  return (
    <div className="app">
      {header()}
      <main className="body">{tabForm()}</main>
      {footer()}
    </div>
  );
};

export default App;
