const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const account = '0xEA5DD500979dc7A5764D253cf429200437183371'; // Define the account address here
let isConnectedToMetamask = false; // Track MetaMask connection status

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

//Function to set data in the contract
async function setDataInContract(data) {
    try {
        if (!isConnectedToMetamask) {
            console.error('Please connect to MetaMask first.');
            return;
        }
        // Encode the transaction data
        const encodedData = contract.methods.setData(data).encodeABI();

        // Build the transaction object
        const txObject = {
            from: account,
            to: contractAddress,
            gas: await web3.eth.estimateGas({
                to: contractAddress,
                data: encodedData
            }),
            data: encodedData
        };

        // Sign the transaction
        const signedTx = await web3.eth.sendTransaction(txObject);

        console.log('Data set successfully:', data);
        console.log('Transaction receipt:', signedTx);
    } catch (error) {
        console.error('Error setting data:', error);
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
        if (!isConnectedToMetamask) {
            console.error('Please connect to MetaMask first.');
            return;
        }
        await setDataInContract(data);
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to connect/disconnect MetaMask
async function toggleConnection() {
    if (!isConnectedToMetamask) {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            console.log('Connected to MetaMask:', accounts);
            isConnectedToMetamask = true;
            displayConnectionStatus('Connected');
            displayAccountInfo(accounts[0]);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        // Disconnect MetaMask
        await window.ethereum.request({ method: 'wallet_requestPermissions', params: [{ eth_accounts: {} }] });
        isConnectedToMetamask = false;
        displayConnectionStatus('Not connected');
        console.log('Disconnected from MetaMask');
    }
}

// Function to display connection status
function displayConnectionStatus(status) {
    document.getElementById('connection-text').textContent = status;
}

// Function to display account info
async function displayAccountInfo(account) {
    // Display connected account address
    document.getElementById('accountAddress').textContent = `Account Address: ${account}`;

    // Get account balance
    const balance = await web3.eth.getBalance(account);
    // Convert balance to ether and display
    const balanceInEther = web3.utils.fromWei(balance, 'ether');
    document.getElementById('accountBalance').textContent = `Account Balance: ${balanceInEther} ETH`;
}

// Initial check if MetaMask is connected
if (window.ethereum) {
    window.ethereum.on('accountsChanged', function (accounts) {
        if (accounts.length === 0) {
            isConnectedToMetamask = false;
            displayConnectionStatus('Not connected');
            console.log('Disconnected from MetaMask');
        } else {
            isConnectedToMetamask = true;
            displayConnectionStatus('Connected');
            console.log('Connected to MetaMask:', accounts);
            displayAccountInfo(accounts[0]);
        }
    });
}



// //Function to set data in the contract
// async function setDataInContract(data) {
//     try {
//         // Encode the transaction data
//         //const privateKey = '2dfdc6f05686cecb8c4ecf925a7d47141a36a509d1846f13461c68fac262713c';
//         const encodedData = contract.methods.setData(data).encodeABI();
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const from = accounts[0];

//         // Build the transaction object
//         const txObject = {
//             from: account,
//             to: contractAddress,
//             gas: await web3.eth.estimateGas({
//                 to: contractAddress,
//                 data: encodedData
//             }),
//             data: encodedData
//         };

//         // Convert the message to sign into hex-encoded UTF-8
//         const encoder = new TextEncoder();
//         const msgUint8 = encoder.encode(data);
//         const msgHex = Array.prototype.map.call(msgUint8, x => ('00' + x.toString(16)).slice(-2)).join('');
//         const msg = `0x${msgHex}`;

//         // Request personal_sign method from MetaMask
//         const signature = await ethereum.request({
//             method: "personal_sign",
//             params: [msg, from],
//         });

//         // Sign the transaction
//         const signedTx = await web3.eth.accounts.signTransaction(txObject, signature);

//         // Send the signed transaction
//         const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//         console.log('Data set successfully:', data);
//         console.log('Transaction receipt:', receipt);
//     } catch (error) {
//         console.error('Error setting data:', error);
//     }
// }


// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Encode data for contract method
//             const encodedData = contract.methods.setData(data).encodeABI();

//             // Estimate gas for the transaction
//             const gas = await web3.eth.estimateGas({
//                 to: contractAddress,
//                 data: encodedData
//             });

//             // Prepare the transaction object
//             const txObject = {
//                 from: from,
//                 to: contractAddress,
//                 gas: gas,
//                 data: encodedData
//             };

//             // Prompt user to sign the transaction
//             const signature = await ethereum.request({
//                 method: 'personal_sign',
//                 params: [JSON.stringify(txObject), from]
//             });

//             // Add the signature to the transaction object
//             txObject.signature = signature;

//             // Send the signed transaction to the Ethereum network
//             const transactionHash = await ethereum.request({
//                 method: 'eth_sendTransaction',
//                 params: [txObject]
//             });

//             console.log('Transaction sent. Hash:', transactionHash);
//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Get the nonce for the transaction
//             const nonce = await web3.eth.getTransactionCount(from);

//             // Build the transaction object
//              // Build the transaction object
//             const txObject = {
//                 from: account,
//                 to: contractAddress,
//                 gas: await web3.eth.estimateGas({
//                     to: contractAddress,
//                     data: encodedData
//                 }),
//                 data: encodedData
//             };

//             // Sign the transaction
//             const signature = await ethereum.request({
//                 method: 'eth_signTransaction',
//                 params: [txObject],
//             });

//             // Send the signed transaction to Infura
//             const transactionHash = await web3.eth.sendSignedTransaction(signature.raw);

//             console.log('Transaction sent. Hash:', transactionHash);
//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }



// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Add the private key of the sending account to the wallet
//             web3.eth.accounts.wallet.add(privateKey);

//             // Encode the transaction data
//             const encodedData = contract.methods.setData(data).encodeABI();

//             // Construct the transaction object
//             const txParams = {
//                 from: from,
//                 to: contractAddress,
//                 gas: await web3.eth.estimateGas({
//                     to: contractAddress,
//                     data: encodedData
//                 }),
//                 data: encodedData,
//                 value: '0x00', // Set value to 0 if not sending ETH
//                 nonce: await web3.eth.getTransactionCount(from, 'latest'),
//                 chainId: 1 // Use the correct chainId for the Ethereum mainnet
//             };

//             // Send the transaction using MetaMask
//             const receipt = await web3.eth.sendTransaction(txParams);
//             console.log('Transaction sent. Receipt:', receipt);

//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }



// //Function to set data in the contract
// async function setDataInContract(data) {
//     try {
//         // Encode the transaction data
//         const privateKey = '2dfdc6f05686cecb8c4ecf925a7d47141a36a509d1846f13461c68fac262713c';
//         const encodedData = contract.methods.setData(data).encodeABI();

//         // Build the transaction object
//         const txObject = {
//             from: account,
//             to: contractAddress,
//             gas: await web3.eth.estimateGas({
//                 to: contractAddress,
//                 data: encodedData
//             }),
//             data: encodedData
//         };

//         // Sign the transaction
//         const signedTx = await web3.eth.accounts.signTransaction(txObject, privateKey);

//         // Send the signed transaction
//         const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//         console.log('Data set successfully:', data);
//         console.log('Transaction receipt:', receipt);
//     } catch (error) {
//         console.error('Error setting data:', error);
//     }
// }


// //Function to set data in the contract
// async function setDataInContract(data) {
//     try {
//         // Encode the transaction data
//         //const privateKey = '2dfdc6f05686cecb8c4ecf925a7d47141a36a509d1846f13461c68fac262713c';
//         const encodedData = contract.methods.setData(data).encodeABI();
//         const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//         const from = accounts[0];

//         // Build the transaction object
//         const txObject = {
//             from: account,
//             to: contractAddress,
//             gas: await web3.eth.estimateGas({
//                 to: contractAddress,
//                 data: encodedData
//             }),
//             data: encodedData
//         };

//         // Convert the message to sign into hex-encoded UTF-8
//         const encoder = new TextEncoder();
//         const msgUint8 = encoder.encode(data);
//         const msgHex = Array.prototype.map.call(msgUint8, x => ('00' + x.toString(16)).slice(-2)).join('');
//         const msg = `0x${msgHex}`;

//         // Request personal_sign method from MetaMask
//         const signature = await ethereum.request({
//             method: "personal_sign",
//             params: [msg, from],
//         });

//         // Sign the transaction
//         const signedTx = await web3.eth.accounts.signTransaction(txObject, signature);

//         // Send the signed transaction
//         const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

//         console.log('Data set successfully:', data);
//         console.log('Transaction receipt:', receipt);
//     } catch (error) {
//         console.error('Error setting data:', error);
//     }
// }


// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const encodedData = contract.methods.setData(data).encodeABI();
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Convert the message to sign into hex-encoded UTF-8
//             const encoder = new TextEncoder();
//             const msgUint8 = encoder.encode(data);
//             const msgHex = Array.prototype.map.call(msgUint8, x => ('00' + x.toString(16)).slice(-2)).join('');
//             const msg = `0x${msgHex}`;

//             // Request personal_sign method from MetaMask
//             const signature = await ethereum.request({
//                 method: "personal_sign",
//                 params: [msg, from],
//             });

//             // Now you have the signature, you can proceed with sending the transaction or storing it as needed
//             console.log('Signature:', signature);

//             // Proceed with sending the transaction or other operations

            
//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }



// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Encode data for contract method
//             const encodedData = contract.methods.setData(data).encodeABI();

//             // Estimate gas for the transaction
//             const gas = await web3.eth.estimateGas({
//                 to: contractAddress,
//                 data: encodedData
//             });

//             // Prepare the transaction object
//             const txObject = {
//                 from: from,
//                 to: contractAddress,
//                 gas: gas,
//                 data: encodedData
//             };

//             // Prompt user to sign the transaction
//             const signature = await ethereum.request({
//                 method: 'personal_sign',
//                 params: [JSON.stringify(txObject), from]
//             });

//             // Add the signature to the transaction object
//             txObject.signature = signature;

//             // Send the signed transaction to the Ethereum network
//             const transactionHash = await ethereum.request({
//                 method: 'eth_sendTransaction',
//                 params: [txObject]
//             });

//             console.log('Transaction sent. Hash:', transactionHash);
//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }

// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Get the nonce for the transaction
//             const nonce = await web3.eth.getTransactionCount(from);

//             // Build the transaction object
//              // Build the transaction object
//             const txObject = {
//                 from: account,
//                 to: contractAddress,
//                 gas: await web3.eth.estimateGas({
//                     to: contractAddress,
//                     data: encodedData
//                 }),
//                 data: encodedData
//             };

//             // Sign the transaction
//             const signature = await ethereum.request({
//                 method: 'eth_signTransaction',
//                 params: [txObject],
//             });

//             // Send the signed transaction to Infura
//             const transactionHash = await web3.eth.sendSignedTransaction(signature.raw);

//             console.log('Transaction sent. Hash:', transactionHash);
//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }


// async function setDataInContract(data) {
//     try {
//         if (window.ethereum) {
//             // Request access to MetaMask accounts
//             const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
//             const from = accounts[0];

//             // Add the private key of the sending account to the wallet
//             web3.eth.accounts.wallet.add(privateKey);

//             // Encode the transaction data
//             const encodedData = contract.methods.setData(data).encodeABI();

//             // Construct the transaction object
//             const txParams = {
//                 from: from,
//                 to: contractAddress,
//                 gas: await web3.eth.estimateGas({
//                     to: contractAddress,
//                     data: encodedData
//                 }),
//                 data: encodedData,
//                 value: '0x00', // Set value to 0 if not sending ETH
//                 nonce: await web3.eth.getTransactionCount(from, 'latest'),
//                 chainId: 1 // Use the correct chainId for the Ethereum mainnet
//             };

//             // Send the transaction using MetaMask
//             const receipt = await web3.eth.sendTransaction(txParams);
//             console.log('Transaction sent. Receipt:', receipt);

//         } else {
//             console.error('MetaMask is not detected.');
//         }
//     } catch (error) {
//         console.error('Error:', error);
//     }
// }