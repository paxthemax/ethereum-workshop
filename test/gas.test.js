const { getGasPrice } = require("../src/gas");

describe("Get gas price", () => {
  it("gets reasonable values", async () => {
    const res = await getGasPrice();
    assert.isObject(res);
    console.log(res);
    assert.equal(res.low.length, 10);
    assert.equal(res.mid.length, 10);
    assert.equal(res.high.length, 10);
  });
});
