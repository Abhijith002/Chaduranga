//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract Chess is ChainlinkClient {
    using Chainlink for Chainlink.Request;
    address payable[2] players;
    uint8 public index = 0;
    uint256 public turn = 0;
    bool public finished = false;
    uint256 public data = 0;

    struct Game {
        string game_id;
        string nickname;
        address player_address;
    }

    struct Move {
        string from;
        string to;
        string color;
    }

    Game[2] game;
    Move public move;

    constructor(address _link) {
        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    event GameOver(string winner);

    function register(string memory game_id, string memory nickname)
        public
        payable
    {
        require(index < 2);
        require(msg.value > 0);
        players[index] = payable(msg.sender);
        game[index] = Game(game_id, nickname, msg.sender);
        if (index == 1) {
            emit PlayerJoined(nickname);
        }
        index++;
        if (index == 2) {
            finished = false;
        }
    }

    event PlayerJoined(string nickname);
    event Played(string from, string to, string color);

    modifier isSenderTurn() {
        require(msg.sender == players[turn]);
        _;
    }

    modifier gameNotFinished() {
        require(finished == false);
        _;
    }

    function play(
        address _oracle,
        bytes32 _jobId,
        uint256 _payment,
        string memory _url,
        string memory _path,
        int256 _times,
        string memory from,
        string memory to,
        string memory color
    ) public gameNotFinished isSenderTurn returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            _jobId,
            address(this),
            this.fulfill.selector
        );
        req.add("url", _url);
        req.add("path", _path);
        req.addInt("times", _times);
        requestId = sendChainlinkRequestTo(_oracle, req, _payment);
        move = Move(from, to, color);
    }

    function reset() public {
        index = 0;
        turn = 0;
        finished = false;
        players[0] = players[1] = payable(address(0));
        move.from = move.to = move.color = "";
        data = 0;
    }

    function fulfill(bytes32 _requestId, uint256 _data)
        public
        recordChainlinkFulfillment(_requestId)
    {
        data = _data;
        if (_data == 0) {
            emit Played(move.from, move.to, move.color);
            emit GameOver(game[turn].nickname);
            players[turn].transfer(address(this).balance);
            players[0] = players[1] = payable(address(0));
            game[0] = game[1] = Game("", "", address(0));
            move.from = move.to = move.color = "";
            index = 0;
            finished = true;
        }
        if (_data == 200) {
            emit GameOver(game[turn].nickname);
            players[turn].transfer(address(this).balance / 2);
            players[(turn + 1) % 2].transfer(address(this).balance);
            players[0] = players[1] = payable(address(0));
            game[0] = game[1] = Game("", "", address(0));
            move.from = move.to = move.color = "";
            index = 0;
            finished = true;
        }
        if (_data == 300) {
            emit GameOver(game[turn].nickname);
            players[(turn + 1) % 2].transfer(address(this).balance);
            players[0] = players[1] = payable(address(0));
            game[0] = game[1] = Game("", "", address(0));
            move.from = move.to = move.color = "";
            index = 0;
            finished = true;
        }
        if (_data == 100) {
            emit Played(move.from, move.to, move.color);
            turn = (turn + 1) % 2;
        }
    }

    function getTurn() public view returns (address) {
        return players[turn];
    }

    function getPlayers() public view returns (Game[2] memory) {
        return game;
    }

    function isFinished() public view returns (bool) {
        return finished;
    }
}
