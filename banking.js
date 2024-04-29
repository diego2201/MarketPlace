// Initialize Web3 with Ethereum provider from MetaMask
const web3 = new Web3(window.ethereum);

// Define the contract ABI (Application Binary Interface)
const contractABI = [
    // ABI definition for listing a new item
    {
        "constant": false,
        "inputs": [
            {"name": "_title", "type": "string"},
            {"name": "_description", "type": "string"},
            {"name": "_price", "type": "uint256"}
        ],
        "name": "listNewItem",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    // ABI definition for purchasing an item
    {
        "constant": false,
        "inputs": [
            {"name": "itemId", "type": "uint256"}
        ],
        "name": "purchaseItem",
        "outputs": [],
        "payable": true,
        "stateMutability": "payable",
        "type": "function"
    },
    // ABI definition for retrieving item details
    {
        "constant": true,
        "inputs": [
            {"name": "itemId", "type": "uint256"}
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
        "stateMutability": "view",
        "type": "function"
    },
    // ABI definition for getting the total item count in the marketplace
    {
        "constant": true,
        "inputs": [],
        "name": "getTotalItemCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Define the smart contract address (on the Ethereum blockchain)
const contractAddress = '0xA897431171E2C508D75AE6AA327F776709A36e83';
const contract = new web3.eth.Contract(contractABI, contractAddress);

// Load marketplace items on the web page
async function loadMarketplaceItems() {
    const itemCount = await contract.methods.getTotalItemCount().call(); // Call the smart contract to get the item count
    let itemsDisplay = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Description</th>
                    <th>Price (ETH)</th>
                    <th>Seller</th>
                    <th>Owner</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

    for (let i = 0; i < itemCount; i++) {
        const item = await contract.methods.getItemDetails(i).call(); // Retrieve each item's details
        itemsDisplay += `
            <tr>
                <td>${item.id}</td>
                <td>${item.title}</td>
                <td>${item.description}</td>
                <td>${web3.utils.fromWei(item.price, 'ether')}</td>
                <td>${item.seller}</td>
                <td>${item.owner}</td>
                <td>${item.isSold ? 'Sold' : 'Available'}</td>
                <td>${!item.isSold ? `<button class="buy-button" data-item-id="${item.id}">Buy</button>` : 'N/A'}</td>
            </tr>`;
    }

    itemsDisplay += "</tbody></table>";
    document.getElementById('marketplaceItems').innerHTML = itemsDisplay; // Inject the HTML into the DOM

    document.querySelectorAll('.buy-button').forEach(button => {
        button.addEventListener('click', function() {
            purchaseItem(this.getAttribute('data-item-id')); // Add event listeners to all buy buttons
        });
    });
}

// This function initializes loading of marketplace items when the window loads
window.addEventListener('load', function() {
    loadMarketplaceItems();
});

// Function to handle the purchase of an item
async function purchaseItem(itemId) {
    try {
        // Request account access from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Encode the call to retrieve item details
        const data = contract.methods.getItemDetails(itemId).encodeABI();

        // Call the contract to get the item details
        const itemDetails = await window.ethereum.request({
            method: 'eth_call',
            params: [{
                to: contract.options.address,
                data: data
            }],
            from: from
        });

        // Decode the returned data
        const decodedItemDetails = web3.eth.abi.decodeParameters(['uint256', 'address', 'address', 'string', 'string', 'uint256', 'bool'], itemDetails);
        const itemPrice = decodedItemDetails[5];

        // Prepare the transaction parameters for the purchase
        const txParams = {
            from: from,
            to: contract.options.address,
            data: contract.methods.purchaseItem(itemId).encodeABI(),
            value: web3.utils.toHex(itemPrice),
            gas: web3.utils.toHex(await contract.methods.purchaseItem(itemId).estimateGas({ from: from, value: itemPrice })),
        };

        // Send the transaction via MetaMask
        const transactionHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
        });

        console.log('Purchase successful:', transactionHash);
        alert(`Item ${itemId} purchased successfully! Transaction Hash: ${transactionHash}`);
    } catch (error) {
        console.error('Error purchasing item:', error);
        alert(`Failed to purchase item: ${error.message}`);
    }
}

// Function to list a new item in the marketplace
async function listNewItem() {
    try {
        const title = document.getElementById('itemTitle').value;
        const description = document.getElementById('itemDescription').value;
        const price = document.getElementById('itemPrice').value;

        if (!title || !description || !price) {
            alert('Please fill in all fields');
            return;
        }

        // Request account access from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Encode the transaction data
        const data = contract.methods.listNewItem(title, description, price).encodeABI();

        // Transaction parameters
        const txParams = {
            from: from,
            to: contract.options.address,
            data: data,
            gas: web3.utils.toHex(await contract.methods.listNewItem(title, description, price).estimateGas({ from: from })),
        };

        // Send the transaction via MetaMask
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
        });

        console.log('Item listed successfully:', txHash);
        alert(`Item listed successfully! Transaction Hash: ${txHash}`);

        // Clear the form inputs after successful submission
        document.getElementById('itemTitle').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('itemPrice').value = '';
    } catch (error) {
        console.error('Error listing item:', error);
        alert(`Failed to list item: ${error.message}`);
    }
}

// Function to connect to MetaMask wallet
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

// Function to display the account information
async function displayAccountInfo(account) {
    let lastBalance = null;

    async function updateBalance() {
        const balance = await web3.eth.getBalance(account);
        if (balance !== lastBalance) {
            const balanceInEther = web3.utils.fromWei(balance, 'ether');
            document.getElementById('userBalance').textContent = parseFloat(balanceInEther).toFixed(4);
            lastBalance = balance;
        }
    }

    updateBalance(); // Run immediately to update balance
    setInterval(updateBalance, 10000); // Check every 10 seconds
}

// Usage
connectMetamask().then(() => {
    const account = web3.eth.accounts[0]; // Assuming the account is available after connecting
    displayAccountInfo(account);
});
