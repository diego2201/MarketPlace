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

async function retrieveItemDetails() {
    const itemId = document.getElementById('itemID').value;
    if (!itemId) {
        alert('Please enter a valid Item ID');
        return;
    }
    try {
        const details = await contract.methods.getItemDetails(itemId).call();
        const detailsDisplay = `
            <p><strong>ID:</strong> ${details.id}</p>
            <p><strong>Title:</strong> ${details.title}</p>
            <p><strong>Description:</strong> ${details.description}</p>
            <p><strong>Price:</strong> ${web3.utils.fromWei(details.price, 'ether')} ETH</p>
            <p><strong>Owner:</strong> ${details.owner}</p>
            <p><strong>Sold:</strong> ${details.isSold ? 'Yes' : 'No'}</p>
        `;
        document.getElementById('itemDetails').innerHTML = detailsDisplay;
    } catch (error) {
        console.error('Error retrieving item details:', error);
        document.getElementById('itemDetails').innerHTML = `<p>Error retrieving details. See console.</p>`;
    }
}




// Assuming you have a function that retrieves the products from the smart contract...
async function displayProducts() {
    const productCount = await contract.methods.getProductCount().call();
    const productListTable = document.querySelector("#productList table");

    for (let i = 1; i <= productCount; i++) {
        const product = await contract.methods.products(i).call();

        const productRow = `
            <tr>
                <td>${product.id}</td>
                <td>${product.title}</td>
                <td>${web3.utils.fromWei(product.price, 'ether')} ETH</td>
                <td>${product.owner}</td>
                <td><button onclick="purchaseProduct(${product.id})">Buy</button></td>
            </tr>
        `;

        productListTable.innerHTML += productRow;
    }
}

// Call this function to populate the list on page load or after a product is added
displayProducts();




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

