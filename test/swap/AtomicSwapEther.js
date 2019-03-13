const crypto = require("crypto");
const { expectEvent } = require("openzeppelin-test-helpers");

const atomicSwap = artifacts.require("./AtomicSwapEther.sol");

function makeSwapId() {
  return `0x${crypto.randomBytes(32).toString("hex")}`;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

contract("Cross Chain Atomic Swap with Ether", (accounts) => {
  const defaultHash = "0x261c74f7dd1ed6a069e18375ab2bee9afcb1095613f53b07de11829ac66cdfcc";
  const defaultKey = "0x42a990655bffe188c9823a2f914641a32dcbb1b28e8586bd29af291db7dcd4e8";
  const defaultTimeout = 100; // seconds

  describe("Unsorted", () => {
    const swapID_swap = "0x0505915948dcd6756a8f5169e9c539b69d87d9a4b8f57cbb40867d9f91790211";

    it("Deposit ether into the contract", async() => {
      const swap = await atomicSwap.deployed();
      await swap.open(swapID_swap, accounts[0], defaultHash, defaultTimeout, { from: accounts[0], value: 50000 });
    });

    it("Check the ether in the lock box", async() => {
      const swap = await atomicSwap.deployed();
      const result = await swap.check(swapID_swap);

      assert.equal(result[1].toNumber(), 50000);
      assert.equal(result[2].toString(), accounts[0]);
      assert.equal(result[3].toString(), defaultHash);
    });

    it("Withdraw the ether from the lockbox", async() => {
      const swap = await atomicSwap.deployed();
      await swap.close(swapID_swap, defaultKey);
    });

    it("Get secret key from the contract", async() => {
      const swap = await atomicSwap.deployed();
      const secretkey = await swap.checkSecretKey(swapID_swap);
      assert.equal(secretkey.toString(), defaultKey);
    });

    it("Deposit ether into the contract", async() => {
      const swap = await atomicSwap.deployed();
      const swapId = makeSwapId();
      await swap.open(swapId, accounts[0], defaultHash, defaultTimeout, { from: accounts[0], value: 50000 });
    });
  });

  describe("close()", () => {
    let swap;

    before(async() => {
      swap = await atomicSwap.deployed();
    });

    it("Attempt withdrawal with secret key which is too long", async() => {
      const hash = "0x3d19f1e0f8d6eeab3acaefbc0fff6dbd255034f23c4a7493af886ec46dfafddf";
      const key = "0xff42a990655bffe188c9823a2f914641a32dcbb1b28e8586bd29af291db7dcd4e8";
      const swapId = makeSwapId();

      await swap.open(swapId, accounts[0], hash, defaultTimeout, {
        from: accounts[0],
        value: 50000,
      });

      try {
        await swap.close(swapId, key);
        assert.fail("Close accepted key that was 33 bytes, should only accept 32");
      } catch (e) {
        assert.match(e.message, /Secret key must be 32 bytes/);
      }
    });

    it("Attempt withdrawal with secret key which is too short", async() => {
      const hash = "0xe4632a45b8e39230777acdb63647b9513d5686bb4d9cb7a3be2f89664eb0fd32";
      const key = "0xa990655bffe188c9823a2f914641a32dcbb1b28e8586bd29af291db7dcd4e8";
      const swapId = makeSwapId();

      await swap.open(swapId, accounts[0], hash, defaultTimeout, {
        from: accounts[0],
        value: 50000,
      });

      try {
        await swap.close(swapId, key);
        assert.fail(
          "Close accepted key that was 31 bytes, should only accept 32"
        );
      } catch (e) {
        assert.match(e.message, /Secret key must be 32 bytes/);
      }
    });

    it("Attempt withdrawal with incorrect secret key", async() => {
      const hash = "0x261c74f7dd1ed6a069e18375ab2bee9afcb1095613f53b07de11829ac66cdfcc";
      const key = "0xf2a990655bffe188c9823a2f914641a32dcbb1b28e8586bd29af291db7dcd4e8";
      const swapId = makeSwapId();

      await swap.open(swapId, accounts[0], hash, defaultTimeout, {
        from: accounts[0],
        value: 50000,
      });

      try {
        await swap.close(swapId, key);
        assert.fail("Close accepted incorrect key");
      } catch (e) {
        assert.match(e.message, /Secret key does not match secret lock/);
      }
    });

    it("Successful withdrawal with correct secret key", async() => {
      const swapId = makeSwapId();

      await swap.open(swapId, accounts[0], defaultHash, defaultTimeout, {
        from: accounts[0],
        value: 50000,
      });

      const { tx } = await swap.close(swapId, defaultKey);

      await expectEvent.inTransaction(tx, atomicSwap, "Close", {
        _swapID: swapId,
        _secretKey: defaultKey,
      });
    });
  });

  describe("expire()", () => {
    it("can execute expire", async() => {
      const swap = await atomicSwap.deployed();

      const swapId = makeSwapId();
      const timeout = 2;

      await swap.open(swapId, accounts[0], defaultHash, timeout, { from: accounts[0], value: 50000 });
      await sleep(2000);
      const { tx } = await swap.expire(swapId, { from: accounts[0] });

      await expectEvent.inTransaction(
        tx,
        atomicSwap,
        "Expire",
        {
          _swapID: swapId,
        }
      );
    });

    xit("fails when calling expire before the timeout", async() => {
      const swap = await atomicSwap.deployed();

      const swapId = makeSwapId();
      await swap.open(swapId, accounts[0], defaultHash, defaultTimeout, { from: accounts[0], value: 50000 });

      try {
        await swap.expire(swapId, { from: accounts[0] });
        assert.fail("expire must not succeed");
      } catch (error) {
        expect(error).to.match(/not yet expired/i);
      }
    });
  });
});
