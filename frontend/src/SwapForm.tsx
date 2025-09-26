import { useState, useEffect } from "react";

import "./App.css";

interface Token {
  id: string;
  symbol: string;
  rate: number;
  balance: string;
}

interface SwapProps {
  vokBalance: string;
  khoBalance: string;
  onHandleSwap: (
    tokenFrom: string,
    tokenTo: string,
    tokenFromAmount: number | undefined,
    tokenToAmount: number | undefined
  ) => void;
}

const columns = ["№", "Date", "From", "From Amount", "To", "To Amount"];

const SwapForm: React.FC<SwapProps> = ({
  vokBalance,
  khoBalance,
  onHandleSwap,
}) => {
  const tokens: Token[] = [
    { id: "vok", symbol: "VOK", rate: 2.5, balance: vokBalance },
    { id: "kho", symbol: "KHO", rate: 5, balance: khoBalance },
  ];

  const [tokenFrom, setTokenFrom] = useState(tokens[0].id);
  const [tokenTo, setTokenTo] = useState(tokens[1].id);
  const [tokenFromAmount, setTokenFromAmount] = useState<number>();
  const [tokenToAmount, setTokenToAmount] = useState<number>();
  const [tokenFromBalance, setTokenFromBalance] = useState(tokens[0].balance);
  const [tokenToBalance, setTokenToBalance] = useState(tokens[1].balance);

  const [canSwap, setCanSwap] = useState(false);

  const handleFromTokenChange = (event) => {
    setTokenFrom(event.target.value);

    const newTokenFrom = tokens.find((item) => item.id === event.target.value);
    const newTokenTo = tokens.find((item) => item.id === tokenTo);

    setTokenFromBalance(newTokenFrom?.balance || "");

    if (tokenToAmount != 0 && tokenToAmount != null) {
      const tokenFromRate = newTokenFrom?.rate;
      const tokenToRate = newTokenTo?.rate;

      if (tokenFromRate != null && tokenToRate != null) {
        setTokenFromAmount((tokenFromRate * tokenToAmount) / tokenToRate);
      }
    }
  };

  const handleToTokenChange = (event) => {
    setTokenTo(event.target.value);

    const newTokenFrom = tokens.find((item) => item.id === tokenFrom);
    const newTokenTo = tokens.find((item) => item.id === event.target.value);

    setTokenToBalance(newTokenTo?.balance || "");

    if (tokenFromAmount != 0 && tokenFromAmount != null) {
      const tokenFromRate = newTokenFrom?.rate;
      const tokenToRate = newTokenTo?.rate;

      if (tokenFromRate != null && tokenToRate != null) {
        setTokenToAmount((tokenToRate * tokenFromAmount) / tokenFromRate);
      }
    }
  };

  const handleTokenFromAmountChange = (event) => {
    setTokenFromAmount(event.target.value);

    const tokenFromRate = tokens.find((item) => item.id === tokenFrom)?.rate;
    const tokenToRate = tokens.find((item) => item.id === tokenTo)?.rate;

    if (tokenFromRate != null && tokenToRate != null) {
      setTokenToAmount((tokenToRate * event.target.value) / tokenFromRate);
    }
  };

  const handleTokenToAmountChange = (event) => {
    setTokenToAmount(event.target.value);

    const tokenFromRate = tokens.find((item) => item.id === tokenFrom)?.rate;
    const tokenToRate = tokens.find((item) => item.id === tokenTo)?.rate;

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

    const oldTokenFromBalance = tokenFromBalance;
    setTokenFromBalance(tokenToBalance);
    setTokenToBalance(oldTokenFromBalance);
  };

  const handleSwap = () => {
    onHandleSwap(tokenFrom, tokenTo, tokenFromAmount, tokenToAmount);
  };

  const checkCanSwap = () => {
    if (
      tokenFrom == tokenTo ||
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

  useEffect(() => {
    checkCanSwap();
  }, [tokenFrom, tokenTo, tokenFromAmount, tokenToAmount]);

  return (
    <div className="space-between">
      <div className="swap-form">
        <div className="form-header">
          <h2>Swap</h2>
        </div>
        <div className="swap-div swap-body form-border">
          <div className="space-between">
            <strong className="info">From</strong>
            <strong className="balance">{tokenFromBalance}</strong>
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
              value={tokenFrom}
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
            <strong className="balance">{tokenToBalance}</strong>
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
              value={tokenTo}
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
          <h2>Swap History</h2>
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
              <tr className="">
                <td>1</td>
                <td>19.09.2025 15:32:458</td>
                <td>VOK</td>
                <td>2.5</td>
                <td>KHO</td>
                <td>5</td>
              </tr>
              <tr className="">
                <td>2</td>
                <td>19.09.2025 15:32:458</td>
                <td>VOK</td>
                <td>2.5</td>
                <td>KHO</td>
                <td>5</td>
              </tr>
              <tr className="">
                <td>3</td>
                <td>19.09.2025 15:32:458</td>
                <td>VOK</td>
                <td>2.5</td>
                <td>KHO</td>
                <td>5</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SwapForm;
