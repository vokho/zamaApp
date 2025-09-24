import { useState, useEffect } from "react";

import "./App.css";

interface PortfolioProps {
  vokBalance: string;
  khoBalance: string;
  onHandleFaucet: () => void;
}

interface Token {
  id: string;
  symbol: string;
  rate: number;
}

const tokens: Token[] = [
  { id: "vok", symbol: "VOK", rate: 2.5 },
  { id: "kho", symbol: "KHO", rate: 5 },
];

const PortfolioForm: React.FC<PortfolioProps> = ({
  vokBalance,
  khoBalance,
  onHandleFaucet,
}) => {
  const handleFaucet = (event) => {
    onHandleFaucet();
  };

  return (
    <div className="space-between">
      <div className="balance-form">
        <div className="form-header">
          <h2>FHE Token Balance</h2>
        </div>
        <div className="balance-body form-border">
          <div className="space-between">
            <strong>{"VOK: " + vokBalance}</strong>
            <div className="opacity">
              {"$" + (Number(vokBalance) * 0.02).toFixed(4)}
            </div>
          </div>
          <div className="space-between">
            <strong>{"KHO: " + khoBalance}</strong>
            <div className="opacity">
              {"$" + (Number(khoBalance) * 0.03).toFixed(4)}
            </div>
          </div>
          <div className="space-between">
            <strong>JEN: 0.053</strong>
            <div className="opacity">$0.05</div>
          </div>
          <div className="space-between">
            <strong>ALE: 0.19</strong>
            <div className="opacity">$0.00696</div>
          </div>
          <div className="space-between">
            <strong>HON: 0.0004</strong>
            <div className="opacity">$0.3205</div>
          </div>
        </div>
      </div>
      <div className="faucet-form">
        <div className="form-header">
          <h2>FHE Token Faucet</h2>
        </div>
        <div className="faucet-body form-border">
          <div className="space-between">
            <button type="button" className="faucet" onClick={handleFaucet}>
              Get VOK token
            </button>
            <div>Daily limit: 5</div>
          </div>
          <div>
            <button type="button" className="faucet">
              Get KHO token
            </button>
          </div>
          <div>
            <button type="button" className="faucet">
              Get JEN token
            </button>
          </div>
          <div>
            <button type="button" className="faucet">
              Get ALE token
            </button>
          </div>
          <div>
            <button type="button" className="faucet">
              Get HON token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioForm;
