const web3 = new Web3(window.ethereum);

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadMarketplaceItems() {
    try {
        const itemCount = await contract.methods.getTotalItemCount().call();
        let itemsDisplay = '<table><thead><tr><th>ID</th><th>Title</th><th>Description</th><th>Price (ETH)</th><th>Seller</th><th>Owner</th><th>Status</th><th>Actions</th></tr></thead><tbody>';

        for (let i = 0; i < itemCount; i++) {
            await sleep(200);
            const item = await contract.methods.getItemDetails(i).call();
            itemsDisplay += `<tr><td>${item.id}</td><td>${item.title}</td><td>${item.description}</td><td>${web3.utils.fromWei(item.price, 'ether')}</td><td>${item.seller}</td><td>${item.owner}</td><td>${item.isSold ? 'Sold' : 'Available'}</td><td>${!item.isSold ? `<button class="buy-button" data-item-id="${item.id}">Buy</button>` : 'N/A'}</td></tr>`;
        }
        itemsDisplay += '</tbody></table>';
        document.getElementById('marketplaceItems').innerHTML = itemsDisplay;
        document.querySelectorAll('.buy-button').forEach(button => button.addEventListener('click', (e) => purchaseItem(e.target.getAttribute('data-item-id'))));
    } catch (error) {
        console.error('Error loading marketplace items:', error);
    }
}

async function purchaseItem(itemId) {
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const itemDetails = await contract.methods.getItemDetails(itemId).call();
        const response = await contract.methods.purchaseItem(itemId).send({ from: ethereum.selectedAddress, value: itemDetails.price });
        console.log('Purchase successful:', response);
        alert(`Item ${itemId} purchased successfully!`);
        loadMarketplaceItems(); // Reload the items list
    } catch (error) {
        console.error('Error purchasing item:', error);
        alert(`Failed to purchase item: ${error.message}`);
    }
}

async function listNewItem() {
    const title = document.getElementById('itemTitle').value;
    const description = document.getElementById('itemDescription').value;
    const price = document.getElementById('itemPrice').value; // Ensure this is in wei
    if (!title || !description || !price) {
        alert('Please fill in all fields');
        return;
    }
    try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const response = await contract.methods.listNewItem(title, description, price).send({ from: ethereum.selectedAddress });
        console.log('Item listed successfully:', response);
        alert('Item listed successfully!');
        document.getElementById('itemTitle').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('itemPrice').value = '';
        loadMarketplaceItems(); // Reload the items list
    } catch (error) {
        console.error('Error listing item:', error);
        alert(`Failed to list item: ${error.message}`);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    loadMarketplaceItems();
});


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



// async function setDataInContract(data) {
//     try {
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const from = accounts[0];
//         const encodedData = web3.utils.utf8ToHex(data);
//         const defaultGasLimit = '0x300000';

//         const txObject = {
//             from: from,
//             to: contractAddress,
//             data: encodedData,
//             gas: defaultGasLimit,
//         };

//         const transactionHash = await ethereum.request({
//             method: 'eth_sendTransaction',
//             params: [txObject],
//         });

//         console.log('Transaction sent. Hash:', transactionHash);
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }


