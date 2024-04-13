const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const web3 = new Web3(infuraUrl);

// Ethereum account
const account = '0xEA5DD500979dc7A5764D253cf429200437183371'; // Replace this with your actual Ethereum address

// Contract ABI
const contractABI = [
    {
        "constant": false,
        "inputs": [
            {
                "name": "_data",
                "type": "string"
            }
        ],
        "name": "setData",
        "outputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "getData",
        "outputs": [
            {
                "name": "",
                "type": "string"
            }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }
];

// Contract address
const contractAddress = '0xB41cfBE072d0AA695e737e17F6Cd9E44F095408c';

// Contract instance
const contract = new web3.eth.Contract(contractABI, contractAddress);

async function setDataInContract(data) {
    try {
        // Get the user's accounts from MetaMask
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0]; // Use the first account
        
        // Send transaction to the contract to set data
        await contract.methods.setData(data).send({ from: from });
        console.log('Data set successfully:', data);
    } catch (error) {
        console.error('Error setting data:', error);
    }
}

// Function to retrieve data from the contract
async function retrieveDataFromContract() {
    try {
        // Call contract function to get data
        const result = await contract.methods.getData().call();
        console.log('Retrieved data from the contract:', result);
        return result;
    } catch (error) {
        console.error('Error retrieving data:', error);
        return null;
    }
}

// Function to send a request to Infura and update the webpage with the latest block number
async function sendRequestToInfura() {
    try {
        // Get the latest block number from the blockchain
        const latestBlockNumber = await web3.eth.getBlockNumber();
        console.log('Latest block number:', latestBlockNumber);
        
        // Update the content of the latestBlockNumber div
        document.getElementById('latestBlockNumber').textContent = `Latest Block Number: ${latestBlockNumber}`;
    } catch (error) {
        console.error('Error sending request to Infura:', error);
    }
}

// Function to check if the contract address is valid on the blockchain
async function checkContractValidity(contractAddress) {
    try {
        // Get code at contract address
        const code = await web3.eth.getCode(contractAddress);
        if (code === '0x') {
            console.error('Contract address is not valid:', contractAddress);
        } else {
            console.log('Contract address is valid:', contractAddress);
        }
    } catch (error) {
        console.error('Error checking contract validity:', error);
    }
}

// Function to connect to Metamask
async function connectMetamask() {
    try {
        // Check if MetaMask is installed
        if (window.ethereum) {
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const address = accounts[0];
            document.getElementById('walletAddress').textContent = `Wallet Address: ${address}`;
            // Get wallet balance
            const balance = await getWalletBalance(address);
            document.getElementById('walletBalance').textContent = `Wallet Balance: ${balance} ETH`;
        } else {
            console.error('Metamask not detected or installed.');
        }
    } catch (error) {
        console.error('Error connecting to Metamask:', error);
    }
}

// Function to get wallet balance
async function getWalletBalance(address) {
    try {
        // Get wallet balance in Ether
        const weiBalance = await web3.eth.getBalance(address);
        const balance = web3.utils.fromWei(weiBalance, 'ether');
        return balance;
    } catch (error) {
        console.error('Error getting wallet balance:', error);
        return null;
    }
}
