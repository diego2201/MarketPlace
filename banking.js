const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const web3 = new Web3(infuraUrl);

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

        // Attach event listeners to buy buttons
        marketplaceItems.querySelectorAll('.buy-button').forEach(button => {
            button.addEventListener('click', function() {
                purchaseItem(this.getAttribute('data-item-id'));
            });
        });
    } catch (error) {
        console.error('Error loading marketplace items:', error);
    }
}

window.addEventListener('load', loadMarketplaceItems);

async function purchaseItem(itemId) {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Fetch the price of the item directly from the contract
        const item = await contract.methods.getItemDetails(itemId).call();
        const itemPrice = item.price;

        // Ensure that the price is formatted as a hex string
        const valueHex = web3.utils.toHex(itemPrice);

        // Encode the function call to the contract
        const purchaseData = contract.methods.purchaseItem(itemId).encodeABI();

        const txObject = {
            from: from,
            to: contractAddress,
            data: purchaseData,
            value: valueHex, // Ensure value is in hex format
            gas: 3000000 // Set a sufficient gas limit for the transaction
        };

        // Send the transaction via MetaMask
        const transactionHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [txObject],
        });

        console.log('Transaction sent. Hash:', transactionHash);
        alert(`Item ${itemId} purchased successfully!`);

        // Optionally, refresh items or make UI updates here
        loadMarketplaceItems();
    } catch (error) {
        console.error('Error purchasing item:', error);
        alert(`Failed to purchase item: ${error.message}`);
    }
}

async function listNewItem() {
    try {
        const title = document.getElementById('itemTitle').value;
        const description = document.getElementById('itemDescription').value;
        const price = document.getElementById('itemPrice').value;

        if (!title || !description || !price) {
            alert('Please fill in all fields');
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Call the listNewItem function of the contract
        const receipt = await contract.methods.listNewItem(title, description, price).send({
            from: from,
            gas: 3000000 // Adjust gas limit based on the contract's requirements
        });

        console.log('Item listed successfully:', receipt);
        alert('Item listed successfully!');

        // Clear the form
        document.getElementById('itemTitle').value = '';
        document.getElementById('itemDescription').value = '';
        document.getElementById('itemPrice').value = '';

        // Optionally, refresh the listed items or make UI updates here
        loadMarketplaceItems();
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