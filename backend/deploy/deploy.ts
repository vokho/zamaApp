import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  /*const deployedFHETokenSwap = await deploy("FHETokenSwap", {
    from: deployer,
    log: true,
  });

  console.log(`FHETokenSwap contract: `, deployedFHETokenSwap.address);*/

  /*const deployedFHECounter = await deploy("FHECounter", {
    from: deployer,
    log: true,
  });*/

  //console.log(`FHECounter contract: `, deployedFHECounter.address);

  const deployedFHETokenVOK = await deploy("FHETokenVOK", {
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

  console.log(`FHETokenKHO contract: `, deployedFHETokenKHO.address);

  /*
  const deployedTokenSwap = await deploy("TokenSwap", {
    args: [deployedTokenVOK.address, deployedTokenKHO.address, "2"],
    from: deployer,
    log: true,
  });

  console.log(`TokenSwap contract: `, deployedTokenSwap.address);*/
};
export default func;

/*func.id = "deploy_fheCounter"; // id required to prevent reexecution
func.tags = ["FHECounter"];*/
