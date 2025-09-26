import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  const deployedTokenSwap = await deploy("TokenSwap", {
    from: deployer,
    log: true,
  });

  console.log(`TokenSwap contract: `, deployedTokenSwap.address);

  /*const deployedFHETokenSwapHistory = await deploy("FHETokenSwapHistory", {
    from: deployer,
    log: true,
  });

  console.log(`FHETokenSwapHistory contract: `, deployedFHETokenSwapHistory.address);*/

  /*const deployedFHETokenVOK = await deploy("FHETokenVOK", {
    args: ["35000000000000000"],
    from: deployer,
    log: true,
  });

  console.log(`FHETokenVOK contract: `, deployedFHETokenVOK.address);

  const deployedFHETokenKHO = await deploy("FHETokenKHO", {
    args: ["2100000000000000"],
    from: deployer,
    log: true,
  });

  console.log(`FHETokenKHO contract: `, deployedFHETokenKHO.address);*/
};
export default func;

/*func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];*/
