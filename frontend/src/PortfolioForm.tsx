import { type Token } from "./App";
import "./App.css";

interface PortfolioProps {
  tokens: Token[];
  onHandleFaucet: (tokenId: Token) => void;
}

const PortfolioForm: React.FC<PortfolioProps> = ({
  tokens,
  onHandleFaucet,
}) => {
  const handleFaucet = (token: Token) => {
    onHandleFaucet(token);
  };

  return (
    <div className="space-between">
      <div className="balance-form">
        <div className="form-header">
          <h2>FHE Token Balance</h2>
        </div>
        <div className="balance-body form-border">
          {tokens.map((token) => (
            <div key={token.id} className="space-between">
              <strong>{token.symbol + ": " + token.balance}</strong>
              <div className="opacity">
                {"$" + (Number(token.balance) * 0.02).toFixed(4)}
              </div>
            </div>
          ))}
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
                onClick={() => handleFaucet(token)}
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
