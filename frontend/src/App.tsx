import { useState } from "react";
import { ethers } from "ethers";
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

const fheTokenVOKAddress = "0xFe2ADf41FeB28d54842eda33323e7C4cd82ae250";
const fheTokenVOKABI = FHETokenVOKABI.abi;

const fheTokenKHOAddress = "0xe2b967a3416Ec12A37B202ab25E23F3fEBeA561f";
const fheTokenKHOABI = FHETokenKHOABI.abi;

const fheTokenSwapHistoryAddress = "0xC5629555a00588a65d3d0753558A1b964c72fE8c";
const fheTokenSwapHistoryABI = FHETokenSwapHistoryABI.abi;

const USDT_CONTRACT_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";
const USDT_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
];

type Tab = {
  id: string;
  label: string;
};

const tabs: Tab[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "swap", label: "Swap" },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("portfolio");

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const [walletAddress, setWalletAddress] = useState("");
  const [vokBalance, setVOKBalance] = useState("");
  const [khoBalance, setKHOBalance] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
        return (
          <PortfolioForm
            vokBalance={vokBalance}
            khoBalance={khoBalance}
            onHandleFaucet={handleFaucet}
          />
        );
      case "swap":
        return <SwapForm />;
      default:
        return null;
    }
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

  const handleFaucet = async (token) => {
    let tokenContractAddress = "";
    let tokenContractABI;

    switch (token) {
      case "vok":
        tokenContractAddress = fheTokenVOKAddress;
        tokenContractABI = fheTokenVOKABI;
        break;
      case "kho":
        tokenContractAddress = fheTokenKHOAddress;
        tokenContractABI = fheTokenKHOABI;
        break;
      default:
        return;
    }

    const tokenContract = new ethers.Contract(
      tokenContractAddress,
      tokenContractABI,
      signer
    );

    const amountInTokens = "0.002";

    const parsedAmount = ethers.parseUnits(amountInTokens, 18);

    const tx = await tokenContract.faucet(parsedAmount);
    await tx.wait();

    const balance = await tokenContract.balanceOf(walletAddress);
    const formatted = ethers.formatUnits(balance, 18);

    switch (token) {
      case "vok":
        setVOKBalance(formatted);
        break;
      case "kho":
        setKHOBalance(formatted);
        break;
    }
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
