import React, {useEffect, useState} from "react";
import {useLocation, Navigate} from "react-router-dom";
import {useMoralis} from "react-moralis";
import Chessground from "../Chess";
import {notification, Modal} from "antd";
import Chess from "chess.js";
import ChessContract from "../LandingPage/contracts/chess_contract.json";
import "../Chess/styles/chessground.css";
import "../Chess/styles/chessground-theme.css";
import queen from "./images/wQ.svg";
import rook from "./images/wR.svg";
import bishop from "./images/wB.svg";
import knight from "./images/wN.svg";
import logo from "./images/knight-chess.png";

const ChessGame = (props) => {
  let location = useLocation();
  const [chess, setChess] = useState(new Chess());
  const [pendingMove, setPendingMove] = useState();
  const [selectVisible, setSelectVisible] = useState(false);
  const [fen, setFen] = useState("");
  const [lastMove, setLastMove] = useState();
  const [playerOne, setPlayerOne] = useState("Guest112");
  const [contInstance, setContInstance] = useState();
  const [web3, setWeb3] = useState();
  const {Moralis, authenticate, isAuthenticated, logout, account, chainId} =
    useMoralis();

  const onMove = (from, to) => {
    const moves = chess.moves({verbose: true});
    for (let i = 0, len = moves.length; i < len; i++) {
      /* eslint-disable-line */
      if (moves[i].flags.indexOf("p") !== -1 && moves[i].from === from) {
        setPendingMove([from, to]);
        setSelectVisible(true);
        return;
      }
    }
    if (chess.move({from, to, promotion: "x"})) {
      let fen = chess.fen();
      setFen(fen);
      setLastMove([from, to]);
      web3.eth.getAccounts().then((accounts) => {
        contInstance.methods
          .play(
            ChessContract.chessvalidator.oracle,
            ChessContract.chessvalidator.jobID,
            "0x" + ChessContract.chessvalidator.fee.toString(16),
            ChessContract.chessvalidator.url + fen,
            ChessContract.chessvalidator.path,
            ChessContract.chessvalidator.times,
            from,
            to,
            location.state.chessColor
          )
          .send({from: accounts[0]})
          .then((reqID) => {
            console.log(reqID);
          })
          .catch((error) => {
            window.alert("An error happened" + error);
          });
      });
    }
  };

  const opponentMove = async (instance) => {
    let query = new Moralis.Query("Played");
    let subscription = await query.subscribe();
    subscription.on("create", (object) => {
      if (object.attributes.color !== location.state.chessColor) {
        chess.move({from: object.attributes.from, to: object.attributes.to});
        setFen(chess.fen());
        setLastMove([object.attributes.from, object.attributes.to]);
      }
    });
  };

  const promotion = (e) => {
    const from = pendingMove[0];
    const to = pendingMove[1];
    chess.move({from, to, promotion: e});
    let fen = chess.fen();
    setFen(fen);
    setLastMove([from, to]);
    setSelectVisible(false);
    web3.eth.getAccounts().then((accounts) => {
      contInstance.methods
        .play(
          ChessContract.chessvalidator.oracle,
          ChessContract.chessvalidator.jobID,
          ChessContract.chessvalidator.fee,
          ChessContract.chessvalidator.url + fen,
          ChessContract.chessvalidator.path,
          ChessContract.chessvalidator.times,
          from,
          to,
          location.state.chessColor
        )
        .send({from: accounts[0]})
        .then((reqID) => {
          console.log(reqID);
        })
        .catch((error) => {
          window.alert("An error happened" + error);
        });
    });
  };

  const turnColor = () => {
    return chess.turn() === "w" ? "white" : "black";
  };

  const calcMovable = () => {
    const dests = new Map();
    chess.SQUARES.forEach((s) => {
      const ms = chess.moves({square: s, verbose: true});
      if (ms.length)
        dests.set(
          s,
          ms.map((m) => m.to)
        );
    });
    return {
      free: false,
      dests,
      color: "both",
    };
  };

  const handleCopyGameID = () => {
    navigator.clipboard.writeText(location.state.game_id);
    notification.info({message: "Game ID copied to clipboard"});
  };

  const getPlayersFromCont = async (instance) => {
    const players = await instance.methods.getPlayers().call();
    return players[0].nickname;
  };

  const getWeb3Instance = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await Moralis.enableWeb3();

      setWeb3(web3);

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = ChessContract.networks[networkId];
      const instance = new web3.eth.Contract(
        ChessContract.abi,
        deployedNetwork && deployedNetwork.address
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      return instance;
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`
      );
      console.error(error);
    }
  };

  useEffect(() => {
    async function waiting() {
      let instance = await getWeb3Instance();
      setContInstance(instance);
      console.log(instance);
      if (location.state.chessColor === "black") {
        let playerone = await getPlayersFromCont(instance);
        setPlayerOne(playerone);
      }
      if (location.state.chessColor === "white") {
        let query = new Moralis.Query("ChessGround");
        let subscription = await query.subscribe();
        subscription.on("create", (object) => {
          setPlayerOne(object.attributes.nickname);
          notification.open({
            message: object.attributes.nickname + " has joined the Game",
          });
        });
      }
      let query = new Moralis.Query("GameOver");
      let subscription = await query.subscribe();
      subscription.on("create", (object) => {
        notification.open({
          message: "game is over, " + object.attributes.winner + " has won",
        });
      });
      opponentMove(instance);
    }
    waiting();
  }, []);

  return location.state !== null ? (
    <>
      <header className="text-gray-600 body-font">
        <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
          <a
            className="flex title-font font-medium items-center text-gray-900 mb-4 md:mb-0"
            href="/"
          >
            <img
              className="w-12 h-12 text-white p-2 rounded-full"
              src={logo}
              alt="knight"
            />
            <span className="text-3xl font-mono">Chaduranga</span>
          </a>
        </div>
      </header>
      <div style={{height: "100vh", padding: "2%"}}>
        <div className="container px-5 py-5 mx-auto flex flex-wrap">
          <div className="flex flex-wrap -m-4 items-center">
            <div className="p-4 lg:w-1/4 md:w-full">
              <div className="flex border-2 rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col bg-gray-100">
                <div className="w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h2
                    className="text-gray-900 text-lg title-font font-medium mb-3 cursor-pointer"
                    onClick={() => handleCopyGameID()}
                  >
                    {location.state.game_id}
                  </h2>
                  <p className="leading-relaxed text-base">
                    Pass the game ID to the opponent. Click on game ID to copy
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4 lg:w-1/2 md:w-full">
              <div className="flex flex-col items-center text-center justify-center">
                <h2 className="w-full text-center font-medium title-font text-gray-900 text-xl">
                  {playerOne}
                </h2>
                <div className="w-12 h-1 bg-green-500 rounded mt-2 mb-4"></div>
              </div>
              <Chessground
                width="38vw"
                height="38vw"
                turnColor={turnColor()}
                movable={calcMovable()}
                orientation={location.state.chessColor}
                lastMove={lastMove}
                fen={fen}
                onMove={onMove}
                style={{margin: "auto"}}
              />
              <div className="flex flex-col items-center text-center justify-center mt-4">
                <h2 className="w-full text-center font-medium title-font text-gray-900 text-xl">
                  {location.state.nick_name}
                </h2>
                <div className="w-12 h-1 bg-green-500 rounded mt-2 mb-4"></div>
              </div>
            </div>
            <Modal visible={selectVisible} footer={null} closable={false}>
              <div style={{textAlign: "center", cursor: "pointer"}}>
                <span role="presentation" onClick={() => promotion("q")}>
                  <img src={queen} alt="" style={{width: 50}} />
                </span>
                <span role="presentation" onClick={() => promotion("r")}>
                  <img src={rook} alt="" style={{width: 50}} />
                </span>
                <span role="presentation" onClick={() => promotion("b")}>
                  <img src={bishop} alt="" style={{width: 50}} />
                </span>
                <span role="presentation" onClick={() => promotion("n")}>
                  <img src={knight} alt="" style={{width: 50}} />
                </span>
              </div>
            </Modal>
            <div className="p-4 lg:w-1/4 md:w-full">
              <div className="flex border-2 rounded-lg border-gray-200 border-opacity-50 p-8 sm:flex-row flex-col bg-gray-100">
                <div className="w-16 h-16 sm:mr-8 sm:mb-0 mb-4 inline-flex items-center justify-center rounded-full bg-green-500 text-white flex-shrink-0">
                  <svg
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="6" cy="6" r="3"></circle>
                    <circle cx="6" cy="18" r="3"></circle>
                    <path d="M20 4L8.12 15.88M14.47 14.48L20 20M8.12 8.12L12 12"></path>
                  </svg>
                </div>
                <div className="flex-grow">
                  <h2 className="text-gray-900 text-lg title-font font-medium mb-3">
                    Total Stake
                  </h2>
                  <p className="leading-relaxed text-base">{`MATIC (${location.state.stake})`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  ) : (
    <Navigate to="/" replace={true} />
  );
};

export default ChessGame;
