// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Contract named 'Marketplace' to manage items for sale
contract Marketplace {
    // Struct to represent an item in the marketplace
    struct Item {
        uint256 id; // Unique identifier for each item
        address payable seller; // Address of the seller
        address payable owner; // Address of the current owner
        string title; // Title of the item
        string description; // Description of the item
        uint256 price; // Price of the item in wei
        bool isSold; // Status to check if the item is sold
    }

    // Struct to represent an account with balance and items purchased
    struct Account {
        uint256 balance; // Balance of the account in wei
        uint256[] purchasedItems; // List of item IDs that have been purchased
    }

    // Mapping from item ID to the Item struct
    mapping(uint256 => Item) public items;
    // Mapping from user's address to their Account struct
    mapping(address => Account) public accounts;
    // Counter to keep track of the next item ID
    uint256 public nextItemId;

    // Event emitted when an item is purchased
    event ItemPurchased(uint256 indexed itemId, address indexed buyer);
    // Event for debugging, logs an address and a balance
    event DebugLog(address indexed account, uint256 balance);

    // Modifier to check that the function caller is logged in (not the zero address)
    modifier onlyLoggedIn {
        require(msg.sender != address(0), "Not logged in");
        _;
    }

    // Function to list a new item for sale
    function listNewItem(string memory _title, string memory _description, uint256 _price) external {
        require(_price > 0, "Price must be at least 1 wei");
        Item storage newItem = items[nextItemId]; // Access the next item in the map
        newItem.id = nextItemId; // Set the item ID
        newItem.seller = payable(msg.sender); // Set the seller to the message sender
        newItem.owner = payable(msg.sender); // Initially, the seller is also the owner
        newItem.title = _title; // Set the item title
        newItem.description = _description; // Set the item description
        newItem.price = _price; // Set the item price
        newItem.isSold = false; // Set the item as not sold

        nextItemId++; // Increment the ID for the next item
    }

    // Function to purchase an item
    function purchaseItem(uint256 itemId) public payable onlyLoggedIn {
        require(itemId < nextItemId, "Item does not exist"); // Check if the item exists
        Item storage item = items[itemId]; // Get the item from storage
        require(!item.isSold, "Item is already sold"); // Ensure the item is not already sold
        require(msg.sender != item.seller, "Seller cannot buy their own item"); // Prevent seller from buying their own item
        require(msg.value == item.price, "Please submit the asking price in order to complete the purchase"); // Ensure correct payment

        emit DebugLog(msg.sender, msg.value); // Emit a debug log

        item.owner = payable(msg.sender); // Transfer ownership to the buyer
        item.isSold = true; // Mark the item as sold

        accounts[msg.sender].balance += msg.value; // Update the buyer's account balance
        accounts[msg.sender].purchasedItems.push(itemId); // Add the item to the buyer's purchased items

        item.seller.transfer(msg.value); // Transfer the funds to the seller
        emit DebugLog(item.seller, item.seller.balance); // Log the seller's balance after the transfer

        emit ItemPurchased(itemId, msg.sender); // Emit the purchase event
    }


    // Function to retrieve details of a specific item by its ID
    function getItemDetails(uint256 itemId) public view returns (uint256, address, address, string memory, string memory, uint256, bool) {
        require(itemId < nextItemId, "Item does not exist"); // Check if the item exists
        Item storage item = items[itemId]; // Access the item
        return (item.id, item.seller, item.owner, item.title, item.description, item.price, item.isSold); // Return the details
    }

    // Function to get the total number of items listed in the marketplace
    function getTotalItemCount() public view returns (uint256) {
        return nextItemId; // Return the count of items
    }
}
