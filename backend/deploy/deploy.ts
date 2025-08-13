import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  /*const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });*/

  //console.log(`FHECounter contract: `, deployedFHECounter.address);

  const deployedTokenVOK = await deploy("TokenVOK", {
    args: ["10000000000000"],
    from: deployer,
    log: true,
  });

  console.log(`TokenVOK contract: `, deployedTokenVOK.address);

  const deployedTokenKHO = await deploy("TokenKHO", {
    args: ["10000000000000"],
    from: deployer,
    log: true,
  });

  console.log(`TokenKHO contract: `, deployedTokenKHO.address);

  const deployedTokenSwap = await deploy("TokenSwap", {
    args: [deployedTokenVOK.address, deployedTokenKHO.address, "2"],
    from: deployer,
    log: true,
  });

  console.log(`TokenSwap contract: `, deployedTokenSwap.address);
};
export default func;

/*func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];*/
