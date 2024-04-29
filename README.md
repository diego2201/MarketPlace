# DApp Etherum Marketplace - Spring 2024
This project is an Ethereum-based Marketplace Interface that enables users to interact with a smart contract to allows them to list items for sale, purchase them, and view item details directly from their browser using their MetaMask account. <br /> <br />
<strong>Please Note</strong> That for this website you will need to wait a few seconds (and maybe even just reload the page) to see changes to the listing appear. 

## What is needed to use
All you need installed to use this website application is the Metamask extension. In order to download this (on Google Chrome) go to the following link: [Metamask Extension Chrome Download](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
 <br /> <br />
Once installed you just need to make an account. Once created you will need some Sepolia testnet coins to be able to actually interact with the Marketplace. You can obtain some using the following faucet site: [Sepolia Faucet](https://sepolia-faucet.pk910.de/#/claim/2b9f1b9c-883e-4f68-b9f8-7239a31f4a73) <br /> <br />
Now you will be able to interact with the website! <br />

# Code Documentation 
## Solidity Contract 
The MarketPlace.sol is the contract created that our website uses to interact with the Etherum network. It is designed to manage this DApp marketplace where items can be listed, sold, and purchased. The contract includes struct data structures (Item and Account) to keep track of each item's properties (such as its ID number, the name, any additional descriptions, its listing price, seller's address, owner's address, and its sold status) and each account information (such as their current balance and their purchased items). It uses mappings to link item IDs to their details and user addresses to their accounts. The contract allows users to list new items for sale and purchase available items while ensuring transactions are valid through various checks. Events are emitted for item purchases and for debugging purposes to log important state changes and financial transactions. This helps with the frontend integration. <br /><br />

<strong>MarketPlace.sol</strong>
* `listNewItem(string memory _title, string memory _description, uint256 _price)` This method initializes a new Item struct with provided details and sets the seller and initial owner to the message sender. It then increments the counter for the next item ID.
* `purchaseItem(uint256 itemId)` This method transfers ownership of the item to the buyer, marks it as sold, and updates the buyer's account balance. The sale amount is transferred to the seller's account. Emits an event for each purchase and logs debug information.
* `getItemDetails(uint256 itemId)` The function returns all attributes of the Item struct, including ID, seller, owner, title, description, price, and sold status. makes sure to chec that the requested item does in fact exists.
* `getTotalItemCount()` This method returns the total number of items listed in the marketplace.

npm install web3  