const TokenFactory = artifacts.require('TokenFactory');

contract('TokenFactory', ([owner, other]) => {
	beforeEach(async () => {
		this.tokenFactory = await TokenFactory.new({ from: owner });
	})

	describe('when producing tokens', () => {
		it('should create a token with the correct params', async () => {
			const testCap = 1000 * 1e8;
			const testSymbol = 'TEST';
			const testDescription = 'test test test';
			const testDecimals = 9;

			await this.tokenFactory.createToken(testCap, testSymbol, testDescription, testDecimals);
		});
	});
});
