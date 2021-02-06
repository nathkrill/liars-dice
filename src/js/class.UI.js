import Bet from './class.Bet';

export default class UI {
    constructor() {
        this.el = document.querySelector('main');
    }

    clear() {
        this.el.innerHTML = null;
        this.el.className = '';
    }

    /**
     * 
     * @param {HTMLElement} item 
     */
    addItem(item) {
        this.el.appendChild(item);
    }

    setGame(game, name) {
        this.clear();
        let players = '';
        let currentPlayer;
        let turnPlayer;
        game.players.forEach(player => {
            if (player.isCurrent) {
                turnPlayer = player.name;
            }
            players += `
                <li>
                    <h3 class='${player.isCurrent ? 'current' : '' }'>
                        ${player.isOut ? '<strike>' : ''}
                            ${player.name} ${!player.isOut ? `(${player.diceRemaining} dice left)` : ''}
                        ${player.isOut ? '</strike>' : ''}
                    </h3>
                </li>
            `;
            if (player.name == name) {
                currentPlayer = player;
            }
        });
        let myDice = '';
        if (!currentPlayer.isOut) {
            currentPlayer.dice.forEach(die => {
                myDice += `<li><dice-el value="${die}"></dice-el></li>`;
            });
        }
        let item = document.createElement('article');
        item.classList.add('game');
        item.innerHTML = `
            <h2>Players</h2>
            <ul class='players'>
                ${players}
            </ul>
            <h2>
                Current Bet
                ${
                    game.currentBet.dice ? 
                        `
                            <br>
                            <small>(${game.currentBet.player})</small>
                        `
                    : ''
                }
            </h2>
            <p style='display: flex;flex-flow:row wrap;justify-content: flex-start;align-items:center'>
                ${
                    game.currentBet.dice ? `<dice-el value="${game.currentBet.dice}"></dice-el> &nbsp;x${game.currentBet.count}`
                    : 'There is no current bet'
                }
            </p>
            <h2>My Dice</h2>
            <ul class='dice'>${myDice}</ul>
            ${
                currentPlayer.isCurrent ?
                    `
                        <h2>It is your go</h2>
                        <div class='bet'>
                            <p>
                                Bet: <br>
                                <counter-el id="betNumber" value="${game.currentBet.count ? game.currentBet.count : '1'}" min='1'></counter-el> x
                                &nbsp;
                                <dice-counter
                                    id="betDie"
                                    value="${game.currentBet.dice ? game.currentBet.dice : ''}"
                                    ${game.isPalefico ? 'allowones' : ''}
                                    ${
                                        game.isPalefico ?
                                            `${
                                                game.currentBet.dice ? 'disabled' : ''
                                            }`
                                        : ''
                                    }
                                ></dice-counter><br>
                                <button
                                    id="placeBet"
                                    onClick='(() => {
                                        window.validateBet({
                                            count: betNumber.value,
                                            dice: betDie.value,
                                        }, ${JSON.stringify(game.currentBet)}).then(() => {
                                            window.placeBet({
                                                count: betNumber.value,
                                                dice: betDie.value,
                                                player: "${currentPlayer.name}"
                                            });
                                        }, e => {
                                            badBet.innerHTML = e;
                                        })
                                    })()'
                                >Place Bet</button><span id="badBet" style='color: red;'><span>
                            </p>
                            ${
                                game.currentBet.dice && !game.isPalefico ?
                                `<button
                                    id="exact"
                                    onClick='(() => {
                                        window.exactBet("${currentPlayer.name}");
                                    })()'
                                >Exact</button>`
                                : ``
                            }
                            ${
                                game.currentBet.dice ?
                                    `<button
                                        id="doubt"
                                        onClick='(() => {
                                            window.doubtBet();
                                        })()'
                                    >Doubt</button>`
                                : ``
                            }
                        </div>
                    `
                : `<h2>It is ${turnPlayer}'s go</h2>`
            }
        `;
        this.addItem(item);
    }
    showResult(result) {
        this.clear();
        let item = document.createElement('article');
        item.classList.add('result');
        let players = '';
        result.players.forEach(player => {
            let dice = '';
            player.dice.forEach(die => {
                dice += `
                    <li>
                        <dice-el value="${die}"
                            ${
                                result.bet.dice == die || (die == 1 && !result.wasPalefico) ?
                                    'style="--dice-border-width: 4px;--dice-border-color: hsl(var(--sandstone-hue), var(--sandstone-sat), 30%);"'
                                : ''
                            }
                        ></dice-el>
                    </li>
                `;
            });
            players += `
                <li>
                    <h4>${player.name}</h4>
                    <ul class='dice'>
                        ${dice}
                    </ul>
                </li>
            `;
        });
        item.innerHTML = `
            <h2>Show the dice!</h2>
            <ul class='players' style='list-style:none;padding: 0;margin: 1em 0;'>${players}</ul>
            <p>The bet was ${result.bet.count}x ${result.bet.dice}. ${result.doubt} doubted.</p>
            <p>There were a total of ${result.total}x ${result.bet.dice} ${result.wasPalefico ? '' : '+ 1.'}</p>
            <p>${result.loser} loses a die.</p>
            ${
                result.isOut ?
                    `${result.loser} is out of the game.`
                : ''
            }
            ${
                window.isHost() ?
                    `<button
                        onClick="
                            (() => {
                                window.newRound('${result.loser}');
                            })()
                        "
                        >Continue</button>
                    `
                : ''
            }
        `;
        this.addItem(item);
    }
    showExact(result) {
        this.clear();
        let item = document.createElement('article');
        item.classList.add('result');
        let players = '';
        result.players.forEach(player => {
            let dice = '';
            player.dice.forEach(die => {
                dice += `
                    <li>
                        <dice-el value="${die}"
                            ${
                                result.bet.dice == die || (die == 1 && !result.wasPalefico) ?
                                    'style="--dice-border-width: 4px;--dice-border-color: hsl(var(--sandstone-hue), var(--sandstone-sat), 30%);"'
                                : ''
                            }
                        ></dice-el>
                    </li>
                `;
            });
            players += `
                <li>
                    ${player.name}: 
                    <ul class='dice'>
                        ${dice}
                    </ul>
                </li>
            `;
        });
        item.innerHTML = `
            <h2>Show the dice!</h2>
            <ul class='players' style='list-style:none;padding: 0;margin: 1em 0;'>${players}</ul>
            <p>The bet was ${result.bet.count}x ${result.bet.dice}. ${result.exact} called exact.</p>
            <p>There were a total of ${result.total}x ${result.bet.dice} + 1.</p>
            <p>
                ${
                    result.win && result.gotDice ?
                        `${result.exact} was correct! They gained 1 die,`
                    : `${
                        result.win ? 
                            `${result.exact} was correct! They already have 5 dice.`
                        : `${result.exact} was wrong. They lost 1 die.`
                    }`
                }
            </p>
            ${
                result.isOut ?
                    `${result.exact} is out of the game.`
                : ''
            }
            ${
                window.isHost() ?
                    `<button
                        onClick="
                            (() => {
                                window.newRound('${result.exact}');
                            })()
                        "
                        >Continue</button>
                    `
                : ''
            }
        `;
        this.addItem(item);
    }
}