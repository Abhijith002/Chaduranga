# Chaduranga

A decentralized chess app

## About

This is a chess dApp where any two players can stake coins of their choice and play a game of chess. A smart contract deployed on Polygon Mumbai Testnet validates the moves using [Chainlink Any API](https://docs.chain.link/docs/request-and-receive-data/) oracle by calling the external API deployed on google cloud run. Once in checkmate all the coins are transferred to winner's metamask wallet.

## Architecture

<img src="https://github.com/Abhijith002/chadurangamoralis/blob/57b9a1da12ad3a7a354b58bb95d31bbda1476cc0/Diagram.png" width="600px" />

The chess moves are communicated between front end, smart contract and the validator using FEN notation.

- fen -> "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2" | comment -> "king's pawn opening"
- fen -> "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3" | comment -> "giuoco piano"

## App

The application can be accessed at [Chaduranga](https://chaduranga-1296a.web.app/)

## Libraries used

- [Chessground](https://github.com/ruilisi/react-chessground).
- [Chess.js](https://github.com/jhlywa/chess.js/blob/master/README.md)
- [TailwindCSS](https://tailwindcss.com/)
- [Web3.js](https://web3js.readthedocs.io/en/v1.5.2/)
- [Truffle](https://trufflesuite.com/)
- [ChainLink](https://github.com/smartcontractkit/chainlink/tree/master/contracts)
- [Moralis](https://docs.moralis.io/)

# Steps to play

- User has to create a new game by clicking on the `CREATE NEW GAME` button.
- Enter the `Nickname` and `Number of tokens` to stake.
- Metamask pops up asking for transaction confirmation to transfer the tokens to the smart contract.
- Upon successful transaction fresh chess board appears with the 5 letter `game ID` at the top.
- Pass the game ID to the opponent who can click on `JOIN GAME` button and enter the `game ID`, `Nickname` and `Number of tokens` to stake.
- Once the opponent confirms the transaction the game will begin.
- Upon each move metamask will popup asking for a gas fee which needs to be sent mandatorily to proceed with the game.

## Limitations

- Currently only two players can play at any given point of time.
- Gas fees needs to be paid on each chess move since there is a state change in the smart contract.
- The chess move validation is done using an external API which is called from the smart contract using Chainlink oracles. Hence the contract should have sufficient LINK to execute and validate the chess moves.
- Time controls are not available since there is no backend server but ony Moralis.
- The person who creates the game will always have white pieces.
- Since there is not backend server the application state is entirely stored in the front end. Hence any refresh to the DOM will cause app inconsistency.

## TODO

- Time control.
- Players can choose pieces.
- Gas fee reduction.
