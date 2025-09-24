import { useState, useEffect } from "react";
import { ethers } from "ethers";

import "./App.css";

interface Token {
  id: string;
  symbol: string;
  rate: number;
}

const columns = ["№", "Date", "From", "From Amount", "To", "To Amount"];

const SwapForm: React.FC = () => {
  const tokens: Token[] = [
    { id: "vok", symbol: "VOK", rate: 2.5 },
    { id: "kho", symbol: "KHO", rate: 5 },
  ];

  const [tokenFrom, setTokenFrom] = useState(tokens[0].id);
  const [tokenTo, setTokenTo] = useState(tokens[1].id);
  const [tokenFromAmount, setTokenFromAmount] = useState<number>();
  const [tokenToAmount, setTokenToAmount] = useState<number>();
  const [canSwap, setCanSwap] = useState(false);

  const handleFromTokenChange = (event) => {
    setTokenFrom(event.target.value);

    if (tokenToAmount != 0 && tokenToAmount != null) {
      const tokenFromRate = tokens.find(
        (item) => item.id === event.target.value
      )?.rate;
      const tokenToRate = tokens.find((item) => item.id === tokenTo)?.rate;

      if (tokenFromRate != null && tokenToRate != null) {
        setTokenFromAmount((tokenFromRate * tokenToAmount) / tokenToRate);
      }
    }
  };

  const handleToTokenChange = (event) => {
    setTokenTo(event.target.value);

    if (tokenFromAmount != 0 && tokenFromAmount != null) {
      const tokenFromRate = tokens.find((item) => item.id === tokenFrom)?.rate;
      const tokenToRate = tokens.find(
        (item) => item.id === event.target.value
      )?.rate;

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
  };

  const handleSwap = async () => {
    //console.log("Swap");
  };

  useEffect(() => {
    checkCanSwap();
  }, [tokenFrom, tokenTo, tokenFromAmount, tokenToAmount]);

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

  return (
    <div className="space-between">
      <div className="swap-form">
        <div className="form-header">
          <h2>Swap</h2>
        </div>
        <div className="swap-div swap-body form-border">
          <div>
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
          <div>
            <button
              type="button"
              onClick={handleSwitch}
              className="input-style"
            >
              ⇅
            </button>
          </div>
          <div>
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
          <div>
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
