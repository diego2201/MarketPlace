const ethereumButton = document.querySelector(".enableEthereumButton");
const listItemButton = document.querySelector(".listItemButton");
const purchaseItemButton = document.querySelector(".purchaseItemButton");

let accounts = [];

// Initialization and event listeners
ethereumButton.addEventListener("click", () => {
    connectMetamask();
});

listItemButton.addEventListener("click", () => {
    const itemId = 1; // Assuming you fetch this or set dynamically
    listNewItem('Sample Item', 'Description here', '10000000000000000'); // Example data
});

purchaseItemButton.addEventListener("click", () => {
    const itemId = purchaseItemButton.getAttribute('data-item-id'); // Get item ID
    purchaseItem(itemId);
});

async function connectMetamask() {
    if (window.ethereum) {
        try {
            accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
            console.log('Connected to MetaMask:', accounts);
        } catch (error) {
            console.error('Error connecting to MetaMask:', error);
        }
    } else {
        console.error('MetaMask is not available.');
    }
}

async function listNewItem(title, description, price) {
    if (!window.ethereum || !accounts.length) {
        alert("Please connect to MetaMask first.");
        return;
    }

    try {
        const receipt = await contract.methods.listNewItem(title, description, price).send({
            from: accounts[0],
            gas: '3000000'  // Adjust the gas limit as necessary
        });

        console.log('Item listed successfully:', receipt);
        alert('Item listed successfully!');
    } catch (error) {
        console.error('Error listing item:', error);
        alert(`Failed to list item: ${error.message}`);
    }
}

async function purchaseItem(itemId) {
    if (!window.ethereum || !accounts.length) {
        alert("Please connect to MetaMask first.");
        return;
    }

    try {
        const item = await contract.methods.getItemDetails(itemId).call();
        const receipt = await window.ethereum.request({
            method: "eth_sendTransaction",
            params: [{
                from: accounts[0],
                to: contractAddress,
                value: web3.utils.toHex(item.price),  // Ensure value is in hex
                gas: '3000000'  // Adjust the gas limit as necessary
            }]
        });

        console.log('Purchase successful:', receipt);
        alert(`Item ${itemId} purchased successfully!`);
    } catch (error) {
        console.error('Error purchasing item:', error);
        alert(`Failed to purchase item: ${error.message}`);
    }
}

document.querySelector('.metamask-button').addEventListener('click', connectMetamask);
document.querySelector('.listItemButton').addEventListener('click', listNewItem);

// Assuming each item's buy button is dynamically generated and added
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('marketplaceItems').addEventListener('click', (event) => {
        if (event.target.classList.contains('buy-button')) {
            purchaseItem(event.target.dataset.itemId);
        }
    });
});
