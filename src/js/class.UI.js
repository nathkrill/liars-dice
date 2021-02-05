import Bet from './class.Bet';

export default class UI {
    constructor() {
        this.el = document.querySelector('main');
    }

    clear() {
        this.el.innerHTML = null;
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
        game.players.forEach(player => {
            players += `
                <li>
                    <h3>
                        ${player.isCurrent ? '<b>' : '' }
                            ${player.isOut ? '<strike>' : ''}
                                ${player.name}
                            ${player.isOut ? '</strike>' : ''}
                        ${player.isCurrent ? '</b>' : '' }
                    </h3>
                </li>
            `;
            if (player.name == name) {
                currentPlayer = player;
            }
        });
        let myDice = '';
        currentPlayer.dice.forEach(die => {
            myDice += `<li>${die}</li>`;
        });
        let item = document.createElement('article');
        item.classList.add('game');
        item.innerHTML = `
            <h2>Players</h2>
            <ul class='players'>
                ${players}
            </ul>
            <h2>Current Bet</h2>
            <p>
                ${
                    game.currentBet.dice ? `${game.currentBet.player} bet: ${game.currentBet.count}x ${game.currentBet.dice}`
                    : 'There is no current bet'
                }
                
            </p>
            <h2>My Dice</h2>
            <ul class='dice'>${myDice}</ul>
            ${
                currentPlayer.isCurrent ?
                    `
                        <h2>It is your go</h2>
                        <p>
                            Bet: <input type='number' id="betNumber" value="${game.currentBet.count ? game.currentBet.count : ''}" />
                            <select id="betDie">
                                <option value='2'>2</option>
                                <option value='3'>3</option>
                                <option value='4'>4</option>
                                <option value='5'>5</option>
                                <option value='6'>6</option>
                            </select>
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
                                        window.alert("Invalid bet")
                                    })
                                })()'
                            >Place Bet</button>
                            ${
                                game.currentBet.dice ?
                                `<button id="exact">Exact</button>`
                                : ``
                            }
                        </p>
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
                    `
                : ``
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
                        ${
                            die == result.bet.dice || die == 1 ? 
                                '<b>'
                                : ''
                        }
                            ${die}
                        ${
                            die == result.bet.dice || die == 1 ? 
                                '</b>'
                                : ''
                        }
                    </li>
                `;
            });
            players += `
                <li>
                    ${player.name}: 
                    <ul>
                        ${dice}
                    </ul>
                </li>
            `;
        });
        item.innerHTML = `
            <h2>Show the dice!</h2>
            <ul class='players'>${players}</ul>
            <p>The bet was ${result.bet.count}x ${result.bet.dice}. ${result.doubt} doubted.</p>
            <p>There were a total of ${result.total}x ${result.bet.dice} + 1.</p>
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
}