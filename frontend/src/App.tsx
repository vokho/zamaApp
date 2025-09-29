import { useState } from "react";
import { ethers, type JsonFragment } from "ethers";
import {
  initSDK,
  createInstance,
  SepoliaConfig,
} from "@zama-fhe/relayer-sdk/bundle";

import "./App.css";
import PortfolioForm from "./PortfolioForm.tsx";
import SwapForm, { type SwapHistory } from "./SwapForm.tsx";
import { FaXTwitter, FaInstagram, FaYoutube, FaDiscord } from "react-icons/fa6";

import FHETokenVOKABI from "../src/abis/FHETokenVOK.json";
import FHETokenKHOABI from "../src/abis/FHETokenKHO.json";

import FHETokenSwapHistoryABI from "../src/abis/FHETokenSwapHistory.json";

import TokenSwapABI from "../src/abis/TokenSwap.json";

const fheTokenVOKAddress = "0xf2ae56F330F2837E7f3B62188848123fD6972b12";
const fheTokenVOKABI = FHETokenVOKABI.abi;

const fheTokenKHOAddress = "0x3923b8e9Aa15c2b74F9139c7fB50a6EeFAb653ba";
const fheTokenKHOABI = FHETokenKHOABI.abi;

const fheTokenSwapHistoryAddress = "0x0514F65a1Ad16189eb25d8B718C11F667c1F2051";
const fheTokenSwapHistoryABI = FHETokenSwapHistoryABI.abi;

const tokenSwapAddress = "0xD996B7565990eD0C928341F860E007bf4b8A8878";
const tokenSwapABI = TokenSwapABI.abi;

type Tab = {
  id: string;
  label: string;
};

const tabs: Tab[] = [
  { id: "portfolio", label: "Portfolio" },
  { id: "swap", label: "Swap" },
];

type ExternalInputEaddress = {
  value: Uint8Array<ArrayBufferLike>;
  proof: Uint8Array<ArrayBufferLike>;
};

type ExternalInputEuint128 = {
  value: Uint8Array<ArrayBufferLike>;
  proof: Uint8Array<ArrayBufferLike>;
};

type ExternalTokenData = {
  externalToken: ExternalInputEaddress;
  externalAmount: ExternalInputEuint128;
};

type ExternalSwapData = {
  time: ExternalInputEuint128;
  wallet: string;
  tokenFromData: ExternalTokenData;
  tokenToData: ExternalTokenData;
};

export interface FHESwapHistory {
  id: string;
  date: bigint;
  from: string;
  fromAmount: string;
  to: string;
  toAmount: string;
}

export interface Token {
  id: string;
  symbol: string;
  rate: number;
  balance: string;
  tokenAddress: string;
  tokenContractABI: JsonFragment[];
}

const defaultTokens: Token[] = [
  {
    id: "vok",
    symbol: "VOK",
    rate: 2.5,
    balance: "0",
    tokenAddress: "0xf2ae56F330F2837E7f3B62188848123fD6972b12",
    tokenContractABI: FHETokenVOKABI.abi,
  },
  {
    id: "kho",
    symbol: "KHO",
    rate: 5,
    balance: "0",
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

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("portfolio");

  const [signer, setSigner] = useState<ethers.JsonRpcSigner>();
  const [walletAddress, setWalletAddress] = useState("");

  const [tokens, setTokens] = useState<Token[]>(defaultTokens);
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
        return <PortfolioForm tokens={tokens} onHandleFaucet={handleFaucet} />;
      case "swap":
        return (
          <SwapForm
            tokens={tokens}
            onHandleSwap={handleSwap}
            onGetSwapHistoryList={getSwapHistoryList}
            onAddSwapHistory={addSwapHistory}
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

      // Connect Wallet
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

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

      //Get Instance
      await initSDK({});

      const config = { ...SepoliaConfig, network: window.ethereum };

      const instance = await createInstance(config);

      // Get VOK balance
      const fheTokenVOKContract = new ethers.Contract(
        fheTokenVOKAddress,
        fheTokenVOKABI,
        signer
      );

      let handle: Uint8Array;
      const storedHandle = localStorage.getItem("walletHandle");
      if (storedHandle) {
        handle = new Uint8Array(JSON.parse(storedHandle));
      } else {
        const encryptedWalletAddress = await instance
          .createEncryptedInput(fheTokenVOKAddress, address)
          .addAddress(address)
          .encrypt();

        handle = encryptedWalletAddress.handles[0];
        localStorage.setItem(
          "walletHandle",
          JSON.stringify(Array.from(handle))
        );
      }

      let encryptedBalanceVOK = await fheTokenVOKContract.getEncryptedBalance(
        handle
      );

      if (
        encryptedBalanceVOK ==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        tokens[0].balance = "0";
      } else {
        let decryptedBalanceVOK = await decryptValue(
          encryptedBalanceVOK,
          fheTokenVOKAddress,
          signer
        );

        const balanceOfVOK = await fheTokenVOKContract.balanceOf(address);

        if (decryptedBalanceVOK !== balanceOfVOK) {
          const encryptedWalletBalance = await instance
            .createEncryptedInput(fheTokenVOKAddress, address)
            .add128(balanceOfVOK)
            .encrypt();

          const tx: ethers.TransactionResponse =
            await fheTokenVOKContract.setEncryptedBalance(
              handle,
              encryptedWalletBalance.handles[0],
              encryptedWalletBalance.inputProof
            );

          await tx.wait();

          encryptedBalanceVOK = await fheTokenVOKContract.getEncryptedBalance(
            handle
          );

          decryptedBalanceVOK = await decryptValue(
            encryptedBalanceVOK,
            fheTokenVOKAddress,
            signer
          );
        }

        const formattedVOK = ethers.formatUnits(
          decryptedBalanceVOK.toString(),
          18
        );

        tokens[0].balance = formattedVOK.toString();
      }

      // Get KHO balance
      const fheTokenKHOContract = new ethers.Contract(
        fheTokenKHOAddress,
        fheTokenKHOABI,
        signer
      );

      let encryptedBalanceKHO = await fheTokenKHOContract.getEncryptedBalance(
        handle
      );

      if (
        encryptedBalanceKHO ==
        "0x0000000000000000000000000000000000000000000000000000000000000000"
      ) {
        tokens[1].balance = "0";
      } else {
        let decryptedBalanceKHO = await decryptValue(
          encryptedBalanceKHO,
          fheTokenKHOAddress,
          signer
        );

        const balanceOfKHO = await fheTokenKHOContract.balanceOf(address);

        if (decryptedBalanceKHO !== balanceOfKHO) {
          const encryptedWalletBalance = await instance
            .createEncryptedInput(fheTokenKHOAddress, address)
            .add128(balanceOfKHO)
            .encrypt();

          const tx: ethers.TransactionResponse =
            await fheTokenKHOContract.setEncryptedBalance(
              handle,
              encryptedWalletBalance.handles[0],
              encryptedWalletBalance.inputProof
            );

          await tx.wait();

          encryptedBalanceKHO = await fheTokenKHOContract.getEncryptedBalance(
            handle
          );

          decryptedBalanceKHO = await decryptValue(
            encryptedBalanceKHO,
            fheTokenKHOAddress,
            signer
          );
        }

        const formattedKHO = ethers.formatUnits(
          decryptedBalanceKHO.toString(),
          18
        );
        tokens[1].balance = formattedKHO.toString();
      }
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

    const faucetTransaction = await tokenContract.faucet(parsedAmount);
    await faucetTransaction.wait();

    const balance =
      ethers.parseUnits(token.balance, 18) +
      ethers.parseUnits(amountInTokens, 18);
    const formatted = ethers.formatUnits(balance, 18);

    const updatedTokens = tokens.map((item) =>
      item.id === token.id ? { ...item, balance: formatted } : item
    );

    const instance = await createInstance({
      ...SepoliaConfig,
    });

    const storedHandle = localStorage.getItem("walletHandle");
    if (!storedHandle) {
      return;
    }
    const handle = new Uint8Array(JSON.parse(storedHandle));

    const encryptedWalletBalance = await instance
      .createEncryptedInput(token.tokenAddress, walletAddress)
      .add128(balance)
      .encrypt();

    const tx: ethers.TransactionResponse =
      await tokenContract.setEncryptedBalance(
        handle,
        encryptedWalletBalance.handles[0],
        encryptedWalletBalance.inputProof
      );
    await tx.wait();

    setTokens(updatedTokens);
  };

  const handleSwap = async (
    tokenFrom: Token,
    tokenTo: Token,
    tokenFromAmount: number | undefined,
    tokenToAmount: number | undefined
  ) => {
    const tokenSwapContract = new ethers.Contract(
      tokenSwapAddress,
      tokenSwapABI,
      signer
    );

    const fheTokenFromContract = new ethers.Contract(
      tokenFrom.tokenAddress,
      tokenFrom.tokenContractABI,
      signer
    );

    const fheTokenToContract = new ethers.Contract(
      tokenTo.tokenAddress,
      tokenTo.tokenContractABI,
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

    const allowanceFrom: bigint = await fheTokenFromContract.allowance(
      walletAddress,
      tokenSwapAddress
    );

    if (allowanceFrom < parsedTokenFromAmount) {
      const approveTx = await fheTokenFromContract.approve(
        tokenSwapAddress,
        parsedTokenFromAmount.toString()
      );
      await approveTx.wait();
    }

    const allowanceTo: bigint = await fheTokenToContract.allowance(
      tokenSwapAddress,
      walletAddress
    );

    if (allowanceTo < parsedTokenToAmount) {
      const approveTx = await fheTokenToContract.approve(
        walletAddress,
        parsedTokenToAmount.toString()
      );
      await approveTx.wait();
    }

    const tx = await tokenSwapContract.swap(
      walletAddress,
      tokenFrom.tokenAddress,
      tokenTo.tokenAddress,
      parsedTokenFromAmount,
      parsedTokenToAmount
    );

    await tx.wait();

    const formattedFromAmount = ethers.parseUnits(
      tokenFromAmount.toString(),
      18
    );
    const formattedToAmount = ethers.parseUnits(tokenToAmount.toString(), 18);

    const instance = await createInstance({
      ...SepoliaConfig,
    });

    const storedHandle = localStorage.getItem("walletHandle");
    if (!storedHandle) {
      return;
    }
    const handle = new Uint8Array(JSON.parse(storedHandle));

    const encryptedTokenFromBalance = await instance
      .createEncryptedInput(tokenFrom.tokenAddress, walletAddress)
      .add128(formattedFromAmount)
      .encrypt();

    const encryptedTokenToBalance = await instance
      .createEncryptedInput(tokenTo.tokenAddress, walletAddress)
      .add128(formattedToAmount)
      .encrypt();

    const decreaseTx: ethers.TransactionResponse =
      await fheTokenFromContract.decreaseEncryptedBalance(
        handle,
        encryptedTokenFromBalance.handles[0],
        encryptedTokenFromBalance.inputProof
      );
    await decreaseTx.wait();

    const increaseTx: ethers.TransactionResponse =
      await fheTokenToContract.increaseEncryptedBalance(
        handle,
        encryptedTokenToBalance.handles[0],
        encryptedTokenToBalance.inputProof
      );
    await increaseTx.wait();

    const balanceFrom =
      ethers.parseUnits(tokenFrom.balance, 18) - formattedFromAmount;
    const balanceTo =
      ethers.parseUnits(tokenTo.balance, 18) + formattedToAmount;

    const formattedFrom = ethers.formatUnits(balanceFrom, 18);
    const formattedTo = ethers.formatUnits(balanceTo, 18);

    const updatedTokens = tokens
      .map((item) =>
        item.id === tokenFrom.id ? { ...item, balance: formattedFrom } : item
      )
      .map((item) =>
        item.id === tokenTo.id ? { ...item, balance: formattedTo } : item
      );

    setTokens(updatedTokens);
  };

  const getSwapHistoryList = async (): Promise<SwapHistory[]> => {
    if (signer == null) {
      throw new Error("Signer must not be null!");
    }

    const fheTokenSwapHistoryContract = new ethers.Contract(
      fheTokenSwapHistoryAddress,
      fheTokenSwapHistoryABI,
      signer
    );

    const swapDataList = await fheTokenSwapHistoryContract.getSwapDataArray(
      walletAddress
    );

    const swapHistoryList: SwapHistory[] = [];

    if (swapDataList.length < 1) {
      return swapHistoryList;
    }

    for (const swapData of swapDataList) {
      const swapHistory: SwapHistory = {
        id: "",
        date: "",
        from: "",
        fromAmount: "",
        to: "",
        toAmount: "",
      };
      swapHistory.id = swapData.order;
      const date = await decryptValue(
        swapData.time,
        fheTokenSwapHistoryAddress,
        signer
      );

      const dateTime = new Date(Number(date));

      const formatter =
        dateTime.getDate() +
        "." +
        (dateTime.getMonth() + 1 < 10
          ? "0" + (dateTime.getMonth() + 1)
          : dateTime.getMonth() + 1) +
        "." +
        dateTime.getFullYear() +
        " " +
        (dateTime.getHours() < 10
          ? "0" + dateTime.getHours()
          : dateTime.getHours()) +
        ":" +
        (dateTime.getMinutes() < 10
          ? "0" + dateTime.getMinutes()
          : dateTime.getMinutes()) +
        ":" +
        (dateTime.getSeconds() < 10
          ? "0" + dateTime.getSeconds()
          : dateTime.getSeconds()) +
        ":" +
        dateTime.getMilliseconds();

      swapHistory.date = formatter;

      const tokenFromAddress = await decryptValue(
        swapData.tokenFromData.token,
        fheTokenSwapHistoryAddress,
        signer
      );

      const tokenFrom: Token | undefined = tokens.find(
        (token) => token.tokenAddress === tokenFromAddress
      );

      swapHistory.from = tokenFrom?.symbol || "";

      const tokenFromAmount = await decryptValue(
        swapData.tokenFromData.amount,
        fheTokenSwapHistoryAddress,
        signer
      );

      swapHistory.fromAmount = ethers.formatUnits(
        tokenFromAmount.toString(),
        18
      );

      const tokenToAddress = await decryptValue(
        swapData.tokenToData.token,
        fheTokenSwapHistoryAddress,
        signer
      );

      const tokenTo: Token | undefined = tokens.find(
        (token) => token.tokenAddress === tokenToAddress
      );

      swapHistory.to = tokenTo?.symbol || "";

      const tokenToAmount = await decryptValue(
        swapData.tokenToData.amount,
        fheTokenSwapHistoryAddress,
        signer
      );

      swapHistory.toAmount = ethers.formatUnits(tokenToAmount.toString(), 18);

      swapHistoryList.push(swapHistory);
    }

    return swapHistoryList;
  };

  const addSwapHistory = async (fheSwapHistory: FHESwapHistory) => {
    const instance = await createInstance({
      ...SepoliaConfig,
    });

    const fheTokenSwapHistoryContract = new ethers.Contract(
      fheTokenSwapHistoryAddress,
      fheTokenSwapHistoryABI,
      signer
    );

    const encryptedTime = await instance
      .createEncryptedInput(fheTokenSwapHistoryAddress, walletAddress)
      .add128(fheSwapHistory.date)
      .encrypt();

    const encryptedTokenFrom = await instance
      .createEncryptedInput(fheTokenSwapHistoryAddress, walletAddress)
      .addAddress(fheSwapHistory.from)
      .encrypt();

    const encryptedTokenTo = await instance
      .createEncryptedInput(fheTokenSwapHistoryAddress, walletAddress)
      .addAddress(fheSwapHistory.to)
      .encrypt();

    const encryptedAmountFrom = await instance
      .createEncryptedInput(fheTokenSwapHistoryAddress, walletAddress)
      .add128(ethers.parseUnits(fheSwapHistory.fromAmount, 18))
      .encrypt();

    const encryptedAmountTo = await instance
      .createEncryptedInput(fheTokenSwapHistoryAddress, walletAddress)
      .add128(ethers.parseUnits(fheSwapHistory.toAmount, 18))
      .encrypt();

    const externalTime: ExternalInputEuint128 = {
      value: encryptedTime.handles[0],
      proof: encryptedTime.inputProof,
    };

    const externalTokenFrom: ExternalInputEaddress = {
      value: encryptedTokenFrom.handles[0],
      proof: encryptedTokenFrom.inputProof,
    };

    const externalAmountFrom: ExternalInputEuint128 = {
      value: encryptedAmountFrom.handles[0],
      proof: encryptedAmountFrom.inputProof,
    };

    const externalTokenFromData: ExternalTokenData = {
      externalToken: externalTokenFrom,
      externalAmount: externalAmountFrom,
    };

    const externalTokenTo: ExternalInputEaddress = {
      value: encryptedTokenTo.handles[0],
      proof: encryptedTokenTo.inputProof,
    };

    const externalAmountTo: ExternalInputEuint128 = {
      value: encryptedAmountTo.handles[0],
      proof: encryptedAmountTo.inputProof,
    };

    const externalTokenToData: ExternalTokenData = {
      externalToken: externalTokenTo,
      externalAmount: externalAmountTo,
    };

    const externalSwapData: ExternalSwapData = {
      time: externalTime,
      wallet: walletAddress,
      tokenFromData: externalTokenFromData,
      tokenToData: externalTokenToData,
    };

    const tx = await fheTokenSwapHistoryContract.addSwapData(externalSwapData);
    await tx.wait();
  };

  const decryptValue = async (
    encryptedValue: string,
    contractAddress: string,
    signer: ethers.JsonRpcSigner
  ) => {
    const instance = await createInstance({
      ...SepoliaConfig,
    });

    const ciphertextHandle = encryptedValue;

    const keypair = instance.generateKeypair();
    const handleContractPairs = [
      {
        handle: ciphertextHandle,
        contractAddress: contractAddress,
      },
    ];
    const startTimeStamp = Math.floor(Date.now() / 1000).toString();
    const durationDays = "10";
    const contractAddresses = [contractAddress];

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

    return decryptedValue;
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
