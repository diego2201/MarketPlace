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

async function retrieveDataFromContract() {
    try {
        const result = await contract.methods.getData().call();
        console.log('Retrieved data from the contract:', result);
        return result;
    } catch (error) {
        console.error('Error retrieving data:', error);
        return null;
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
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        console.error('MetaMask not detected or installed.');
    }
}

async function displayAccountInfo(account) {
    const balance = await web3.eth.getBalance(account);
    const balanceInEther = (parseFloat(web3.utils.fromWei(balance, 'ether'))).toFixed(4);
    document.getElementById('accountBalance').textContent = `${balanceInEther} ETH`;
}

// // Function to send a request to Infura and update the webpage with the latest block number
// async function sendRequestToInfura() {
//     try {
//         // Get the latest block number from the blockchain
//         const latestBlockNumber = await web3.eth.getBlockNumber();
//         console.log('Latest block number:', latestBlockNumber);
        
//         // Update the content of the latestBlockNumber div
//         document.getElementById('latestBlockNumber').textContent = `Latest Block Number: ${latestBlockNumber}`;
//     } catch (error) {
//         console.error('Error sending request to Infura:', error);
//     }
// }

// // Function to check if the contract address is valid on the blockchain
// async function checkContractValidity(contractAddress) {
//     try {
//         // Get code at contract address
//         const code = await web3.eth.getCode(contractAddress);
//         if (code === '0x') {
//             console.error('Contract address is not valid:', contractAddress);
//         } else {
//             console.log('Contract address is valid:', contractAddress);
//         }
//     } catch (error) {
//         console.error('Error checking contract validity:', error);
//     }
// }