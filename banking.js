const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const privateKey = '2dfdc6f05686cecb8c4ecf925a7d47141a36a509d1846f13461c68fac262713c';
const account = '0xEA5DD500979dc7A5764D253cf429200437183371'; // Define the account address here
const contractAddress = '0xB41cfBE072d0AA695e737e17F6Cd9E44F095408c'; // Define the contract address here
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

// Initialize Web3
const web3 = new Web3(infuraUrl);

//tewtweyufrgwerf

async function connectMetamask() {
    if (window.ethereum) {
        try {
            // Request access to Metamask accounts
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected to Metamask:', accounts);
            displayAccountInfo(accounts[0]);
        } catch (error) {
            console.error('Error connecting to Metamask:', error);
        }
    } else {
        console.error('Metamask not detected or installed.');
    }
}

async function displayAccountInfo(account) {
    // Display connected account address
    document.getElementById('accountAddress').textContent = `Account Address: ${account}`;

    // Get account balance
    const balance = await web3.eth.getBalance(account);
    // Convert balance to ether and display
    const balanceInEther = web3.utils.fromWei(balance, 'ether');
    document.getElementById('accountBalance').textContent = `Account Balance: ${balanceInEther} ETH`;
}

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

async function setDataInContract(data) {
    try {
        // Encode the transaction data
        const encoder = new TextEncoder();
        const types = ['uint', 'bytes32', 'bytes20', 'bytes5', 'bytes'];
        const args = [1, data, '03:00:21 12-12-12', 'true', ''];
        const fullName = 'addRecord' + '(' + types.join() + ')';
        const signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8);
        const dataHex = signature + coder.encodeParams(types, args);
        const encodedData = '0x' + dataHex;

        // Build the transaction object
        const nonce = await web3.eth.getTransactionCount(account);
        const gasPrice = await web3.eth.getGasPrice();
        const gasLimit = 300000; // user defined
        const txObject = {
            nonce: web3.utils.toHex(nonce),
            gasPrice: web3.utils.toHex(gasPrice),
            gasLimit: web3.utils.toHex(gasLimit),
            from: account,
            to: contractAddress,
            data: encodedData
        };

        // Sign the transaction
        const tx = new Tx(txObject, { 'chain': 'ropsten', 'hardfork': 'petersburg' });
        const privateKeyBuffer = Buffer.from(privateKey, 'hex');
        tx.sign(privateKeyBuffer);
        const serializedTx = '0x' + tx.serialize().toString('hex');

        // Send the signed transaction
        web3.eth.sendSignedTransaction(serializedTx, function (err, txHash) {
            if (!err) {
                console.log('Transaction hash:', txHash);
            } else {
                console.error('Error sending transaction:', err);
            }
        });
    } catch (error) {
        console.error('Error setting data:', error);
    }
}

async function retrieveDataFromContract() {
    try {
        // Contract instance
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Call contract function to get data
        const result = await contract.methods.getData().call();
        console.log('Retrieved data from the contract:', result);
        return result;
    } catch (error) {
        console.error('Error retrieving data:', error);
        return null;
    }
}
