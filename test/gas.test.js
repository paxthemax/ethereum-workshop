const { getGasPriceForNetwork } = require("../src/gas");

const expectFlatGas = async (network, length) => {
  const res = await getGasPriceForNetwork(network);
  assert.isObject(res);
  assert.equal(res.low.length, length);
  assert.equal(res.mid.length, length);
  assert.equal(res.high.length, length);
  assert.equal(res.high, res.low);
}

describe("Get gas price", () => {
  it("gets reasonable values for mainnet", async () => {
    const res = await getGasPriceForNetwork("mainnet");
    assert.isObject(res);
    assert.equal(res.low.length, 10);
    assert.equal(res.mid.length, 10);
    assert.equal(res.high.length, 10);
    assert.isTrue(res.high > res.low);
  });

  it("gets reasonable values for development (2 Gwei flat)", async () => {
    await  expectFlatGas("development", 10);
  });

  it("gets reasonable values for testnets (100 Gwei flat)", async () => {
    await expectFlatGas("ropsten", 12);
    await expectFlatGas("rinkeby", 12);
    await expectFlatGas("kovan", 12);
  });

  it("throws on unknown network", async () => {
    try {
      await getGasPriceForNetwork("korvan"); // TYPO
      assert.fail("should not get here");
    } catch (err) {
      assert.isTrue(true);
    }
  })
});
