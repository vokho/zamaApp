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

const fheTokenVOKAddress = "0xC130567d4436156548CfceA2d68Bc7a5957B0c08";
const fheTokenVOKABI = FHETokenVOKABI.abi;

const fheTokenKHOAddress = "0xCcDB9397Cb1791b43ac2a0c3285868fa4A3ccaAE";
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

  const [walletAddress, setWalletAddress] = useState("");
  const [ethBalance, setEthBalance] = useState("");
  const [usdtBalance, setUsdtBalance] = useState("");
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
          <p>All right reserved</p>
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
        <div>
          <h3>Connect your wallet</h3>
        </div>
      );
    }
    switch (activeTab) {
      case "portfolio":
        return (
          <PortfolioForm vokBalance={vokBalance} khoBalance={khoBalance} />
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
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

      // Check current network
      const network = await provider.getNetwork();
      console.log("Network:", network.name, network.chainId);

      // For Sepolia testnet (chainId 11155111)
      if (network.chainId !== 11155111n) {
        console.error("Wrong network! Switch to Sepolia " + network.chainId);
      }

      // 2. Get ETH balance
      const balanceWei = await provider.getBalance(address);
      setEthBalance(ethers.formatEther(balanceWei));

      // 3. Get USDT balance
      const usdtContract = new ethers.Contract(
        USDT_CONTRACT_ADDRESS,
        USDT_ABI,
        provider
      );
      const balanceUSDT = await usdtContract.balanceOf(address);
      const decimals = await usdtContract.decimals();

      // Decimal converting
      const formattedUSDT = ethers.formatUnits(balanceUSDT, decimals);
      setUsdtBalance(formattedUSDT);

      // 4. Get VOK balance
      const fheTokenVOKContract = new ethers.Contract(
        fheTokenVOKAddress,
        fheTokenVOKABI,
        signer
      );

      const balanceVOK = await fheTokenVOKContract.balanceOf(address);
      const formattedVOK = ethers.formatUnits(balanceVOK, 18);
      setVOKBalance(formattedVOK);

      // Create FHEVM instance

      await initSDK({});

      //const instance = await createInstance(SepoliaConfig);

      //const relayerSDK = (window as unknown as FhevmWindowType).relayerSDK;

      const instance = await createInstance({
        ...SepoliaConfig,
        //relayerUrl: "https://relayer.testnet.zama.cloud",
      });

      const encryptedWalletAddress = await instance
        .createEncryptedInput(fheTokenVOKAddress, address)
        .addAddress(address)
        .encrypt();

      const p1 = await instance.createEncryptedInput(
        fheTokenVOKAddress,
        address
      );

      const p2 = p1.add128(balanceVOK);

      const encryptedWalletBalance = await p2.encrypt();

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

      console.log(newEncryptedWalletBalance);

      ///

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

      console.log(decryptedValue);
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

  return (
    <div className="app">
      {header()}
      <main className="body">{tabForm()}</main>
      {footer()}
    </div>
  );
};

export default App;
