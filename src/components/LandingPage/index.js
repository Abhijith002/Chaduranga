import React, {useState, useEffect} from "react";
import {useMoralis, useNativeBalance} from "react-moralis";
import {useNavigate} from "react-router-dom";
import Address from "./compontns/Address";
import logo from "./knight-chess.png";
import AssetSelector from "./compontns/AssetSelector";
import ChessConfig from "./contracts/chess_contract.json";

function LandingPage(props) {
  const [showModal, setShowModal] = useState(false);
  const {data: balance} = useNativeBalance(props);
  const [amount, setAmount] = useState();
  const [nickname, setNickName] = useState();
  const [gameid, setGameID] = useState();
  const [showgameid, setShowGameID] = useState(false);
  const [asset, setAsset] = useState();
  const [receiver, setReceiver] = useState();
  const [tx, setTx] = useState();
  const {Moralis, authenticate, isAuthenticated, logout, account, chainId} =
    useMoralis();
  let navigate = useNavigate();

  useEffect(() => {
    asset && amount && receiver ? setTx({amount, receiver, asset}) : setTx();
  }, [asset, amount, receiver]);

  /* Authentication code */
  const handleModal = (from) => {
    if (!isAuthenticated) {
      authenticate({signingMessage: "Hello"}).then(() => {
        if (from === "J") {
          setShowGameID(true);
        } else {
          setShowGameID(false);
        }
        setShowModal(true);
      });
    } else {
      if (from === "J") {
        setShowGameID(true);
      } else {
        setShowGameID(false);
      }
      setShowModal(true);
    }
  };

  const handleCreateGame = async () => {
    var game_id = makeid(5);
    if (showgameid) {
      game_id = gameid;
    }
    setGameID(game_id);
    const web3 = await Moralis.enableWeb3();
    const networkId = await web3.eth.net.getId();
    const deployedNetwork = ChessConfig.networks[networkId];
    const contract = new web3.eth.Contract(
      ChessConfig.abi,
      deployedNetwork && deployedNetwork.address
    );
    await contract.methods
      .register(game_id, nickname)
      .send({from: account, value: Moralis.Units.Token(amount, "18")})
      .then(() => {
        setShowModal(false);
        navigate("/Chess", {
          replace: true,
          state: {
            game_id: game_id,
            nick_name: nickname,
            chessColor: showgameid ? "black" : "white",
            stake: amount,
          },
        });
      });
    // const receipt = await Moralis.executeFunction(options).then(() => {
    //   alert("Success!!!!!");
    // });
  };

  const makeid = (length) => {
    var result = "";
    var characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  };

  return (
    <>
      <section className="text-gray-600 body-font">
        <div className="container mx-auto flex px-5 py-20 items-center justify-center flex-col">
          <img
            className="lg:w-2/6 md:w-3/6 w-5/6 mb-10 object-cover object-center rounded"
            alt="hero"
            src={logo}
          />
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl md:text-6xl text-3xl mb-4 font-medium font-mono text-gray-900">
              Chaduranga
            </h1>
            <p className="mb-8 leading-relaxed font-mono text-2xl">
              Stake coins of your choice to play decentralised Chess.
            </p>
            <div className="flex justify-center">
              <button
                className="inline-flex text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded text-lg font-mono"
                onClick={() => handleModal("C")}
              >
                CREATE GAME
              </button>
              <button
                onClick={() => handleModal("J")}
                className="ml-4 inline-flex text-white bg-green-500 border-0 py-2 px-6 focus:outline-none hover:bg-green-600 rounded text-lg font-mono"
              >
                JOIN GAME
              </button>
            </div>
          </div>
        </div>
      </section>
      {showModal ? (
        <>
          <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                {/*header*/}
                <div className="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t">
                  <h3 className="text-3xl font-semibold font-mono">
                    Enter Stake
                  </h3>
                  <button
                    className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                    onClick={() => setShowModal(false)}
                  >
                    <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                      ×
                    </span>
                  </button>
                </div>
                {/*body*/}
                <div className="lg:w-full md:w-1/2 bg-gray-100 rounded-lg p-8 flex flex-col w-full mt-10 md:mt-0">
                  {/* <div className="flex w-full justify-center items-center justify-items-center content-center">
                    <Blockie scale={4} avatar currentWallet style />
                  </div> */}
                  <div className="flex-col w-full justify-center items-center justify-items-center content-center mb-5 font-mono">
                    <h2 className="text-gray-900 text-center text-lg font-medium title-font mt-1 font-mono">
                      Address
                    </h2>
                    <Address size="16" copyable />
                    <div className="text-center">{balance.formatted}</div>
                  </div>
                  <div className="relative mb-4">
                    <label
                      htmlFor="full-name"
                      className="leading-7 text-sm text-gray-600"
                    >
                      Nickname
                    </label>
                    <input
                      type="text"
                      id="full-name"
                      name="full-name"
                      onChange={(e) => setNickName(`${e.target.value}`)}
                      className="w-full bg-white rounded border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    />
                  </div>
                  {showgameid && (
                    <div className="relative mb-4">
                      <label
                        htmlFor="gameID"
                        className="leading-7 text-sm text-gray-600"
                      >
                        Game ID
                      </label>
                      <input
                        type="text"
                        id="gameID"
                        name="gameID"
                        onChange={(e) => {
                          setGameID(`${e.target.value}`);
                        }}
                        className="w-full bg-white rounded border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                      />
                    </div>
                  )}
                  <div className="relative mb-4">
                    <label
                      htmlFor="amount"
                      className="leading-7 text-sm text-gray-600"
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      onChange={(e) => {
                        setAmount(`${e.target.value}`);
                      }}
                      className="w-full bg-white rounded border border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
                    />
                  </div>
                  <div className="relative mb-4">
                    <label
                      htmlFor="asset"
                      className="leading-7 text-sm text-gray-600"
                    >
                      Asset
                    </label>
                    <AssetSelector
                      setAsset={setAsset}
                      style={{width: "100%"}}
                    ></AssetSelector>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    Literally you probably haven't heard of them jean shorts.
                  </p>
                </div>
                {/*footer*/}
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent text-lg font-mono uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                  <button
                    className="bg-green-500 text-white text-lg font-mono active:bg-green-600 uppercase text-sm px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                    type="button"
                    onClick={() => handleCreateGame()}
                  >
                    {showgameid ? "JOIN GAME" : "CREATE GAME"}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
      ) : null}
    </>
  );
}

export default LandingPage;
