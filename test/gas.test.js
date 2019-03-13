const { getGasPrice } = require("../src/gas");

describe("Get gas price", () => {
  it("gets reasonable values", async () => {
    const res = await getGasPrice();
    assert.isObject(res);
    assert.equal(length(res.low), 10);
    assert.equal(length(res.mid), 10);
    assert.equal(length(res.high), 10);
  });
});
