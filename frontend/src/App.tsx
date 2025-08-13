import { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import DonutChart from "react-donut-chart";

import TokenVOKABI from "../../backend/artifacts/contracts/TokenVOK.sol/TokenVOK.json";
import TokenKHOABI from "../../backend/artifacts/contracts/TokenKHO.sol/TokenKHO.json";
import TokenSwapABI from "../../backend/artifacts/contracts/TokenSwap.sol/TokenSwap.json";

const tokenVOKAddress = "0x1be6cB32FFcF1c278094e88B6B45c999AA2C7bfa";
const tokenVOKABI = TokenVOKABI.abi;

const tokenKHOAddress = "0x7C10a5B2ec7D59EA31C0485C8B7cB73258eC0494";
const tokenKHOABI = TokenKHOABI.abi;

const tokenSwapAddress = "0xde8DfC2106B6Bdf7a89252c889B7d0A4AF688b9D";
const tokenSwapABI = TokenSwapABI.abi;

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
        <div className="logo">YourLogo</div>
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

  const tabForm = () => {
    switch (activeTab) {
      case "portfolio":
        return <PortfolioForm />;
      case "swap":
        return <SwapForm />;
      default:
        return null;
    }
  };

  const PortfolioForm = () => (
    <div>
      {walletAddress && (
        <div className="wallet-info">
          <p>
            <strong>Address:</strong> {walletAddress}
          </p>
          <p>
            <strong>ETH Balance:</strong> {ethBalance || "0"}
          </p>
          <p>
            <strong>USDT Balance:</strong> {usdtBalance || "0"}
          </p>
          <p>
            <strong>VOK Balance:</strong> {vokBalance || "0"}
          </p>
          <p>
            <strong>KHO Balance:</strong> {khoBalance || "0"}
          </p>
        </div>
      )}
      <DonutChart
        data={[
          {
            label: "ETH",
            value: Number(ethBalance),
          },
          {
            label: "USDC",
            value: Number(usdtBalance),
          },
          {
            label: "VOK",
            value: Number(vokBalance),
          },
          {
            label: "KHO",
            value: Number(khoBalance),
          },
        ]}
        colors={["#0088FE", "#00C49F", "#FFBB28", "#ff2882ff"]}
      />
      ;
    </div>
  );

  const SwapForm = () => (
    <div>
      <h1>Swap</h1>
    </div>
  );

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
      // 1. Connect Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddress(address);

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
      const tokenVOKContract = new ethers.Contract(
        tokenVOKAddress,
        tokenVOKABI,
        provider
      );

      const balanceVOK = await tokenVOKContract.balanceOf(address);
      const formattedVOK = ethers.formatUnits(balanceVOK, 18);
      setVOKBalance(formattedVOK);

      // 5. Get KHO balance
      const tokenKHOContract = new ethers.Contract(
        tokenKHOAddress,
        tokenKHOABI,
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
    <form>
      {header()}
      <main className="body">{tabForm()}</main>
      <footer></footer>
    </form>
  );
};

export default App;
