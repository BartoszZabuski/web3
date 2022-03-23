// contracts/access-control/Auth.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// replaced with import "@openzeppelin/contracts/access/Ownable.sol";
contract Auth {

	address private _administrator;

	constructor(address deployer) {
		// Make the deployler of the contract the administrator
		_administrator = deployer;
	}

	function isAdministrator(address user) public view returns (bool) {
		return user == _administrator;
	}

}
