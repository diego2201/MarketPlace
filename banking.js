// Ensure web3 is initialized properly with MetaMask's provider
if (window.ethereum) {
    web3 = new Web3(window.ethereum);
    try {
        // Request account access if needed
        await window.ethereum.request({ method: 'eth_requestAccounts' });
    } catch (error) {
        console.error('User denied account access:', error);
    }
} else {
    console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
}

const contractABI = [
    // ListNewItem
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
    // PurchaseItem
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
    // GetItemDetails
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
    // GetTotalItemCount
    {
        "constant": true,
        "inputs": [],
        "name": "getTotalItemCount",
        "outputs": [
            {"name": "", "type": "uint256"}
        ],
        "stateMutability": "view",
        "type": "function"
    }
];


const contractAddress = '0xA897431171E2C508D75AE6AA327F776709A36e83';
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function loadMarketplaceItems() {
    try {
        const itemCount = parseInt(await contract.methods.getTotalItemCount().call(), 10);
        let itemsDisplay = '';

        for (let i = 0; i < itemCount; i++) {
            const item = await contract.methods.getItemDetails(i).call();
            itemsDisplay += `
                <div class="item">
                    <p><strong>ID:</strong> ${item.id}</p>
                    <p><strong>Title:</strong> ${item.title}</p>
                    <p><strong>Description:</strong> ${item.description}</p>
                    <p><strong>Price:</strong> ${web3.utils.fromWei(item.price, 'ether')} ETH</p>
                    <p><strong>Owner:</strong> ${item.owner}</p>
                    <p><strong>Seller:</strong> ${item.seller}</p>
                    <p><strong>Sold:</strong> ${item.isSold ? 'Yes' : 'No'}</p>
                    ${!item.isSold ? `<button class="buy-button" data-item-id="${item.id}">Buy</button>` : ''}
                </div>
            `;
        }

        const marketplaceItems = document.getElementById('marketplaceItems');
        marketplaceItems.innerHTML = itemsDisplay;

        // Attach event listeners to buy buttons after rendering
        marketplaceItems.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', function() {
                purchaseItem(this.getAttribute('data-item-id'));
            });
        });
    } catch (error) {
        console.error('Error loading marketplace items:', error);
    }
}

async function purchaseItem(itemId) {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const itemPrice = await contract.methods.getItemDetails(itemId).call().then(item => item.price);
        const valueHex = web3.utils.toHex(itemPrice);

        const purchaseData = contract.methods.purchaseItem(itemId).encodeABI();

        const txObject = {
            from: accounts[0],
            to: contractAddress,
            data: purchaseData,
            value: valueHex,
            gas: 3000000 // Set a sufficient gas limit for the transaction
        };

        console.log('Sending transaction:', txObject);
        const transactionHash = await window.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txObject],
        });

        console.log('Transaction sent. Hash:', transactionHash);
        alert(`Item ${itemId} purchased successfully!`);
        loadMarketplaceItems(); // Optionally refresh the item list
    } catch (error) {
        console.error('Error purchasing item:', error);
        alert(`Failed to purchase item: ${error.message}`);
    }
}

window.addEventListener('load', loadMarketplaceItems);