const atomicSwap = artifacts.require("./AtomicSwapERC20.sol");
const testERC20 = artifacts.require("./TestERC20.sol");

const axios = require("axios");

contract("Cross Chain Atomic Swap with ERC20", (accounts) => {
  const lock = "0x261c74f7dd1ed6a069e18375ab2bee9afcb1095613f53b07de11829ac66cdfcc";
  const swapID_swap = "0x0505915948dcd6756a8f5169e9c539b69d87d9a4b8f57cbb40867d9f91790211";

  // disable gas estimates
  atomicSwap.autoGas = false;
  testERC20.autoGas = false;

  it("Deposit erc20 tokens into the contract", async() => {
    const swap = await atomicSwap.deployed();
    const token = await testERC20.deployed();
    const timeout = 100; // seconds

    try {
      await token.approve(swap.address, 10000, { gas: 50 });
      assert.fail("gas should be too low");
    } catch (err) {}

    const gasEstimate = await token.approve.estimateGas(swap.address, 10000);
    await token.approve(swap.address, 10000, { gas: gasEstimate * 1.25 });

    await swap.open(swapID_swap, 10000, token.address, accounts[0], lock, timeout, { from: accounts[0] });
  });

  it("Produces sensible gas estimates", async() => {
    const swap = await atomicSwap.deployed();
    const token = await testERC20.deployed();

    // this is default that we tested above
    // from: https://github.com/trufflesuite/truffle/blob/cbd741b40696d6f7f6053ae007e1fdfb22483237/packages/truffle-contract/lib/execute.js#L19-L43
    const gasEstimate = await token.approve.estimateGas(swap.address, 10000);

    console.log(web3.eth._provider.host);

    // let us try to calculate this by hand
    // https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-encodeabi
    const data = await token.contract.methods.approve(swap.address, 10000).encodeABI();
    const params = { to: token.address, data };
    const myEstimate = await web3.eth.estimateGas(params);
    assert.equal(gasEstimate, myEstimate); // * token.gasMultiplier);
  });

  it("Calculate gas estimates manually", async() => {
    const swap = await atomicSwap.deployed();
    const token = await testERC20.deployed();

    // this is reference answer
    const gasEstimate = await token.approve.estimateGas(swap.address, 10000);

    // this is encoded data
    const data = await token.contract.methods.approve(swap.address, 10000).encodeABI();
    // console.log(`data: ${data}`);

    const host = web3.eth._provider.host;
    const params = { to: token.address, data };

    const payload = {
      jsonrpc: "2.0",
      method: "eth_estimateGas",
      params: [params],
      id: 100,
    };

    const res = await axios.post(host, payload);
    const myEstimate = parseInt(res.data.result);

    assert.equal(gasEstimate, myEstimate);
  });
});
