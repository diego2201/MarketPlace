const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const account = '0xEA5DD500979dc7A5764D253cf429200437183371';
const web3 = new Web3(infuraUrl);

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
    }
];


const contractAddress = '0xA897431171E2C508D75AE6AA327F776709A36e83';
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function setDataInContract(data) {
    try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];
        const encodedData = web3.utils.utf8ToHex(data);
        const defaultGasLimit = '0x300000';

        const txObject = {
            from: from,
            to: contractAddress,
            data: encodedData,
            gas: defaultGasLimit,
        };

        const transactionHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [txObject],
        });

        console.log('Transaction sent. Hash:', transactionHash);
    } catch (error) {
        console.error('Error:', error);
    }
}

async function loadMarketplaceItems() {
    try {
        // Use the getTotalItemCount() method instead of directly accessing nextItemId
        const itemCount = await contract.methods.getTotalItemCount().call();
        let itemsDisplay = '';

        for (let i = 1; i <= itemCount; i++) {
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
                    ${!item.isSold ? `<button onclick="purchaseItem(${item.id})">Buy</button>` : ''}
                </div>
            `;
        }

        document.getElementById('marketplaceItems').innerHTML = itemsDisplay;
    } catch (error) {
        console.error('Error loading marketplace items:', error);
    }
}

// Load items when the window loads please? 
window.addEventListener('load', loadMarketplaceItems);

async function displayRetrievedData() {
    try {
        const retrievedData = await retrieveDataFromContract();
        document.getElementById('retrievedData').textContent = `Retrieved Data: ${retrievedData}`;
    } catch (error) {
        console.error('Error displaying retrieved data:', error);
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
    try {
        const balance = await web3.eth.getBalance(account);
        const balanceInEther = web3.utils.fromWei(balance, 'ether');
        document.getElementById('userBalance').textContent = parseFloat(balanceInEther).toFixed(4);
    } catch (error) {
        console.error('Error fetching account info:', error);
    }
}

