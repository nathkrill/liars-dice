class DiceElement extends HTMLElement {
    static get observedAttributes() { return ['value']; }
    constructor() {
        super();

        this.attachShadow({mode: 'open'});

        this.value = parseInt(this.getAttribute('value'));

        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('dice');

        const style = document.createElement('style');

        style.textContent = `
            .dice {
                display: inline-grid;
                font-size: var(--dice-font-size, 1em);
                border-width: var(--dice-border-width, 1px);
                border-color: var(--dice-border-color, black);
                border-style: var(--dice-border-style, solid);
                border-radius: var(--dice-border-radius, 4px);
                padding: 0.5em;
                line-height: 1;
                width: var(--dice-counter-count-size, 1.5em);
                height: var(--dice-counter-count-size, 1.5em);
                color: inherit;
                position:relative;
                background-color: var(--dice-background-color, white);
            }

            .dice[data-count='1'] {
                grid-template-columns: 1fr;
                grid-template-rows: 1fr;
            }

            .dice[data-count='2'] {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
            }

            .dice[data-count='3'] {
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr 1fr;
            }

            .dice[data-count='4'] {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr;
            }

            .dice[data-count='5'] {
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr 1fr;
            }

            .dice[data-count='6'] {
                grid-template-columns: 1fr 1fr;
                grid-template-rows: 1fr 1fr 1fr;
            }

            dot {
                width: 0.4em;
                height:auto;
                aspect-ratio: 1/1;
                border-radius: 50%;
                background-color: var(--dice-counter-color, black);
                place-self: center;
                position:relative;
            }

            dot[data-position='1-1'],dot[data-position='1-2'],dot[data-position='1-3'],dot[data-position='1-4'],dot[data-position='1-5'],dot[data-position='1-6'] {
                grid-column: 1;
                grid-row: 1;
            }
            dot[data-position='2-2'],dot[data-position='2-3'] {
                grid-column: 2;
                grid-row: 2;
            }
            dot[data-position='2-4'],dot[data-position='2-6'] {
                grid-column: 2;
                grid-row: 1;
            }
            dot[data-position='2-5'] {
                grid-column: 3;
                grid-row: 1;
            }
            dot[data-position='3-3'] {
                grid-column: 3;
                grid-row: 3
            }
            dot[data-position='3-4'], dot[data-position='3-6'] {
                grid-column: 1;
                grid-row: 2;
            }
            dot[data-position='3-5'] {
                grid-column: 2;
                grid-row: 2;
            }
            dot[data-position='4-5'] {
                grid-column: 1;
                grid-row: 3;
            }
            dot[data-position='5-5'] {
                grid-column: 3;
                grid-row: 3;
            }
            dot[data-position='5-6'] {
                grid-column: 1;
                grid-row: 3;
            }
        `;

        this.updateDOM();
        
        this.shadowRoot.append(style,this.wrapper);
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'value') {
            this.value = parseInt(newValue);
        }
        this.updateDOM();
    }

    updateDOM () {
        let dots = '';
        for (let index = 0; index < this.value; index++) {
            dots += `<dot data-position='${index + 1}-${this.value}'></dot>`;
        }
        this.wrapper.dataset.count = this.value;
        this.wrapper.innerHTML = dots;
    }
}

if (customElements) {
    customElements.define('dice-el', DiceElement);
}