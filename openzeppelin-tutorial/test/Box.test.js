// test/Box.test.js
// Load dependencies
const { expect } = require('chai');

// Import utilities from Test Helpers
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { web3 } = require('@openzeppelin/test-helpers/src/setup');

// Load compiled artifacts
const Box = artifacts.require('Box');

// Start test block
contract('Box (truffle)', function ([ owner, other ]) {
  // Use large integers ('big numbers')
  const value = new BN('42');

  beforeEach(async function () {
    this.box = await Box.new({ from: owner });
  });

  it('retrieve returns a value previously stored', async function () {
    await this.box.store(value, { from: owner });

    // Use large integer comparisons
    expect(await this.box.retrieve()).to.be.bignumber.equal(value);
  });

  it('store emits an event', async function () {
    const receipt = await this.box.store(value, { from: owner });

    // Test that a ValueChanged event was emitted with the new value
    expectEvent(receipt, 'ValueChanged', { value: value });
  });

  it('non owner cannot store a value', async function () {
    // Test a transaction reverts
    await expectRevert(
      this.box.store(value, { from: other }),
      'Ownable: caller is not the owner',
    );
  });
});

// Start test block
describe('Box (Mocha)', function () {
	// Use large integers ('big numbers')
	const value = new BN('42');
	let owner;
	let other;

	before(async () => {
		accounts = await web3.eth.getAccounts();

		owner = accounts[0];
		other = accounts[1];
	})
  
	beforeEach(async function () {
	  this.box = await Box.new({ from: owner });
	});
  
	it('retrieve returns a value previously stored', async function () {
	  await this.box.store(value, { from: owner });
  
	  // Use large integer comparisons
	  expect(await this.box.retrieve()).to.be.bignumber.equal(value);
	});
  
	it('store emits an event', async function () {
	  const receipt = await this.box.store(value, { from: owner });
  
	  // Test that a ValueChanged event was emitted with the new value
	  expectEvent(receipt, 'ValueChanged', { value: value });
	});
  
	it('non owner cannot store a value', async function () {
	  // Test a transaction reverts
	  await expectRevert(
		this.box.store(value, { from: other }),
		'Ownable: caller is not the owner',
	  );
	});
  });

// Start test block
describe('Box (Mocha using @openzeppelin/test-environment)', function () {

// run "mocha --exit --recursive"
// or with option to recompile contracts automatically
// truffle compile && mocha --exit --recursive

// const { accounts, contract } = require('@openzeppelin/test-environment');
// const { expect } = require('chai');

// // Load compiled artifacts
// const Box = contract.fromArtifact('Box');

// // Start test block
// describe('Box', function () {
//   const [ owner ] = accounts;

//   beforeEach(async function () {
//     // Deploy a new Box contract for each test
//     this.contract = await Box.new({ from: owner });
//   });

//   // Test case
//   it('retrieve returns a value previously stored', async function () {
//     // Store a value - recall that only the owner account can do this!
//     await this.contract.store(42, { from: owner });

//     // Test if the returned value is the same one
//     // Note that we need to use strings to compare the 256 bit integers
//     expect((await this.contract.retrieve()).toString()).to.equal('42');
//   });
// });

  });
  