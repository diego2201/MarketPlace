# DApp Etherum Marketplace - Spring 2024
This project is an Ethereum-based Marketplace Interface that enables users to interact with a smart contract to allows them to list items for sale, purchase them, and view item details directly from their browser using their MetaMask account. <br /> <br />
<strong>Please Note</strong> That for this website you will need to wait a few seconds (and maybe even just reload the page) to see changes to the listing appear. 

## Website Link
https://diego2201.github.io/MarketPlace/

## Prerequisits 
<strong>To use website </strong> <br />
All you need installed to use this website application is the Metamask extension. In order to download this (on Google Chrome) go to the following link: [Metamask Extension Chrome Download](https://chromewebstore.google.com/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
 <br /> <br />
Once installed you just need to make an account. Once created you will need some Sepolia testnet coins to be able to actually interact with the Marketplace. You can obtain some using the following faucet site: [Sepolia Faucet](https://sepolia-faucet.pk910.de/#/claim/2b9f1b9c-883e-4f68-b9f8-7239a31f4a73) <br /> <br />
Now you will be able to interact with the website! <br />

<strong>To Recreate Project</strong> <br />
Make sure you have the following installed on your local machine: 
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (v6 or higher)
- [Web3](https://www.npmjs.com/package/web3)
- [Metamask](https://metamask.io/download/) 


## Setting up Project 

1. Clone the repo or download the zip file:
```
git clone https://github.com/diego2201/MarketPlace.git
```

2. Now you can CD into the directory and begin working: 
```
cd MarketPlace
```

3. Now you will need to install the necessary Node.js modules

```
npm install
npm install web3 
```

4. To view any changes you can create your own github pages repo. 

# Code Documentation 
## Solidity Contract 
The MarketPlace.sol is the contract created that our website uses to interact with the Etherum network. It is designed to manage this DApp marketplace where items can be listed, sold, and purchased. The contract includes struct data structures (Item and Account) to keep track of each item's properties (such as its ID number, the name, any additional descriptions, its listing price, seller's address, owner's address, and its sold status) and each account information (such as their current balance and their purchased items). It uses mappings to link item IDs to their details and user addresses to their accounts. The contract allows users to list new items for sale and purchase available items while ensuring transactions are valid through various checks. Events are emitted for item purchases and for debugging purposes to log important state changes and financial transactions. This helps with the frontend integration. <br /><br />

<strong>MarketPlace.sol</strong>
* `listNewItem(string memory _title, string memory _description, uint256 _price)`: This method initializes a new Item struct with provided details and sets the seller and initial owner to the message sender. It then increments the counter for the next item ID.
* `purchaseItem(uint256 itemId)`: This method transfers ownership of the item to the buyer, marks it as sold, and updates the buyer's account balance. The sale amount is transferred to the seller's account. Emits an event for each purchase and logs debug information.
* `getItemDetails(uint256 itemId)`: The function returns all attributes of the Item struct, including ID, seller, owner, title, description, price, and sold status. makes sure to chec that the requested item does in fact exists.
* `getTotalItemCount()`: This method returns the total number of items listed in the marketplace.

## Frontend
The frontend encompasses the JavaScript, HTML, and CSS fiels. In the JavaScript code we utilize the Web3.js library to interact with an Ethereum blockchain through the MarketPlace.sol smart contract from a web interface. It integrates with MetaMask, to enable users to list items for sale, purchase items, and view detailed information about items directly from their browsers and signs off on any actions using their account that is linked with MetaMask. The code defines several functions to interact with the smart contract, including listing new items, purchasing items, and fetching detailed information and total count of items available in the marketplace. The script automatically loads marketplace items when the webpage is loaded. <br /><br />

<strong>market.js</strong> <br />
This file contains most of the functions that help interact with the smart contract and connects that to the website. For example it reads all of the current listings from the smart contract and displays that to the user. <br />

* `loadMarketplaceItems()`: Fetches and displays all the items listed in the marketplace. It retrieves the total number of items from the smart contract, iterates through each item to get its details, and constructs a dynamic HTML table displaying each item's properties and a buy button if the item is available.
* `checkItemStatusAndCount()`: Function to check if there are any new listings, or if the sell status of any current itme has been changed. This helps facilitate the resfreshing of the page automatically upon any of these changes.
* `purchaseItem(itemId)`: Handles the purchase of an item. It initiates a transaction to buy an item specified by its ID. The function requests the current user's account details from MetaMask, retrieves item details from the smart contract, prepares transaction parameters including the item's price, and sends the transaction to the blockchain through MetaMask.
* `listNewItem()`: Allows a user to list a new item for sale in the marketplace. It collects item details from the user input, validates them, and sends a transaction to the smart contract to create a new item entry. It also handles user authentication via MetaMask and estimates the necessary gas for the transaction.
* `connectMetamask()`: Connects to the MetaMask wallet to authenticate the user and fetch their account details. It ensures the user can interact with the smart contract by confirming that they are logged into MetaMask and displaying their address and connection status.
* `displayAccountInfo(account)`: Displays the Ethereum account balance of the connected MetaMask user. It fetches the balance, converts it from wei to ether for readability, and updates the user interface with the current balance information.
<br />

<strong>index.html</strong> <br />
This HTML structure provides a user-friendly interface to interact with a blockchain-based marketplace, leveraging Web3 technologies to handle transactions and account management seamlessly in a decentralized environment. <br />

Main Components: <br />
* `Banner (<div class="banner">)`: Displays a title ("Marketplace Web3 Interface") and houses user interaction elements like account information and connection status.
* `Connection and Account Info (<div id="accountInfo">)`:
Connect Button: A button that triggers the connectMetamask() function when clicked, attempting to connect to the user's MetaMask wallet. <br />
Connection Status: Displays whether the user is connected to MetaMask. <br />
User Address and Balance: Shows the connected Ethereum address and balance in Ether. <br />
* `Item Listing Form (<div id="listItemForm">)`: Provides input fields for listing a new item in the marketplace (title, description, and price in Wei). Includes a button that triggers the listNewItem() function to submit the item details to the blockchain.
* `Refresh Button (<button class="marketplaceBttn">)`: Allows users to manually refresh the list of items in the marketplace by invoking the loadMarketplaceItems() function.
* `Marketplace Items Display (<div id="marketplaceItems">)`: 
A container where all marketplace items are dynamically displayed. This area is updated with content generated by the loadMarketplaceItems() function which fetches and displays marketplace items from the blockchain.

Scripts: <br />
* `Web3.js Import`: Includes the Web3.js library from a content delivery network (CDN), which is essential for interacting with Ethereum blockchain directly from the browser.
* `Custom JavaScript File (market.js)`: Contains the logic to interact with the Ethereum blockchain using the smart contract's ABI and address. It handles UI updates based on blockchain interactions like listing items, purchasing, and displaying account balances.
<br />

<strong>styles.css</strong> <br />
* `.banner`: Sets a dark red background color and white text.
Applies flexbox layout, stacking child elements vertically and aligning them to the start (left side). Adds padding around the content within the banner for spacing.
* `.banner h1`: Removes the default margin from the h1 element to allow for tighter spacing control within the banner.
* `.connection-status`: Uses flexbox to lay out child elements horizontally and center-aligns them vertically.
Adds a margin below itself for spacing between the connection status and the account info.
* `.metamask-button`: Displays the MetaMask logo as a background image, covering the button entirely. Sets specific dimensions for the button and removes the border for a cleaner appearance. Changes the cursor to a pointer to indicate it's clickable and adds a right margin for spacing from adjacent text.
* `#accountInfo p`: Removes default margins from paragraphs within the account information section for uniform alignment.
Aligns text to the left.
* `.item`: Applies a border, padding, and a light gray background color to each item container. Adds margin to the bottom of each item for separation.
* `table`: Ensures the table fills the available width and collapses borders between cells for a seamless look.
* `th, td`: Defines common styling for table headers and cells, including padding, text alignment, and border. Sets a light gray background for header cells.
* `tr:nth-child(even)`: Applies a light gray background to every even row for better readability.
* `.buy-button`: Styles the buy button with a green background, white text, and no border. Expands slightly and changes background color on hover to enhance interactive feedback.


npm install web3  