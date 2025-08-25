import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHETokenSwap, FHETokenSwap__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

type ExternalInputEaddress = {
  value: any;
  proof: any;
};

type ExternalInputEuint128 = {
  value: any;
  proof: any;
};

type ExternalTokenData = {
  externalToken: ExternalInputEaddress;
  externalAmount: ExternalInputEuint128;
};

type ExternalSwapData = {
  time: any;
  wallet: any;
  tokenFromData: ExternalTokenData;
  tokenToData: ExternalTokenData;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHETokenSwapHistory")) as FHETokenSwap__factory;
  const fheTokenSwapContract = (await factory.deploy()) as FHETokenSwap;
  const fheTokenSwapContractAddress = await fheTokenSwapContract.getAddress();

  return { fheTokenSwapContract, fheTokenSwapContractAddress };
}

describe("FHETokenSwapHistory", function () {
  let signers: Signers;
  let fheTokenSwapContract: FHETokenSwap;
  let fheTokenSwapContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      throw new Error(`This hardhat test suite cannot run on Sepolia Testnet`);
    }
    ({ fheTokenSwapContract, fheTokenSwapContractAddress } = await deployFixture());
  });

  it("get swap data array", async function () {
    const swapWalletDataArray = await fheTokenSwapContract.getSwapDataArray(signers.alice.address);
    expect(swapWalletDataArray).empty;
  });

  it("add swap data array", async function () {
    const time = 11250;
    const encryptedTime = await fhevm
      .createEncryptedInput(fheTokenSwapContractAddress, signers.alice.address)
      .add128(time)
      .encrypt();

    const wallet = signers.alice.address;

    const tokenFrom = signers.alice.address;
    const encryptedTokenFrom = await fhevm
      .createEncryptedInput(fheTokenSwapContractAddress, signers.alice.address)
      .addAddress(tokenFrom)
      .encrypt();

    const tokenTo = signers.alice.address;
    const encryptedTokenTo = await fhevm
      .createEncryptedInput(fheTokenSwapContractAddress, signers.alice.address)
      .addAddress(tokenTo)
      .encrypt();

    const amountFrom = 3;
    const encryptedAmountFrom = await fhevm
      .createEncryptedInput(fheTokenSwapContractAddress, signers.alice.address)
      .add128(amountFrom)
      .encrypt();

    const amountTo = 2;
    const encryptedAmountTo = await fhevm
      .createEncryptedInput(fheTokenSwapContractAddress, signers.alice.address)
      .add128(amountTo)
      .encrypt();

    const externalTime: ExternalInputEuint128 = {
      value: encryptedTime.handles[0],
      proof: encryptedTime.inputProof,
    };

    const externalTokenFrom: ExternalInputEaddress = {
      value: encryptedTokenFrom.handles[0],
      proof: encryptedTokenFrom.inputProof,
    };

    const externalAmountFrom: ExternalInputEuint128 = {
      value: encryptedAmountFrom.handles[0],
      proof: encryptedAmountFrom.inputProof,
    };

    const externalTokenFromData: ExternalTokenData = {
      externalToken: externalTokenFrom,
      externalAmount: externalAmountFrom,
    };

    const externalTokenTo: ExternalInputEaddress = {
      value: encryptedTokenTo.handles[0],
      proof: encryptedTokenTo.inputProof,
    };

    const externalAmountTo: ExternalInputEuint128 = {
      value: encryptedAmountTo.handles[0],
      proof: encryptedAmountTo.inputProof,
    };

    const externalTokenToData: ExternalTokenData = {
      externalToken: externalTokenTo,
      externalAmount: externalAmountTo,
    };

    const externalSwapData: ExternalSwapData = {
      time: externalTime,
      wallet: signers.alice.address,
      tokenFromData: externalTokenFromData,
      tokenToData: externalTokenToData,
    };

    const tx = await fheTokenSwapContract.connect(signers.alice).addSwapData(externalSwapData);
    await tx.wait();

    const swapDataArray = await fheTokenSwapContract.getSwapDataArray(signers.alice.address);
    expect(swapDataArray).length(1);

    expect(swapDataArray[0].order).to.eq(1);

    expect(swapDataArray[0].wallet).to.eq(wallet);

    const decryptedTime = await fhevm.userDecryptEuint(
      FhevmType.euint128,
      swapDataArray[0].time,
      fheTokenSwapContractAddress,
      signers.alice,
    );

    expect(decryptedTime).to.eq(time);

    const decryptedTokenFrom = await fhevm.userDecryptEaddress(
      swapDataArray[0].tokenFromData.token,
      fheTokenSwapContractAddress,
      signers.alice,
    );

    expect(decryptedTokenFrom).to.eq(tokenFrom);

    const decryptedAmountFrom = await fhevm.userDecryptEuint(
      FhevmType.euint128,
      swapDataArray[0].tokenFromData.amount,
      fheTokenSwapContractAddress,
      signers.alice,
    );

    expect(decryptedAmountFrom).to.eq(amountFrom);

    const decryptedTokenTo = await fhevm.userDecryptEaddress(
      swapDataArray[0].tokenToData.token,
      fheTokenSwapContractAddress,
      signers.alice,
    );

    expect(decryptedTokenTo).to.eq(tokenTo);

    const decryptedAmountTo = await fhevm.userDecryptEuint(
      FhevmType.euint128,
      swapDataArray[0].tokenToData.amount,
      fheTokenSwapContractAddress,
      signers.alice,
    );

    expect(decryptedAmountTo).to.eq(amountTo);
  });
});
