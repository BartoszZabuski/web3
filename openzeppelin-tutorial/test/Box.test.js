const { expect } = require('chai');

describe('Box contract tests', () => {

	let Box;
	let box;
	
	before(async () => {
		Box = await ethers.getContractFactory('Box');
	})

	beforeEach(async () => {
		box = await Box.deploy();
		await box.deployed();
	})

	it('retrieve returns a value previously stored', async () => {
		await box.store(42);
		
		expect((await box.retrieve()).toString()).to.equal('42');
	  });
	
})
