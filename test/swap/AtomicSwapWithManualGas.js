const atomicSwap = artifacts.require("./AtomicSwapERC20.sol");
const testERC20 = artifacts.require("./TestERC20.sol");


contract('Cross Chain Atomic Swap with ERC20', (accounts) => {
  const lock = "0x261c74f7dd1ed6a069e18375ab2bee9afcb1095613f53b07de11829ac66cdfcc";
  const swapID_swap = "0x0505915948dcd6756a8f5169e9c539b69d87d9a4b8f57cbb40867d9f91790211";

  // disable gas estimates
  atomicSwap.autoGas = false;
  testERC20.autoGas = false;

  it("Deposit erc20 tokens into the contract", async () => {
    const swap = await atomicSwap.deployed();
    const token = await testERC20.deployed();
    const timeout = 100; // seconds

    try {
      await token.approve(swap.address, 10000, {gas: 50});
      assert.fail("gas should be too low");
    } catch (err) {}

    const gasEstimate = await token.approve.estimateGas(swap.address, 10000);
    await token.approve(swap.address, 10000, {gas: gasEstimate * 1.25});

    await swap.open(swapID_swap, 10000, token.address, accounts[0], lock, timeout, {from: accounts[0]})
  });

  it("Produces sensible gas estimates", async () => {
    const swap = await atomicSwap.deployed();
    const token = await testERC20.deployed();

    // this is default that we tested above
    // from: https://github.com/trufflesuite/truffle/blob/cbd741b40696d6f7f6053ae007e1fdfb22483237/packages/truffle-contract/lib/execute.js#L19-L43
    const gasEstimate = await token.approve.estimateGas(swap.address, 10000);

    // let us try to calculate this by hand
    const data = await token.approve.getData(swap.address, 10000);
    const params = {to: token.address, data};
    const myEstimate = await web3.eth.estimateGas(params);
    assert.Equal(gasEstimate, myEstimate * token.gasMultiplier);
  });
});
