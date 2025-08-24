import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { FHETokenVOK, FHETokenVOK__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("FHETokenVOK")) as FHETokenVOK__factory;
  const fheTokenVOKContract = (await factory.deploy("35000000000000000")) as FHETokenVOK;
  const fheTokenVOKContractAddress = await fheTokenVOKContract.getAddress();

  return { fheTokenVOKContract, fheTokenVOKContractAddress };
}

describe("FHETokenVOK", function () {
  let signers: Signers;
  let fheTokenVOKContract: FHETokenVOK;
  let fheTokenVOKContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async () => {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      throw new Error(`This hardhat test suite cannot run on Sepolia Testnet`);
    }
    ({ fheTokenVOKContract, fheTokenVOKContractAddress } = await deployFixture());
  });

  it("get encrypten token balance", async function () {
    const encryptedWalletAddress = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    const encryptedWalletBalance = await fheTokenVOKContract.getEncryptedBalance(encryptedWalletAddress.handles[0]);
    expect(encryptedWalletBalance).to.eq(ethers.ZeroHash);
  });

  it("set encrypten token balance", async function () {
    const encryptedWalletAddress = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    const newWalletBalance = 5;
    const encryptedNewWalletBalance = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .add128(newWalletBalance)
      .encrypt();

    const tx = await fheTokenVOKContract
      .connect(signers.alice)
      .setEncryptedBalance(
        encryptedWalletAddress.handles[0],
        encryptedNewWalletBalance.handles[0],
        encryptedNewWalletBalance.inputProof,
      );
    await tx.wait();

    const newEncryptedWalletBalance = await fheTokenVOKContract.getEncryptedBalance(encryptedWalletAddress.handles[0]);

    const newDecryptedWalletBalance = await fhevm.userDecryptEuint(
      FhevmType.euint128,
      newEncryptedWalletBalance,
      fheTokenVOKContractAddress,
      signers.alice,
    );

    expect(newDecryptedWalletBalance).to.eq(newWalletBalance);
  });

  it("increase encrypten token balance", async function () {
    const encryptedWalletAddress = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    const newWalletBalance = 5;
    const encryptedNewWalletBalance = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .add128(newWalletBalance)
      .encrypt();

    const setEncrypredBalanceResponse = await fheTokenVOKContract
      .connect(signers.alice)
      .setEncryptedBalance(
        encryptedWalletAddress.handles[0],
        encryptedNewWalletBalance.handles[0],
        encryptedNewWalletBalance.inputProof,
      );
    await setEncrypredBalanceResponse.wait();

    const increaseValue = 3;
    const encryptedIncreaseValue = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .add128(increaseValue)
      .encrypt();

    const increaseEncryptedBalanceResponse = await fheTokenVOKContract
      .connect(signers.alice)
      .increaseEncryptedBalance(
        encryptedWalletAddress.handles[0],
        encryptedIncreaseValue.handles[0],
        encryptedIncreaseValue.inputProof,
      );
    await increaseEncryptedBalanceResponse.wait();

    const newEncryptedWalletBalance = await fheTokenVOKContract.getEncryptedBalance(encryptedWalletAddress.handles[0]);

    const newDecryptedWalletBalance = await fhevm.userDecryptEuint(
      FhevmType.euint128,
      newEncryptedWalletBalance,
      fheTokenVOKContractAddress,
      signers.alice,
    );

    expect(newDecryptedWalletBalance).to.eq(newWalletBalance + increaseValue);
  });

  it("decrease encrypten token balance", async function () {
    const encryptedWalletAddress = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .addAddress(signers.alice.address)
      .encrypt();

    const newWalletBalance = 5;
    const encryptedNewWalletBalance = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .add128(newWalletBalance)
      .encrypt();

    const setEncrypredBalanceResponse = await fheTokenVOKContract
      .connect(signers.alice)
      .setEncryptedBalance(
        encryptedWalletAddress.handles[0],
        encryptedNewWalletBalance.handles[0],
        encryptedNewWalletBalance.inputProof,
      );
    await setEncrypredBalanceResponse.wait();

    const decreaseValue = 3;
    const encryptedDecreaseValue = await fhevm
      .createEncryptedInput(fheTokenVOKContractAddress, signers.alice.address)
      .add128(decreaseValue)
      .encrypt();

    const decreaseEncryptedBalanceResponse = await fheTokenVOKContract
      .connect(signers.alice)
      .decreaseEncryptedBalance(
        encryptedWalletAddress.handles[0],
        encryptedDecreaseValue.handles[0],
        encryptedDecreaseValue.inputProof,
      );
    await decreaseEncryptedBalanceResponse.wait();

    const newEncryptedWalletBalance = await fheTokenVOKContract.getEncryptedBalance(encryptedWalletAddress.handles[0]);

    const newDecryptedWalletBalance = await fhevm.userDecryptEuint(
      FhevmType.euint128,
      newEncryptedWalletBalance,
      fheTokenVOKContractAddress,
      signers.alice,
    );

    expect(newDecryptedWalletBalance).to.eq(newWalletBalance - decreaseValue);
  });
});
