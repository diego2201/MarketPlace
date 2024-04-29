// Initialize a Web3 instance using the MetaMask provider.
const web3 = new Web3(window.ethereum);

// Define the ABI for the smart contract to interact with it.
const contractABI = [
    {
        // Function to list a new item in the marketplace.
        "constant": false,
        "inputs": [
            {"name": "_title", "type": "string"},  // Title of the item
            {"name": "_description", "type": "string"},  // Description of the item
            {"name": "_price", "type": "uint256"}  // Price of the item in wei
        ],
        "name": "listNewItem",
        "outputs": [],  // No output returned from this function
        "stateMutability": "nonpayable",  // Indicates that this function does not accept Ether
        "type": "function"
    },
    {
        // Function to purchase an item, marking it as sold and transferring ownership.
        "constant": false,
        "inputs": [
            {"name": "itemId", "type": "uint256"}  // ID of the item to purchase
        ],
        "name": "purchaseItem",
        "outputs": [],  // No output returned from this function
        "payable": true,  // Indicates that this function can receive Ether
        "stateMutability": "payable",  // This function can accept and handle Ether
        "type": "function"
    },
    {
        // Function to retrieve details about a specific item by its ID.
        "constant": true,
        "inputs": [
            {"name": "itemId", "type": "uint256"}  // ID of the item to get details for
        ],
        "name": "getItemDetails",
        "outputs": [
            {"name": "id", "type": "uint256"},
            {"name": "seller", "type": "address"},
            {"name": "owner", "type": "address"},
            {"name": "title", "type": "string"},
            {"name": "description", "type": "string"},
            {"name": "price", "type": "uint256"},
            {"name": "isSold", "type": "bool"}
        ],
        "stateMutability": "view",  // Indicates that this function does not modify state
        "type": "function"
    },
    {
        // Function to get the total count of items currently available in the marketplace.
        "constant": true,
        "inputs": [],
        "name": "getTotalItemCount",
        "outputs": [{"name": "", "type": "uint256"}],  // Returns the total number of items
        "stateMutability": "view",  // Does not alter the state, only views data
        "type": "function"
    }
];


// The smart contract address on the blockchain.
const contractAddress = '0xA897431171E2C508D75AE6AA327F776709A36e83';
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Load marketplace items and populate the UI.
async function loadMarketplaceItems() {
    const itemCount = await contract.methods.getTotalItemCount().call();
    let itemsDisplay = `<table><thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Price (ETH)</th><th>Seller</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;

    for (let i = 0; i < itemCount; i++) {
        const item = await contract.methods.getItemDetails(i).call();
        itemsDisplay += `<tr><td>${item.id}</td><td>${item.title}</td><td>${item.description}</td><td>${web3.utils.fromWei(item.price, 'ether')}</td><td>${item.seller}</td><td>${item.owner}</td><td>${item.isSold ? 'Sold' : 'Available'}</td><td>${!item.isSold ? `<button class="buy-button" data-item-id="${item.id}">Buy</button>` : 'N/A'}</td></tr>`;
    }

    itemsDisplay += "</tbody></table>";
    document.getElementById('marketplaceItems').innerHTML = itemsDisplay;

    // Attach event listeners to buy buttons.
    Array.from(document.getElementsByClassName('buy-button')).forEach(button => {
        button.addEventListener('click', function() {
            purchaseItem(this.getAttribute('data-item-id'));
        });
    });
}

// Listen for the DOMContentLoaded event to trigger loading marketplace items.
window.addEventListener('DOMContentLoaded', loadMarketplaceItems);

// Purchase an item from the marketplace.
async function purchaseItem(itemId) {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];
        const data = contract.methods.getItemDetails(itemId).encodeABI();
        const itemDetails = await window.ethereum.request({method: 'eth_call', params: [{to: contract.options.address, data: data}], from: from});
        const decodedItemDetails = web3.eth.abi.decodeParameters(['uint256', 'address', 'address', 'string', 'string', 'uint256', 'bool'], itemDetails);
        const itemPrice = decodedItemDetails[5];
        const txParams = {from: from, to: contract.options.address, data: contract.methods.purchaseItem(itemId).encodeABI(), value: web3.utils.toHex(itemPrice), gas: web3.utils.toHex(await contract.methods.purchaseItem(itemId).estimateGas({ from: from, value: itemPrice }))};
        const transactionHash = await window.ethereum.request({method: 'eth_sendTransaction', params: [txParams]});
        console.log('Purchase successful:', transactionHash);
        alert(`Item ${itemId} purchased successfully! Transaction Hash: ${transactionHash}`);
    } catch (error) {
        console.error('Error purchasing item:', error);
        alert(`Failed to purchase item: ${error.message}`);
    }
}

// Connect to MetaMask wallet.
async function connectMetamask() {
    if (window.ethereum) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected to MetaMask:', accounts);
            displayAccountInfo(accounts[0]);
            document.getElementById('connection-text').textContent = 'Connected';
            document.getElementById('userAddress').textContent = accounts[0];
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
            document.getElementById('connection-text').textContent = 'Connection failed';
        }
    } else {
        console.error('MetaMask not detected or installed.');
    }
}

// Display account information.
async function displayAccountInfo(account) {
    const balance = await web3.eth.getBalance(account);
    const balanceInEther = web3.utils.fromWei(balance, 'ether');
    document.getElementById('userBalance').textContent = parseFloat(balanceInEther).toFixed(4);
}
