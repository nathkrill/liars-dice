const { default: Dice } = require('./class.Dice');
const { default: UI } = require('./class.UI');
const { default: Bet } = require('./class.Bet');
let peer,connection,ui,players = [],connections = [], game, name,isHost = false;

function hostGame() {
    return new Promise((res, rej) => {
        isHost = true;
        peer = new Peer();
        peer.on('open', id => {
            connection = peer.connect(id);
            let idTag = document.createElement('span');
            idTag.classList.add('game-id');
            idTag.innerHTML = id;
            ui.addItem(idTag);
            name = playerName.value;
            addPlayerToRoster(playerName.value + ' (host)');
            players.push({
                host: true,
                name: playerName.value,
                diceRemaining: 5,
                dice: []
            });
            let startButton = document.createElement('button');
            startButton.innerHTML = 'Start Game';
            startButton.addEventListener('click', playGame, false);
            ui.addItem(startButton);
            res();
        });
    });
}

function onData(data) {
    switch (data.action) {
        case 'join':
            let player = data.player;
            player.connection = this.connectionId;
            players.push(player);
            addPlayerToRoster(player.name);
            connections.forEach(conn => {
                conn.send({
                    action: 'lobby',
                    players: players
                })
            });
            break;
        case 'lobby':
            clearRoster();
            data.players.forEach(player => {
                addPlayerToRoster(player.name + `${player.host ? ' (host)' : ''}`);
            });
            break;
        case 'syncGame':
            game = data.game;
            ui.setGame(game,name);
            break;
        case 'placeBet':
            updateBet(data.bet);
            break;
        case 'doubtBet':
            checkDice(data.name);
            break;
        case 'checkDice':
            ui.showResult(data.result);
        default:
            // console.log(data);
            break;
    }
}

function joinGame(id) {
    return new Promise((res, rej) => {
        peer = new Peer();
        peer.on('open', () => {
            connection = peer.connect(id);
            connection.on('open', res);
        })
    });
}

function addPlayerToRoster(name) {
    let el = document.createElement('li');
    el.innerHTML = name;
    playerRoster.appendChild(el);
}

function clearRoster() {
    playerRoster.innerHTML = '';
}

function startGame() {
    peer.on('connection', conn => {
        connections.push(conn);
        conn.on('data', onData.bind(conn));
    });
}

function rollDice() {
    players.forEach(player => {
        player.dice = [];
        for (let index = 0; index < player.diceRemaining; index++) {
            let dice = new Dice();
            dice.roll();
            player.dice.push(dice.getValue());
        }
    });
}

function syncGame(game = {
    players: [],
    currentBet: {
        dice: null,
        count: null
    }
}) {
    connections.forEach(conn => {
        conn.send({
            action: 'syncGame',
            game: game
        });
    });
}

function playGame() {
    rollDice();
    players[1].isCurrent = true;
    game = {
        players: players,
        currentBet: {
            dice: null,
            count: null
        }
    };
    syncGame(game);
    ui.setGame(game,name);
}

function newRound(loser) {
    rollDice();
    players.forEach(player => {
        player.isCurrent = false;
        if (player.name == loser) {
            player.isCurrent = true;
        }
    });
    game.currentBet = {
        dice: null,
        count: null
    };
    game.players = players;
    syncGame(game);
    ui.setGame(game, name);
}

function checkDice(name) {
    let diceCount = {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0,
        '6': 0,
    };
    players.forEach(player => {
        player.dice.forEach(die => {
            diceCount[die.toString()]++;
        });
    });
    let loser,isOut = false;
    if (diceCount[game.currentBet.dice] + diceCount['1'] < game.currentBet.count) {
        loser = game.currentBet.player;
    } else {
        loser = name;
    }
    players.forEach(player => {
        if (player.name == loser) {
            player.diceRemaining = player.diceRemaining - 1;
            if (player.diceRemaining == 0) {
                isOut = true;
            }
        }
    })
    let result = {
        players: players,
        bet: game.currentBet,
        doubt: name,
        loser: loser,
        total: diceCount[game.currentBet.dice] + diceCount['1'],
        isOut: isOut
    }
    connections.forEach(conn => {
        conn.send({
            action: 'checkDice',
            result: result
        });
    });
    ui.showResult(result);
}


function updateCurrentPlayer(currentIndex) {
    if (currentIndex == players.length - 1) {
        currentIndex = 0;
    } else {
        currentIndex++;
    }
    players[currentIndex].isCurrent = true;
}

function updateBet(bet) {
    let currentPlayerIndex = null;
    players.forEach((player,index) => {
        if (player.isCurrent) {
            player.isCurrent = !player.isCurrent;
            currentPlayerIndex = index;
        }
    });
    game.currentBet = bet;
    updateCurrentPlayer(currentPlayerIndex);
    game.players = players;
    syncGame(game);
    ui.setGame(game, name);
}

function setStatus(newStatus) {
    status = newStatus;
}

function init() {
    ui = new UI();
    hostGameBtn.addEventListener('click', () => {
        hostGame().then(startGame);
    }, false);

    joinGameBtn.addEventListener('click', () => {
        joinGame(joinId.value).then((e) => {
            name = playerName.value;
            connection.send({
                action: 'join',
                player: {
                    name: playerName.value,
                    host: false,
                    diceRemaining: 5,
                    dice: []
                }
            });
            connection.on('data', onData);
        });
    })

    window.validateBet = function (newBet, currentBet) {
        return new Promise((res, rej) => {
            if (!currentBet) {
                res();
            }
            if (newBet.count < currentBet.count) {
                rej();
            }
            if (newBet.count == currentBet.count && newBet.dice <= currentBet.dice) {
                rej();
            }
            res();
        })
    }

    window.placeBet = function (bet) {
        if (isHost) {
            updateBet(bet);
        } else {
            connection.send({
                action: 'placeBet',
                bet: bet
            });
        }
    }

    window.doubtBet = function () {
        if (isHost) {
            checkDice(name);
        } else {
            connection.send({
                action: 'doubtBet',
                name: name
            });
        }
    }

    window.isHost = function () {
        return isHost;
    }

    window.newRound = newRound;
}

document.addEventListener('DOMContentLoaded', init, false);