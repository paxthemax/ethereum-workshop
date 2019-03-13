const { getGasPrice } = require("../src/gas");

describe("Get gas price", () => {
  it("gets reasonable values", async () => {
    const res = await getGasPrice();
    assert.defined(res);
    assert.equal(len(res.low), 10);
    assert.equal(len(res.mid), 10);
    assert.equal(len(res.high), 10);
  });
});
