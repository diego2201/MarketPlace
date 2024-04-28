const web3 = new Web3(window.ethereum);

const contractABI = [
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
    {
        "constant": true,
        "inputs": [],
        "name": "getTotalItemCount",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

const contractAddress = '0xA897431171E2C508D75AE6AA327F776709A36e83';
//const contractAddress = '0xeE1Ab6F5aD7c60cdFcc5f8d334E85F98fBCEcCb2';
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function loadMarketplaceItems() {
    const itemCount = await contract.methods.getTotalItemCount().call();
    let itemsDisplay = "<table><thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Price (ETH)</th><th>Seller</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead><tbody>";

    for (let i = 0; i < itemCount; i++) {
        const item = await contract.methods.getItemDetails(i).call();
        itemsDisplay += `<tr><td>${item.id}</td><td>${item.title}</td><td>${item.description}</td><td>${web3.utils.fromWei(item.price, 'ether')}</td><td>${item.seller}</td><td>${item.owner}</td><td>${item.isSold ? 'Sold' : 'Available'}</td><td>${!item.isSold ? `<button class="buy-button" data-item-id="${item.id}">Buy</button>` : 'N/A'}</td></tr>`;
    }

    itemsDisplay += "</tbody></table>";
    document.getElementById('marketplaceItems').innerHTML = itemsDisplay;

    Array.from(document.getElementsByClassName('buy-button')).forEach(button => {
        button.addEventListener('click', function() {
            purchaseItem(this.getAttribute('data-item-id'));
        });
    });
}

function subscribeToEvents() {
    contract.events.ItemListed({
        fromBlock: 0
    })
    .on('data', function(event) {
        console.log('New item listed:', event.returnValues);
        loadMarketplaceItems();
    })
    .on('error', console.error);

    contract.events.ItemPurchased({
        fromBlock: 0
    })
    .on('data', function(event) {
        console.log('Item purchased:', event.returnValues);
        loadMarketplaceItems();
    })
    .on('error', console.error);
}

window.addEventListener('load', function() {
    loadMarketplaceItems();
    subscribeToEvents();
});

// Implementation of purchaseItem, listNewItem, connectMetamask, and displayAccountInfo would remain unchanged from your current setup


async function purchaseItem(itemId) {
    try {
        // Request account access from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Instead of using contract.methods.call(), which might use Infura depending on your Web3 setup,
        // use MetaMask's request method to make the call directly through the user's wallet extension.
        // This assumes that `contract` is a web3.eth.Contract instance initialized with MetaMask's provider.

        // Encode the call to the method getItemDetails
        const data = contract.methods.getItemDetails(itemId).encodeABI();

        // Use MetaMask to call the contract and get the item details
        const itemDetails = await window.ethereum.request({
            method: 'eth_call',
            params: [{
                to: contract.options.address,
                data: data
            }],
            from: from
        });

        // Decode the returned data from the call
        const decodedItemDetails = web3.eth.abi.decodeParameters(['uint256', 'address', 'address', 'string', 'string', 'uint256', 'bool'], itemDetails);
        const itemPrice = decodedItemDetails[5];

        // Send the purchase transaction
        const txParams = {
            from: from,
            to: contract.options.address,
            data: contract.methods.purchaseItem(itemId).encodeABI(),
            value: web3.utils.toHex(itemPrice), // Convert the price to hex value
            gas: web3.utils.toHex(await contract.methods.purchaseItem(itemId).estimateGas({ from: from, value: itemPrice })),
        };

        // Use MetaMask to send the transaction
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



async function listNewItem() {
    try {
        const title = document.getElementById('itemTitle').value;
        const description = document.getElementById('itemDescription').value;
        const price = document.getElementById('itemPrice').value; // Ensure this is in wei before passing

        if (!title || !description || !price) {
            alert('Please fill in all fields');
            return;
        }

        // Request account access from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Encode the ABI for the listNewItem function call
        const data = contract.methods.listNewItem(title, description, price).encodeABI();

        // Prepare transaction parameters
        const txParams = {
            from: from,
            to: contract.options.address,
            data: data,
            gas: web3.utils.toHex(await contract.methods.listNewItem(title, description, price).estimateGas({ from: from })),
        };

        // Send the transaction using MetaMask
        const txHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams],
        });

        console.log('Item listed successfully:', txHash);
        alert(`Item listed successfully! Transaction Hash: ${txHash}`);

        // Optionally, clear inputs after successful transaction
        document.getElementById('itemTitle').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('itemPrice').value = '';
    } catch (error) {
        console.error('Error listing item:', error);
        alert(`Failed to list item: ${error.message}`);
    }
}


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

async function displayAccountInfo(account) {
    const balance = await web3.eth.getBalance(account);
    const balanceInEther = web3.utils.fromWei(balance, 'ether');
    document.getElementById('userBalance').textContent = parseFloat(balanceInEther).toFixed(4);
}