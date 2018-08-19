pragma solidity ^0.4.17;

contract Purchase {

	// array of addresses for people who can purchase
	address[16] public purchasers;

	// TODO: Should there be a one to one relationship between purchasers and items?
	// Enable multiple purchasers of the same item
	// Enable multiple items to be purchased
	function purchase(uint itemId) public payable returns (uint) {

		// assume 20 items numbered 0 through 19
		require(itemId >= 0 && itemId <= 19);

		// identify the purchaser
		purchasers[itemId] = msg.sender;

		return itemId;
	}

	// return all the purchasers
	function getPurchasers() public view returns (address[16]) {
		return purchasers;
	}
}