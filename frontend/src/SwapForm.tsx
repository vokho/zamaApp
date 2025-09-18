import { useState, useEffect } from "react";
import { ethers } from "ethers";

import "./App.css";

interface Token {
  id: string;
  symbol: string;
  rate: number;
}

const SwapForm: React.FC = () => {
  const tokens: Token[] = [
    { id: "vok", symbol: "VOK", rate: 2.5 },
    { id: "kho", symbol: "KHO", rate: 5 },
  ];

  const [tokenFrom, setTokenFrom] = useState(tokens[0].id);
  const [tokenTo, setTokenTo] = useState(tokens[1].id);
  const [tokenFromAmount, setTokenFromAmount] = useState(0);
  const [tokenToAmount, setTokenToAmount] = useState(0);
  const [canSwap, setCanSwap] = useState(false);

  const handleFromTokenChange = (event) => {
    setTokenFrom(event.target.value);
  };
  const handleToTokenChange = (event) => {
    setTokenTo(event.target.value);
  };

  const handleTokenFromAmountChange = (event) => {
    setTokenFromAmount(event.target.value);
  };

  const handleTokenToAmountChange = (event) => {
    setTokenToAmount(event.target.value);
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
    console.log("Swap");
  };

  /*useEffect(() => {
    // Логика, которая должна выполняться после рендера
  }, []);*/

  useEffect(() => {
    checkCanSwap();
  }, [tokenFrom, tokenTo, tokenFromAmount, tokenToAmount]);

  const checkCanSwap = () => {
    if (tokenFrom == tokenTo || tokenFromAmount == 0 || tokenToAmount == 0) {
      setCanSwap(false);
    } else {
      setCanSwap(true);
    }
  };

  return (
    <form className="wallet-info22">
      <div>
        <input
          id="from"
          value={tokenFromAmount}
          onChange={handleTokenFromAmountChange}
        />
        <select id="from" value={tokenFrom} onChange={handleFromTokenChange}>
          {tokens.map((token) => (
            <option key={token.id} value={token.id}>
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button type="button" onClick={handleSwitch}>
          ⇅
        </button>
      </div>
      <div>
        <input
          id="to"
          value={tokenToAmount}
          onChange={handleTokenToAmountChange}
        ></input>
        <select id="to" value={tokenTo} onChange={handleToTokenChange}>
          {tokens.map((token) => (
            <option
              key={token.id}
              value={token.id}
              selected={token.id === "kho"}
            >
              {token.symbol}
            </option>
          ))}
        </select>
      </div>
      <div>
        <button type="button" onClick={handleSwap} disabled={!canSwap}>
          Swap
        </button>
      </div>
    </form>
  );
};

export default SwapForm;
