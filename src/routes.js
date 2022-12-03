import { closeModalWithAnim, Web3, contracts, checkConnection, requestConnection, walletCRequest, getProvider, mainNetwork, getUserByWallet, loadView_POST, getUserAddress, createFormModal, POST_Function, baseURL } from './constants.js';
import { Presale } from './presale.js';
import { Staker } from './staking.js';
import { Inventory } from './inventory.js';
import { Account } from './account.js';
import { Marketplace } from './marketplace.js';
import { Rankings } from './rankings.js';
import { viewMessage, getLabel, setStaticLabels, getUserLanguage } from './messages.js';
import copy from 'copy-to-clipboard';

//var metaTags = require('../helpers/metatags.json');

export class Routes {

    constructor(url) {
        this.web3 = new Web3(getProvider());
        this.tokenInstance = new this.web3.eth.Contract(contracts.token.abi, contracts.token.address);

        checkConnection().then( (result) => {
            this.web3Connected = result.connect;

            this.redirectPage(url);
            this.showHeaderInfo();
            this.checkNetwork();
        });
    }

    setActiveNavigation(nav) {
        let d = document,
            navElements = {
                "home": d.getElementById("nav-home"),
                "token": d.getElementById("nav-token"),
                "chests": d.getElementById("nav-chests"),
                "market": d.getElementById("nav-market"),
                "play": d.getElementById("nav-play"),
                "staking": d.getElementById("nav-staking"),
                "rank": d.getElementById("nav-rank"),
                "inv": d.getElementById("nav-inventory"),
                "swap": d.getElementById("nav-swap"),
            };
        
        for (let element in navElements) {
            if (navElements[element].classList.contains("active")) navElements[element].classList.remove("active");
        }
        
        let tmpCheck = (nav == "inv" || nav == "swap");
        this.set_AccountActive(tmpCheck);

        navElements[nav].classList.add("active");

        /* ### META - TAGS ### */
        /*document.querySelector('meta[property="og:title"]')
        .setAttribute('content', metaTags[nav].title);
        document.querySelector('meta[name="twitter:title"]')
        .setAttribute('content', metaTags[nav].title);

        document.querySelector('meta[property="og:description"]')
        .setAttribute('content', metaTags[nav].description);
        document.querySelector('meta[name="twitter:description"]')
        .setAttribute('content', metaTags[nav].description);

        document.querySelector('meta[property="og:url"]')
        .setAttribute('content', metaTags[nav].url);

        document.querySelector('meta[name="twitter:image"]')
        .setAttribute('content', metaTags[nav].twitterimage);
        document.querySelector('meta[property="og:image"]')
        .setAttribute('content', metaTags[nav].fbimage);*/
    }

    setLinksEvents(d) {
        var me = this;
        let enlaces = d.getElementsByTagName("a");
        
        for (let i = 0; i < enlaces.length; i++) {
          enlaces[i].addEventListener("click", function (evt) {
            let link_target = this.getAttribute('target');
            
            if (link_target === null) {
              evt.preventDefault();
              let category = this.getAttribute('href');
              if (category) {
                me.redirectPage(category);
              }
            }
          });
        }
      }

    set_AccountActive(bool) {
        let accountContent = document.getElementById("account-content"),
            collapsibleContent = document.getElementById("collapsible-account");

        if (bool) {
            if (!accountContent.classList.contains("active")) {
                accountContent.classList.add("active");
                collapsibleContent.style.maxHeight = "161px";
            }
        } else {
            if (accountContent.classList.contains("active")) {
                collapsibleContent.style.maxHeight = null;
                accountContent.classList.remove("active");
            }
        }
    }

    setTitle(title) {
        document.title = "Cypher MU · " + title; 

        document.querySelector('meta[property="og:title"]')
        .setAttribute('content', document.title);
    }

    async showOnlines() {
        let usersOnlines = 0,
            lblOnlines = document.getElementById("online-users"),
            rndNumber = Math.floor(Math.random() * 3);

        try {
            let cookieOnlines = sessionStorage.getItem("onlines");
            
            if (cookieOnlines) {
                lblOnlines.innerHTML = '<i class="fa-duotone fa-users"></i> ' + (parseInt(cookieOnlines) + parseInt(rndNumber));
            } else {
                await POST_Function('/getOnlines', {}).then( async (res) => {
                    let rta = await res.json();
                    usersOnlines = rta.message;
                    lblOnlines.innerHTML = '<i class="fa-duotone fa-users"></i> ' + (parseInt(usersOnlines) + parseInt(rndNumber));
                });
            }
        } catch(err) {
            lblOnlines.innerHTML = '<i class="fa-duotone fa-users"></i> error';
        }

    if (usersOnlines) sessionStorage.setItem('onlines', usersOnlines);
}

    redirectPage(url) {

        document.querySelector('meta[property="og:url"]')
        .setAttribute('content', baseURL + url);

        switch (url) {    
            case '/presale':
                this.view_buyToken();
                this.setActiveNavigation("token");
                break;

            case '/vault-store':
                this.view_buyChest();
                this.setActiveNavigation("chests");
                break;

            case '/staking':
                this.view_staking();
                this.setActiveNavigation("staking");
                break;

            case '/marketplace':
                this.view_marketplace();
                this.setActiveNavigation("market");
                break;

            case '/downloads':
                this.view_downloads();
                this.setActiveNavigation("play");
                break;

            case '/rankings':
                this.view_rankings();
                this.setActiveNavigation("rank");
                break;
            
            case '/account/inventory':
                this.web3Connected ? this.view_inventory() : this.view_index();
                break;
            
            case '/account/swap':
                this.web3Connected ? this.view_swapGP() : this.view_index();
                break;
    
            case '/':
                this.view_index();
                this.setActiveNavigation("home");
                this.setTitle(getLabel(".lbl-home"));
                break;

            default:
                this.view_index();
                this.setActiveNavigation("home");
                this.setTitle(getLabel(".lbl-home"));
                break;
        };

        this.showOnlines();
    }

    view_buyToken() {
        let classPresale = new Presale(this.web3);
        classPresale.renderTokenPresale();
        this.setTitle(getLabel("lbl-saletitle"));
    }

    view_buyChest() {
        let classPresale = new Presale(this.web3);
        classPresale.renderChestPresale();
        this.setTitle(getLabel("lbl-shop"));
    }

    async checkNetwork() {
        if (this.web3Connected) {
            let net_params = [{
                    chainId: '0x38',
                    chainName: 'Binance Smart Chain',
                    nativeCurrency: {
                        name: 'Binance Coin',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://bsc-dataseed.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com']
                }];

            try {
                await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x38' }],
                });
            } catch (switchError) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                try {
                    await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: net_params,
                    });
                } catch (addError) {
                    // handle "add" error
                }
                }
                // handle other "switch" errors
            }
        }
    }

    view_index() {
        let hideModal = document.cookie.replace(
            /(?:(?:^|.*;\s*)notshow\s*\=\s*([^;]*).*$)|^.*$/,
            "$1"
        ), language = getUserLanguage();
        
        loadView_POST('/content', 'main', '/', { language, hide: hideModal }).then( async () => {
            let videoHeader = document.getElementById("videoHeader");
            if (videoHeader) videoHeader.controls = false;
            
            let me = this,
                main = document.getElementById("main"),
                addToken = document.getElementById("add-token"),
                copyTokenAddress = document.getElementById("copy-token-address");

            // MODAL NEWS ------------------
            let fModal = document.getElementById("form-modal"),
                closeButton = document.getElementById("modal-close"),
                checkShow = document.getElementById("show-news");


            if (fModal) {
                if (closeButton) closeButton.addEventListener("click", () => {
                    if (fModal) fModal.remove();
                });
    
                let linkWhite = document.getElementById("link-news-whitepaper"),
                    linkRoad = document.getElementById("link-news-roadmap");

                switch (language) {
                    case "spanish":
                        linkWhite.setAttribute("href", "https://docs-es.cyphermu.com/cypher-mu/introduccion");
                        linkRoad.setAttribute("href", "https://docs-es.cyphermu.com/info-del-proyecto/hoja-de-ruta");
                        break;

                    case "english":
                        linkWhite.setAttribute("href", "https://docs-en.cyphermu.com/cypher-mu/introduction");
                        linkRoad.setAttribute("href", "https://docs-en.cyphermu.com/project-info/roadmap");
                        break;
                }
    
                if (checkShow) checkShow.addEventListener("click", () => {
                    let _check = checkShow.checked;
    
                    if (_check) {
                        document.cookie = "notshow=" + 1;
                    } else {
                        document.cookie = "notshow=" + 0;
                    }
                });
            }
            // MODAL NEWS ------------------

            me.showOnlines();

            addToken.addEventListener("click", async () => {
                if (me.web3Connected) {
                    if (window.ethereum) {
                        window.ethereum.request({
                            method: 'wallet_watchAsset',
                            params: {
                              type: 'ERC20',
                              options: {
                                address: contracts.token.address,
                                symbol: 'CYPHER',
                                decimals: 18,
                              },
                            },
                        });
                    }
                } else {
                    viewMessage("need-connected");
                }
            });

            copyTokenAddress.addEventListener("click", () => {
                copy(contracts.token.address);
                viewMessage("success-copy-address");
            });

            this.setLinksEvents(main);
            setStaticLabels("index");
        });
    }

    view_inventory() {
        let classInventory = new Inventory(this.web3);
        classInventory.renderInventory(1, ['all']);
        this.setActiveNavigation("inv");
        this.setTitle(getLabel(".lbl-inventory"));
    }

    view_staking() {
        let classStake = new Staker(this.web3);
        classStake.renderStaking();
        this.setTitle("Staking");
    }

    view_marketplace() {
        let classMarket = new Marketplace(this.web3);
        classMarket.renderMarketplace();
        this.setTitle(getLabel(".lbl-marketplace"));
    }

    view_userPanel() {
        let classAccount = new Account(this.web3);
        classAccount.render_PanelAccount();
    }

    view_createAccount () {
        let classAccount = new Account(this.web3);
        classAccount.render_CreateAccount();
    }

    view_swapGP() {
        let classAccount = new Account(this.web3);
        classAccount.render_SwapGPCYPHER();
        this.setActiveNavigation("swap");
        this.setTitle(getLabel(".lbl-swap"));
    } 

    view_rankings() {
        let classRanking = new Rankings();
        classRanking.renderRanking();
        this.setTitle("Rankings");
    }

    view_downloads() {
        let params = { language: getUserLanguage() };

        loadView_POST('/download', 'main', '/downloads', params).then( () => {
            let infoContent = document.getElementById("client-info-content"),
                reqContent = document.getElementById("client-req-content"),
                buttonInfo = document.getElementById("button-info"),
                buttonReq = document.getElementById("button-req"),
                buttonDownload = document.getElementById("button-download");

            infoContent.style.display = "flex";
            
            buttonInfo.addEventListener("click", () => {
                infoContent.style.display = "flex";
                reqContent.style.display = "none";

                buttonInfo.classList.add("active");
                buttonReq.classList.remove("active");
            });

            buttonReq.addEventListener("click", () => {
                reqContent.style.display = "flex";
                infoContent.style.display = "none";

                buttonReq.classList.add("active");
                buttonInfo.classList.remove("active");
            });

            this.setTitle(getLabel("lbl-download-title"));
        });
    }

    async show_contentMenu() {
        var buttonConnect = document.getElementById("button-connect"),
            buttonConnectHeader = document.getElementById("button-connect-head"),
            header_connect_content = document.getElementById("wallet-account"),
            accountContent = document.getElementById("account-content"),
            labelAccount = document.getElementById("label-account"),
            swapLabel = document.getElementById("nav-swap"),
            inviteFriends = document.getElementById("nav-invite"),
            me = this, openForm = false,
            eventPanel = async () => {
                if (!openForm) {
                    openForm = true;
                    await me.web3Connected ? me.view_userPanel() : me.view_index();
                    openForm = false;
                }
            },
            eventCreate = async () => {
                if (!openForm) {
                    openForm = true;
                    await me.web3Connected ? me.view_createAccount() : me.view_index();
                    openForm = false;
                }
            };


        inviteFriends.addEventListener("click", async () => {
            let params = { language: getUserLanguage(), address: getUserAddress() };
            if (!openForm) {
                openForm = true;
                await POST_Function('/invite-friends', params).then( async (res) => {
                    let htmlCode = await res.text();
                    await createFormModal(htmlCode);

                    let walletCopy = document.getElementById("wallet-copy"),
                        linkInvite = document.getElementById("link-invite");

                    walletCopy.addEventListener("click", async () => {
                        copy(linkInvite.value);
                        viewMessage("success-copy-link");
                    });
                });
                openForm = false;
            }
        });

        if (me.web3Connected) {
            buttonConnect.style.display = "none";
            buttonConnectHeader.style.display = "none";
            header_connect_content.style.display = "flex";
            accountContent.style.display = "flex";

            let tmpUser = await getUserByWallet(getUserAddress());
            if (!tmpUser) {
                labelAccount.innerHTML = '<span class="menu-icon"><i class="fa-solid fa-user-plus"></i></span><span id="lbl-createaccount" class="menu-text">' + getLabel("lbl-createaccount") + '</span>';
                swapLabel.style.display = "none";
                inviteFriends.style.display = "none";
                labelAccount.onclick = eventCreate;
            } else {
                labelAccount.innerHTML = '<span class="menu-icon"><i class="fa-duotone fa-user-gear"></i></span><span id="lbl-userpanel" class="menu-text">' + getLabel("lbl-userpanel") + '</span>';
                swapLabel.style.display = "flex";
                inviteFriends.style.display = "flex";

                //get referrals
                await POST_Function('/getReferrals', {address: getUserAddress()}).then( async (res) => {
                    let rta = await res.json(),
                        usersReferrals = rta.message;
                    
                    console.log(usersReferrals);
                    let lblReferrals = document.getElementById("referrals");
                    if (lblReferrals) lblReferrals.innerHTML = '<i class="fa-duotone fa-people-group"></i> ' + usersReferrals;
                });

                labelAccount.onclick = eventPanel;
            }
        } else {
            header_connect_content.style.display = "none";
            accountContent.style.display = "none";
            inviteFriends.style.display = "none";
        }
    }

    show_accountInfo() {
        var inputCypherBalance = document.getElementById("label-cypher-balance"),
            inputBnbBalance = document.getElementById("label-bnb-balance"),
            labelAddress = document.getElementById("label-address"),
            copyAddress = document.querySelector(".wallet-address-copy"),
            me = this;

        async function getCYPHERBalance() {
            let networkId = await me.web3.eth.net.getId();
            let balance = (networkId == mainNetwork) ? await me.tokenInstance.methods.balanceOf(getUserAddress()).call() : 0;
            return balance;
        }

        async function showBalances() {
            getCYPHERBalance().then( (cypherBalance) => {
                let tmpCYPHER = (cypherBalance / 1000000000000000000);
                inputCypherBalance.innerHTML = tmpCYPHER.toFixed(5);
            });
            
            // Balance BNB
            me.web3.eth.getBalance(getUserAddress())
            .then(function (bnbBalance) {
                let tmpBNB = (bnbBalance / 1000000000000000000);
                inputBnbBalance.innerText = tmpBNB.toFixed(6);
            });
        }

        labelAddress.innerHTML = getUserAddress();

        copyAddress.addEventListener("click", () => {
            copy(labelAddress.innerHTML);
            viewMessage("success-copy-address");
        });

        showBalances();
    }

    showHeaderInfo() {
        this.show_contentMenu();

        if (this.web3Connected) {
            this.show_accountInfo();
        } else {
            this.eventsConnect();
        }
    }

    async show_connectModal() {
        var me = this;
        let params = {
            language: getUserLanguage()
        };

        await POST_Function('/web3-login', params).then( async (res) => {
            let htmlCode = await res.text();
            await createFormModal(htmlCode);

            let metamaskButton = document.getElementById("metamask-login"),
                walletConnectButton = document.getElementById("walletconnect-login");

            let metamaskEvent = async () => {
                    await closeModalWithAnim();
                    requestConnection().then( (result) => {
                        me.web3Connected = result.connect;
                        
                        me.showHeaderInfo();
                        if (me.web3Connected) me.web3.setProvider(getProvider());
                    });
                },
                walletconnectEvent = async () => {
                    await closeModalWithAnim();
                    walletCRequest().then( (result) => {
                        me.web3Connected = result.connect;

                        me.showHeaderInfo();
                        if (me.web3Connected) me.web3.setProvider(getProvider());
                    });
                };

            metamaskButton.onclick = metamaskEvent;
            walletConnectButton.onclick = walletconnectEvent;
        });
    }

    eventsConnect() {
        var openModal = false, me = this;
        let buttonConnect = document.getElementById("button-connect"),
            buttonConnectHeader = document.getElementById("button-connect-head"),
            eventConnect = async () => {
                if (!openModal) {
                    openModal = true;
                        await me.show_connectModal();
                    openModal = false;
                }
            };

        if (!buttonConnect.onclick) buttonConnect.onclick = eventConnect;
        if (!buttonConnectHeader.onclick) buttonConnectHeader.onclick = eventConnect;
    }

    checkURL() {

        var me = this;
        /*setInterval(() => {
            let hash = document.location.hash;
            me.actUrl = hash;

            if (me.actUrl != me.lastUrl) {
                me.redirectPage(me.actUrl);
                me.lastUrl = hash;
            }

        }, 100);*/
        let pathname = document.location.pathname;
        me.redirectPage(pathname);
    }
}