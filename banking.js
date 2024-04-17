const infuraUrl = 'https://sepolia.infura.io/v3/fab7e80127424a7c95aadd5be9c525e1';
const account = '0xEA5DD500979dc7A5764D253cf429200437183371';
const web3 = new Web3(infuraUrl);

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

const contractAddress = '0x058aF1F045092aC4d4509555E9b7B2d79d581238';
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
