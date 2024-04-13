const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const account = '0xEA5DD500979dc7A5764D253cf429200437183371'; // Define the account address here
const web3 = new Web3(infuraUrl);

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

// Function to set data in the contract
async function setDataInContract(data) {
    try {
        if (window.ethereum) {
            // Encode the transaction data
            const encodedData = contract.methods.setData(data).encodeABI();

            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const from = accounts[0];

            // Prepare the transaction object
            const txObject = {
                from: from,
                to: contractAddress,
                gas: await web3.eth.estimateGas({
                    to: contractAddress,
                    data: encodedData
                }),
                data: encodedData
            };

            // Prompt user to sign the transaction
            const signature = await ethereum.request({
                method: "personal_sign",
                params: [JSON.stringify(txObject), from], // Signing the transaction object
            });

            // Send the signed transaction to Infura
            const transactionHash = await web3.eth.sendSignedTransaction('0x' + signature.raw);

            console.log('Transaction sent. Hash:', transactionHash);
        } else {
            console.error('MetaMask is not detected.');
        }
    } catch (error) {
        console.error('Error:', error);
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

// Function to request access to MetaMask accounts and then call setDataInContract
async function requestAccountsAndSetData(data) {
    try {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const from = accounts[0];
            await setDataInContract(data, from);
        } else {
            console.error('MetaMask is not detected.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
