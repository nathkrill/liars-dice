const { default: Dice } = require('./class.Dice');
const { default: UI } = require('./class.UI');
const { default: Bet } = require('./class.Bet');
require('./helpers/peer');
let peer,connection,ui,players = [],connections = [], game, name,isHost = false,palefico = false;

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

function hostGame() {
    return new Promise((res, rej) => {
        isHost = true;
        peer = new Peer(makeid(6), {
            host: 'akrill-peer-server.herokuapp.com',
            port: null,
            path: '/connect',
            config: {
                iceServers: [
                    { 'urls': 'stun:stun.l.google.com:19302' },
                    { 'urls': 'turn:akrill-peer-server.herokuapp.com', username: 'perudo', credential: 'dudo' }
                ],
                sdpSemantics: 'unified-plan'
            }
        });
        peer.on('open', id => {
            let idTag = document.createElement('span');
            idTag.classList.add('game-id');
            idTag.innerHTML = id;
            let idInfo = document.createElement('p');
            idInfo.innerHTML = 'Share this ID with players who want to join you.';
            ui.addItem(idTag);
            ui.addItem(idInfo);
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
            playerRoster.innerHTML = '<p>Players</p>';
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
        case 'exactBet':
            exactBet(data.name);
            break;
        case 'checkDice':
            ui.showResult(data.result);
            break;
        case 'showExact':
            ui.showExact(data.result);
            break;
        default:
            // console.log(data);
            break;
    }
}

function joinGame(id) {
    return new Promise((res, rej) => {
        peer = new Peer({
            host: 'akrill-peer-server.herokuapp.com',
            port: null,
            path: '/connect',
            config: {
                iceServers: [
                    { 'urls': 'stun:stun.l.google.com:19302' },
                    { 'urls': 'turn:akrill-peer-server.herokuapp.com', username: 'perudo', credential: 'dudo' }
                ],
                sdpSemantics: 'unified-plan'
            }
        });
        peer.on('open', () => {
            connection = peer.connect(id);
            connection.on('open', res);
            connection.on('error', e => {
                window.alert(`There was a problem setting up a connection ${e.type}: ${e.message}`);
            })
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
        },
        isPalefico: palefico
    };
    syncGame(game);
    ui.setGame(game,name);
}

function playersRemaining() {
    let count = 0;
    players.forEach(player => {
        if (!player.isOut) {
            count++;
        }
    });
    return count;
}

function declareWinner() {

}

function newRound(loser) {
    if (playersRemaining == 1) {
        declareWinner();
        return;
    }
    rollDice();
    players.forEach((player,index) => {
        player.isCurrent = false;
        if (player.name == loser) {
            if (player.isOut) {
                let nextIndex = index;
                if (index == players.length - 1) {
                    nextIndex = 0;
                } else {
                    nextIndex++;
                }
                newRound(players[nextIndex].name);
            } else {
                player.isCurrent = true;
            }
        }
    });
    game.currentBet = {
        dice: null,
        count: null
    };
    game.isPalefico = palefico;
    game.players = players;
    syncGame(game);
    ui.setGame(game, name);
}

function exactBet(name) {
    palefico = false;
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
    let isOut = false,didWin = false,gotDice = false;
    if (diceCount[game.currentBet.dice] + diceCount['1'] == game.currentBet.count) {
        didWin = true;
        players.forEach(player => {
            if (player.name == name) {
                if (player.diceRemaining < 5) {
                    gotDice = true;
                    player.diceRemaining = player.diceRemaining + 1;
                }
            }
        })
    } else {
        players.forEach(player => {
            if (player.name == name) {
                player.diceRemaining = player.diceRemaining - 1;
                if (player.diceRemaining == 0) {
                    player.isOut = true;
                    isOut = true;
                }
                if (player.diceRemaining == 1) {
                    palefico = true;
                }
            }
        })
    }
    let result = {
        players: players,
        bet: game.currentBet,
        exact: name,
        win: didWin,
        gotDice: gotDice,
        total: diceCount[game.currentBet.dice] + diceCount['1'],
        isOut: isOut
    }
    connections.forEach(conn => {
        conn.send({
            action: 'showExact',
            result: result
        });
    });
    ui.showExact(result);
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
    if (palefico) {
        if (diceCount[game.currentBet.dice] < game.currentBet.count) {
            loser = game.currentBet.player;
        } else {
            loser = name;
        }
    } else {
        if (diceCount[game.currentBet.dice] + diceCount['1'] < game.currentBet.count) {
            loser = game.currentBet.player;
        } else {
            loser = name;
        }
    }
    let wasPalefico = palefico;
    palefico = false;
    players.forEach(player => {
        if (player.name == loser) {
            player.diceRemaining = player.diceRemaining - 1;
            if (player.diceRemaining == 0) {
                isOut = true;
                player.isOut = true;
            }
            if (player.diceRemaining == 1) {
                palefico = true;
            }
        }
    })
    let result = {
        players: players,
        bet: game.currentBet,
        doubt: name,
        loser: loser,
        total: diceCount[game.currentBet.dice] + diceCount['1'],
        isOut: isOut,
        wasPalefico: wasPalefico
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
    game.isPalefico = palefico;
    syncGame(game);
    ui.setGame(game, name);
}

function setStatus(newStatus) {
    status = newStatus;
}

function init() {
    ui = new UI();
    hostGameBtn.addEventListener('click', () => {
        joinGameBtn.parentElement.removeChild(joinGameBtn);
        hostGameBtn.parentElement.removeChild(hostGameBtn);
        hostGame().then(startGame);
    }, false);

    joinGameBtn.addEventListener('click', () => {
        joinGameBtn.parentElement.removeChild(joinGameBtn);
        hostGameBtn.parentElement.removeChild(hostGameBtn);
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
            let wait = document.createElement('p');
            wait.innerHTML = 'Waiting for the host to start the game';
            ui.addItem(wait);
            connection.on('data', onData);
        });
    })

    window.validateBet = function (newBet, currentBet) {
        return new Promise((res, rej) => {
            if (newBet.count == 0) {
                rej('You cannot bet 0 dice.');
            }
            if (!currentBet) {
                res();
            }
            if (newBet.count < currentBet.count) {
                rej('You must increase the bet.');
            }
            if (newBet.count == currentBet.count && newBet.dice <= currentBet.dice) {
                rej('You may only decrease the dice if the bet increases.');
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

    window.exactBet = function (name) {
        if (isHost) {
            exactBet(name);
        } else {
            connection.send({
                action: 'exactBet',
                name: name
            });
        }
    }

    window.newRound = newRound;

    window.isPalefico = function () {
        return palefico;
    }
}

document.addEventListener('DOMContentLoaded', init, false);