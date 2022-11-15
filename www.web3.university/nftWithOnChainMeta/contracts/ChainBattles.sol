// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract ChainBattles is ERC721URIStorage {

	using Strings for uint256; // gives unsigned int super powers like conversion to strings
	using Counters for Counters.Counter;

	Counters.Counter private _tokenIds; 

	// 
	uint randNonce = 0;

	function randomNumber() private returns (uint){
		uint random = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, randNonce))) % 100;
		randNonce++;
		return random;
	}

	struct CharacterProfile {
		uint256 strength;
		uint256 level;
		uint256 speed;
	}

	// change mapping to uint256 to struct
	// struct needs more attributes: levels, strength, hp, speed, whatever?
	// when minting occurs -> generate pseudo random stat values (oficially you can't do proper random generation in solidity, so go with pseudo random)
	//  increment each of the stats as you train
	mapping(uint256 => CharacterProfile) public tokenIdToLevels;

	constructor() ERC721("Chain Battles", "CBTLS"){}

	function generateCharacter(uint256 tokenId) public view returns (string memory) {
		CharacterProfile memory profile = getProfile(tokenId);
		bytes memory svg = abi.encodePacked(
			'<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">',
			'<g>',
			'<title>Layer 1</title>',
			'<text transform="matrix(1.65653 0 0 2.14618 -191.706 -194.031)" stroke="#000" xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_1" y="191.46594" x="280.53023" stroke-width="0" fill="#000000">Chain warrior</text>',
			'<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_2" y="270" x="321" stroke-width="0" stroke="#000" fill="#000000">level:',profile.level.toString(),'</text>',
			'<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_3" y="309" x="312" stroke-width="0" stroke="#000" fill="#000000">speed:',profile.speed.toString(),'</text>',
			'<text xml:space="preserve" text-anchor="start" font-family="Noto Sans JP" font-size="24" id="svg_4" y="346" x="290" stroke-width="0" stroke="#000" fill="#000000">strength:',profile.strength.toString(),'</text>',
			'</g>',
			'</svg>'
		);

		return string(
			abi.encodePacked(
				"data:image/svg+xml;base64,",
				Base64.encode(svg)
			)    
		);
	}

	function getProfile(uint256 tokenId) public view returns (CharacterProfile memory) {
		return  tokenIdToLevels[tokenId];
	}

	function getTokenURI(uint256 tokenId) public view returns (string memory){
    	bytes memory dataURI = abi.encodePacked(
    	    '{',
    	        '"name": "Chain Battles #', tokenId.toString(), '",',
    	        '"description": "Battles on chain",',
    	        '"image": "', generateCharacter(tokenId), '"',
    	    '}'
    	);
    	return string(
    	    abi.encodePacked(
    	        "data:application/json;base64,",
    	        Base64.encode(dataURI)
    	    )
    	);
	}

	function mint() public {
		_tokenIds.increment();
		uint256 newItemId = _tokenIds.current();
		_safeMint(msg.sender, newItemId);
		tokenIdToLevels[newItemId] = CharacterProfile(randomNumber(),randomNumber(),randomNumber());
		_setTokenURI(newItemId, getTokenURI(newItemId));
	}

	function train(uint256 tokenId) public {
    	require(_exists(tokenId), "Please use an existing token");
    	require(ownerOf(tokenId) == msg.sender, "You must own this token to train it");
    	
		CharacterProfile memory profile = tokenIdToLevels[tokenId];
		uint256 currentLevel = profile.level;
		uint256 currentStrength = profile.strength;
		uint256 currentSpeed = profile.speed;

    	tokenIdToLevels[tokenId] = CharacterProfile(currentStrength + 1, currentLevel + 1, currentSpeed + 1);

    	_setTokenURI(tokenId, getTokenURI(tokenId));
	}

}
