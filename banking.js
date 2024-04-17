const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
//const privateKey = '2dfdc6f05686cecb8c4ecf925a7d47141a36a509d1846f13461c68fac262713c';
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
//const contractAddress = '0xB41cfBE072d0AA695e737e17F6Cd9E44F095408c';
const contractAddress = '0x058aF1F045092aC4d4509555E9b7B2d79d581238';
//teszt

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



// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const encodedData = contract.methods.setData(data).encodeABI();

//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Prepare the transaction object
//             const txObject = {
//                 from: from,
//                 to: contractAddress,
//                 gas: await web3.eth.estimateGas({
//                     to: contractAddress,
//                     data: encodedData
//                 }),
//                 data: encodedData
//             };                

//             // Prompt user to sign the transaction
//             const signature = await ethereum.request({
//                 method: "personal_sign",
//                 params: [JSON.stringify(txObject), from], // Signing the transaction object
//             });

//             // Send the signed transaction to Infura
//             const transactionHash = await web3.eth.sendSignedTransaction('0x' + signature.raw); // Ensure prefix '0x'

//             console.log('Transaction sent. Hash:', transactionHash);
//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

async function setDataInContract(data) {
    try {
        // Request access to MetaMask accounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const from = accounts[0];

        // Encode the data to be set in the contract
        const encodedData = web3.utils.utf8ToHex(data);

        // Set a default gas limit
        const defaultGasLimit = '0x300000'; // Adjust as needed

        // Build the transaction object
        const txObject = {
            from: from,
            to: contractAddress,
            data: encodedData,
            gas: defaultGasLimit,
        };

        // Prepare the transaction object
        // const txObject = {
        //     from: from,
        //     to: contractAddress,
        //     gas: await web3.eth.estimateGas({
        //         to: contractAddress,
        //         data: encodedData
        //     }),
        //     data: encodedData
        // };  

        // Send the transaction via MetaMask
        const transactionHash = await ethereum.request({
            method: 'eth_sendTransaction',
            params: [txObject],
        });

        console.log('Transaction sent. Hash:', transactionHash);
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
