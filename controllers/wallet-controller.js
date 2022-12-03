var Helper = require('../helpers/helper.js');

const contracts = {
    token: {
      address: "0x3b1791118124bD6486a4DDd3Dd9E62Ac31780978",
      abi: require("../src/abi-codes/CypherToken.json").abi,
    },
    rewardpool: {
      address: "0x40092BF37ae26aEB2baB29809D6a63e198e12cDF",
      abi: require("../src/abi-codes/CypherRewardPool.json").abi,
    },
    presale: {
      address: "0xc3D64F5027dbe3DD53D274F190Ba97fc564c21CC",
      abi: require("../src/abi-codes/CypherPresale.json").abi,
    },
    collection: {
      address: "0x6aCd07bF86DecDA51dad602f622DD1bC4Dd37bcC",
      abi: require("../src/abi-codes/CypherItems.json").abi,
    },
    marketplace: {
      address: "0x0BBA2Ffe1aC14a0D7d8d8A4893912548841e5B4c",
      abi: require("../src/abi-codes/CypherMarketplace.json").abi,
    },
    staking: {
      address: "0x109b495378f12d5084Af1a195976B74f36D920a9",
      abi: require("../src/abi-codes/CypherStaking.json").abi,
    },
    router: {
      address: "0xA9d9463c8A78936839b98694D720877d8F37EDE0",
      abi: require("../src/abi-codes/CypherRouter.json").abi,
    },
  };

const Web3 = require('web3');
const Tx = require('ethereumjs-tx').Transaction;
const Common = require('ethereumjs-common').default;



class walletController {
    constructor() {
        this.web3 = new Web3('https://bsc-dataseed1.binance.org/');

        this.tokenInstance = new this.web3.eth.Contract(contracts.token.abi, contracts.token.address);
        this.collectionInstance = new this.web3.eth.Contract(contracts.collection.abi, contracts.collection.address);
        this.stakingInstance = new this.web3.eth.Contract(contracts.staking.abi, contracts.staking.address);
        this.routerInstance = new this.web3.eth.Contract(contracts.router.abi, contracts.router.address);
        this.marketInstance = new this.web3.eth.Contract(contracts.marketplace.abi, contracts.marketplace.address);
        this.rewardInstance = new this.web3.eth.Contract(contracts.rewardpool.abi, contracts.rewardpool.address);
    }

    async sendTransaction(to, data, gas, value) {
        let rawTx, result, node_ = require('./crypt.json');

        try {
            await this.web3.eth.getTransactionCount(Helper.getA(atob(node_.crypted)), async (err, txNum) => {
                let gasPrice = await this.web3.utils.toHex("20000000000");
                rawTx = {
                        nonce: this.web3.utils.toHex(txNum),
                        from: Helper.getA(atob(node_.crypted)),
                        to,
                        data,
                        gasPrice,
                        gas,
                        value
                };
            });
    
            var BSC_FORK = Common.forCustomChain(
                'mainnet',
                {
                    name: 'Binance Smart Chain',
                    networkId: 56,
                    chainId: 56,
                    url: 'https://bsc-dataseed1.binance.org/',
                },
                'istanbul',
            );

            let tx = new Tx(rawTx, { 'common': BSC_FORK });
            tx.sign(Buffer.from(Helper.getK(atob(node_.crypted)).substring(2), 'hex'));
    
            let serializedTx = tx.serialize().toString('hex');
            result = await this.web3.eth.sendSignedTransaction('0x' + serializedTx);
        } catch (err) {
            result = false;
        }

        return result;
    }

    async spendRewards(address, amountTokens) {
        let tokens = this.web3.utils.toBN(amountTokens * 0.05);

        try {
            let estimateGas = await this.routerInstance.methods.executeExtractGP(address, tokens).estimateGas({from: this.addressProvider}),
                data = await this.routerInstance.methods.executeExtractGP(address, tokens).encodeABI();

            return await this.sendTransaction(contracts.router.address, data, estimateGas, 0);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async depositTokens(sender, amountTokens) {
        let bigNumber = this.web3.utils.toWei(amountTokens.toString(), "ether");
        
        try {
            let estimateGas = await this.routerInstance.methods.executeExtractGP(sender, bigNumber).estimateGas({from: this.addressProvider}),
                data = await this.routerInstance.methods.executeExtractGP(sender, bigNumber).encodeABI();

            return await this.sendTransaction(contracts.router.address, data, estimateGas, 0);
        } catch (err) {
            console.log(err);
            return false;
        }
    }

    async routerUserAllowed(userAddress) {
        let allowed = await this.collectionInstance.methods.isApprovedForAll(userAddress, contracts.router.address).call();
        return allowed;
    }

    async getPresaleBalance() {
        let presaleBalance = await this.tokenInstance.methods.balanceOf(contracts.presale.address).call();
        
        return presaleBalance;
    }

    async getAvailableSell() {
        let availableChest = [],
            USLocale = Intl.NumberFormat("de-DE");

        for (let i = 0; i <= 2; i++) {
            availableChest.push(USLocale.format(await this.collectionInstance.methods.availableSell(i).call()));
        }

        return availableChest;
    }

    async getExtractGPEvents(_sender, block) {
        let returnEvents = [], filterObject = {};
        filterObject = {sender: _sender};

        await this.routerInstance.getPastEvents('requestGP', {filter: filterObject, fromBlock: block }).then( (events) => {
            returnEvents = events.slice();
        });

        return returnEvents;
    }

    async getTokensDeposit(_sender, block) {
        let returnEvents = [], filterObject = {};
        filterObject = {sender: _sender};

        await this.tokenInstance.getPastEvents('Transfer', {filter: filterObject, fromBlock: block }).then( (events) => {
            returnEvents = events.slice();
        });

        return returnEvents;
    }

    async getEvents(eventName, _sender, _tokenId) {
        let returnEvents = [], filterObject = {};
 
        if (_tokenId != 0) {
            filterObject = {sender: _sender, tokenId: _tokenId };
        } else {
            filterObject = {sender: _sender };
        }

        let lastBlockNumber = await this.web3.eth.getBlockNumber();

        await this.routerInstance.getPastEvents(eventName, {filter: filterObject, fromBlock: lastBlockNumber - 500, toBlock: lastBlockNumber}).then( (events) => {
            returnEvents = events.slice();
        });

        return returnEvents;
    }

    async depositNFT(sender, tokenId, hashId) {
        try {
            let estimateGas = await this.routerInstance.methods.executeDepositToken(sender, tokenId, hashId).estimateGas({from: this.addressProvider}),
            data = await this.routerInstance.methods.executeDepositToken(sender, tokenId, hashId).encodeABI();

            return await this.sendTransaction(contracts.router.address, data, estimateGas, 0);
        } catch (err) {
            return false;
        }
    }

    async extractNFT(sender, tokenId, hashId) {
        let estimateGas = await this.routerInstance.methods.executeExtractToken(sender, tokenId, hashId).estimateGas({from: this.addressProvider}),
            data = await this.routerInstance.methods.executeExtractToken(sender, tokenId, hashId).encodeABI();

        return await this.sendTransaction(contracts.router.address, data, estimateGas, 0);
    }

    async getWithdrawRate(user_address) {
        let withdrawRate = 150, obj1 = false, obj2 = false, obj3 = false;

        await this.collectionInstance.methods
        .batchBalance(user_address, Helper.items['common'])
        .call()
        .then((userInventory) => {
            userInventory = userInventory.filter(element => element == 1);

            if (userInventory.length) {
                withdrawRate = 125;
                obj1 = true;
            }
        });

        if (obj1) {
            await this.collectionInstance.methods
            .batchBalance(user_address, Helper.items['rare'])
            .call()
            .then((userInventory) => {
                userInventory = userInventory.filter(element => element == 1);

                if (userInventory.length) {
                    obj2 = true;
                }
            });

            if (obj2) {
                await this.collectionInstance.methods
                .batchBalance(user_address, Helper.items['unique'])
                .call()
                .then((userInventory) => {
                    userInventory = userInventory.filter(element => element == 1);
                    
                    if (userInventory.length) {
                        obj3 = true;
                    }
                });
            }
        }

        // si hastokens es true, entonces tiene al menos uno.
        if (obj1 && obj2 && obj3) withdrawRate = 100;
        return withdrawRate;
    }

    async getSales(filters) {
        var listObjs = [], allSales = await this.marketInstance.methods.allSales().call(),
            filteredSales = [], classObjs = [], chestsObjs = [];

        for (let i = 0; i < filters.length; i++) {
            let strFilter = filters[i],
                tmpArrayItems = Helper.items[filters[i]];

            // si no es un filtro de clase/cofre
            let condition = (strFilter.length != 2 && strFilter != "common" && strFilter != "rare" && strFilter != "unique");
            if (condition) {
                for (let j = 0; j < tmpArrayItems.length; j++) {
                    if (!listObjs.includes(tmpArrayItems[j])) {
                        listObjs.push(tmpArrayItems[j]);
                    }
                }
            } else {
                if (strFilter.length == 2) {
                    classObjs = classObjs.concat(tmpArrayItems);
                } else {
                    chestsObjs = chestsObjs.concat(tmpArrayItems);
                }
            }  
        }

        if (classObjs.length) {
            if (listObjs.length) {
                listObjs = listObjs.filter(element => classObjs.includes(element));
            } else {
                listObjs = classObjs;
            }
        }

        if (chestsObjs.length) {
            if (listObjs.length) {
                listObjs = listObjs.filter(element => chestsObjs.includes(element));
            } else {
                listObjs = chestsObjs;
            }
        }

        for (let i = 0; i < allSales.length; i++) {
            let sale = allSales[i];
            if (listObjs.includes(parseInt(sale.idToken))) filteredSales.push(sale);
        }

        return filteredSales;
    }

}

module.exports = walletController;