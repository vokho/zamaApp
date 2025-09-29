import { useState, useEffect } from "react";
import { type Token, type FHESwapHistory } from "./App";

import "./App.css";

interface SwapProps {
  tokens: Token[];
  onHandleSwap: (
    tokenFrom: Token,
    tokenTo: Token,
    tokenFromAmount: number | undefined,
    tokenToAmount: number | undefined
  ) => void;
  onGetSwapHistoryList: () => Promise<SwapHistory[]>;
  onAddSwapHistory: (fheSwapHistory: FHESwapHistory) => void;
}

export interface SwapHistory {
  id: string;
  date: string;
  from: string;
  fromAmount: string;
  to: string;
  toAmount: string;
}

const columns = ["№", "Date", "From", "From Amount", "To", "To Amount"];

const SwapForm: React.FC<SwapProps> = ({
  tokens,
  onHandleSwap,
  onGetSwapHistoryList,
  onAddSwapHistory,
}) => {
  const [tokenFrom, setTokenFrom] = useState(tokens[0]);
  const [tokenTo, setTokenTo] = useState(tokens[1]);
  const [tokenFromAmount, setTokenFromAmount] = useState<number>();
  const [tokenToAmount, setTokenToAmount] = useState<number>();

  const [swapHistoryList, setSwapHistoryList] = useState<SwapHistory[]>([]);

  const [canSwap, setCanSwap] = useState(false);

  const handleFromTokenChange = (event: any) => {
    const newTokenFrom = tokens.find(
      (token) => token.id === event.target.value
    );
    if (newTokenFrom != null) {
      setTokenFrom(newTokenFrom);
    }

    if (tokenToAmount != 0 && tokenToAmount != null) {
      const tokenFromRate = newTokenFrom?.rate;
      const tokenToRate = tokenTo?.rate;

      if (tokenFromRate != null && tokenToRate != null) {
        setTokenFromAmount((tokenFromRate * tokenToAmount) / tokenToRate);
      }
    }
  };

  const handleToTokenChange = (event: any) => {
    const newTokenTo = tokens.find((token) => token.id === event.target.value);
    if (newTokenTo != null) {
      setTokenFrom(newTokenTo);
    }

    if (tokenFromAmount != 0 && tokenFromAmount != null) {
      const tokenFromRate = tokenFrom?.rate;
      const tokenToRate = newTokenTo?.rate;

      if (tokenFromRate != null && tokenToRate != null) {
        setTokenToAmount((tokenToRate * tokenFromAmount) / tokenFromRate);
      }
    }
  };

  const handleTokenFromAmountChange = (event: any) => {
    setTokenFromAmount(event.target.value);

    const tokenFromRate = tokenFrom?.rate;
    const tokenToRate = tokenTo?.rate;

    if (tokenFromRate != null && tokenToRate != null) {
      setTokenToAmount((tokenToRate * event.target.value) / tokenFromRate);
    }
  };

  const handleTokenToAmountChange = (event: any) => {
    setTokenToAmount(event.target.value);

    const tokenFromRate = tokenFrom?.rate;
    const tokenToRate = tokenTo?.rate;

    if (tokenFromRate != null && tokenToRate != null) {
      setTokenFromAmount((tokenFromRate * event.target.value) / tokenToRate);
    }
  };

  const handleSwitch = () => {
    const oldTokenFrom = tokenFrom;
    setTokenFrom(tokenTo);
    setTokenTo(oldTokenFrom);

    const oldTokenFromAmount = tokenFromAmount;
    setTokenFromAmount(tokenToAmount);
    setTokenToAmount(oldTokenFromAmount);
  };

  const handleSwap = async () => {
    if (tokenFromAmount == null || tokenToAmount == null) {
      return;
    }
    await onHandleSwap(tokenFrom, tokenTo, tokenFromAmount, tokenToAmount);

    const dateTime = new Date();
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

    const swapHistory: SwapHistory = {
      id: (swapHistoryList.length + 1).toString(),
      date: formatter,
      from: tokenFrom.symbol,
      fromAmount: tokenFromAmount.toString(),
      to: tokenTo.symbol,
      toAmount: tokenToAmount?.toString(),
    };

    setSwapHistoryList([...swapHistoryList, swapHistory]);

    const fheSwapHistory: FHESwapHistory = {
      id: (swapHistoryList.length + 1).toString(),
      date: BigInt(dateTime.getTime()),
      from: tokenFrom.tokenAddress,
      fromAmount: tokenFromAmount.toString(),
      to: tokenTo.tokenAddress,
      toAmount: tokenToAmount?.toString(),
    };

    onAddSwapHistory(fheSwapHistory);
  };

  useEffect(() => {
    const checkCanSwap = () => {
      if (
        tokenFrom.id == tokenTo.id ||
        tokenFromAmount == null ||
        tokenToAmount == null ||
        tokenFromAmount == 0 ||
        tokenToAmount == 0
      ) {
        setCanSwap(false);
      } else {
        setCanSwap(true);
      }
    };

    checkCanSwap();
  }, [tokenFrom, tokenTo, tokenFromAmount, tokenToAmount]);

  useEffect(() => {
    const updateTokens = () => {
      const newTokenFrom = tokens.find((token) => token.id === tokenFrom.id);
      if (newTokenFrom != null) {
        setTokenFrom(newTokenFrom);
      }

      const newTokenTo = tokens.find((token) => token.id === tokenTo.id);
      if (newTokenTo != null) {
        setTokenTo(newTokenTo);
      }
    };

    updateTokens();
  }, [tokenFrom.id, tokenTo.id, tokens]);

  useEffect(() => {
    const getSwapHistoryList = async () => {
      setSwapHistoryList(await onGetSwapHistoryList());
    };

    getSwapHistoryList();
  }, []);

  return (
    <div className="space-between">
      <div className="swap-form">
        <div className="form-header">
          <h2>FHE Swap</h2>
        </div>
        <div className="swap-div swap-body form-border">
          <div className="space-between">
            <strong className="info">From</strong>
            <strong className="balance">{tokenFrom.balance}</strong>
          </div>
          <div className="center">
            <input
              id="from"
              value={tokenFromAmount}
              onChange={handleTokenFromAmountChange}
              className="input input-style"
            />
            <select
              id="from"
              value={tokenFrom.id}
              onChange={handleFromTokenChange}
              className="input-selector input-style"
            >
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
          <div className="center">
            <button type="button" className="max">
              max
            </button>
          </div>
          <div className="center">
            <button
              type="button"
              onClick={handleSwitch}
              className="input-style"
            >
              ⇅
            </button>
          </div>
          <div className="space-between">
            <strong className="info">To</strong>
            <strong className="balance">{tokenTo.balance}</strong>
          </div>
          <div className="center">
            <input
              id="to"
              value={tokenToAmount}
              onChange={handleTokenToAmountChange}
              className="input input-style"
            ></input>
            <select
              id="to"
              value={tokenTo.id}
              onChange={handleToTokenChange}
              className="input-selector input-style"
            >
              {tokens.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.symbol}
                </option>
              ))}
            </select>
          </div>
          <div className="center">
            <button
              type="button"
              onClick={handleSwap}
              disabled={!canSwap}
              className="swap"
            >
              Swap
            </button>
          </div>
        </div>
      </div>
      <div className="swap-history-form">
        <div className="form-header">
          {" "}
          <h2>FHE Swap History</h2>
        </div>
        <div className="swap-history-body form-border">
          <table className="swap-history-table">
            <thead className="swap-history-table-header">
              <tr>
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {swapHistoryList.map((swapHistory) => (
                <tr key={swapHistory.id}>
                  <td>{swapHistory.id}</td>
                  <td>{swapHistory.date}</td>
                  <td>{swapHistory.from}</td>
                  <td>{swapHistory.fromAmount}</td>
                  <td>{swapHistory.to}</td>
                  <td>{swapHistory.toAmount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SwapForm;
