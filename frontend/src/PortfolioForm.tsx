import "./App.css";

interface PortfolioProps {
  vokBalance: string;
  khoBalance: string;
  onHandleFaucet: (tokenId: string) => void;
}

interface Token {
  id: string;
  symbol: string;
}

const tokens: Token[] = [
  { id: "vok", symbol: "VOK" },
  { id: "kho", symbol: "KHO" },
  { id: "jen", symbol: "JEN" },
  { id: "ale", symbol: "ALE" },
  { id: "hon", symbol: "HON" },
];

const PortfolioForm: React.FC<PortfolioProps> = ({
  vokBalance,
  khoBalance,
  onHandleFaucet,
}) => {
  const handleFaucet = (tokenId: string) => {
    onHandleFaucet(tokenId);
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
            {tokens.map((token) => (
              <button
                key={token.id}
                type="button"
                className="faucet"
                onClick={() => handleFaucet(token.id)}
              >
                {"Get " + token.symbol + " token"}
              </button>
            ))}
          </div>

          <div>Daily limit: 5</div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioForm;
