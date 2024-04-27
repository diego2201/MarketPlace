document.addEventListener('DOMContentLoaded', function() {
    const ethereumButton = document.querySelector('.metamask-button');
    const listItemButton = document.querySelector('.listItemButton');
    const marketplaceItems = document.getElementById('marketplaceItems');

    ethereumButton.addEventListener('click', connectMetamask);
    listItemButton.addEventListener('click', () => {
        const title = document.getElementById('itemTitle').value;
        const description = document.getElementById('itemDescription').value;
        const price = document.getElementById('itemPrice').value;
        listNewItem(title, description, price);
    });

    marketplaceItems.addEventListener('click', (event) => {
        if (event.target.classList.contains('buy-button')) {
            const itemId = event.target.getAttribute('data-item-id');
            purchaseItem(itemId);
        }
    });

    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
    } else {
        console.log('MetaMask is not available.');
    }
});

async function connectMetamask() {
    try {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        console.log('Connected to MetaMask');
    } catch (error) {
        console.error('Error connecting to MetaMask:', error);
    }
}

async function listNewItem(title, description, price) {
    try {
        const from = await window.ethereum.request({ method: "eth_requestAccounts" }).then(accounts => accounts[0]);
        const receipt = await contract.methods.listNewItem(title, description, price).send({ from: from });
        console.log('Item listed successfully:', receipt);
    } catch (error) {
        console.error('Error listing item:', error);
    }
}

async function purchaseItem(itemId) {
    try {
        const from = await window.ethereum.request({ method: "eth_requestAccounts" }).then(accounts => accounts[0]);
        const itemDetails = await contract.methods.getItemDetails(itemId).call();
        const receipt = await contract.methods.purchaseItem(itemId).send({ from: from, value: itemDetails.price });
        console.log('Purchase successful:', receipt);
    } catch (error) {
        console.error('Error purchasing item:', error);
    }
}
