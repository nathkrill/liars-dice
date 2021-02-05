class DiceCounter extends HTMLElement {
    constructor() {
        super();

        this.allowOnes = this.hasAttribute('allowOnes') ? true : false;
        let valueAttribute = this.getAttribute('value');
        if (valueAttribute != 0 && valueAttribute != null) {
            if (this.allowOnes && valueAttribute == 1) {
                this.value = valueAttribute;
            } else if (valueAttribute != 1) {
                this.value = valueAttribute;
            } else {
                this.value = 2;
            }
        } else {
            this.value = 2;
        }

        this.attachShadow({mode: 'open'});

        this.wrapper = document.createElement('div');

        this.incrementButton = document.createElement('button');
        this.incrementButton.innerHTML = '+';

        this.decrementButton = document.createElement('button');
        this.decrementButton.innerHTML = '-';

        this.counter = document.createElement('span');

        this.incrementButton.addEventListener('click', this.increment.bind(this), false);
        this.decrementButton.addEventListener('click', this.decrement.bind(this), false);

        this.wrapper.append(this.decrementButton,this.counter,this.incrementButton);

        this.updateDOM();

        const style = document.createElement('style');
        style.textContent = `

            div {
                display: inline-flex;
                flex-flow: row nowrap;
                justify-content: center;
                align-items: center;
                width: min-content;
                margin: inherit;
            }

            button {
                -webkit-appearance: none;
                border-radius: 50%;
                border-width: var(--dice-counter-border-width, 1px);
                background-color: var(--dice-counter-background-color, transparent);
                color: var(--dice-counter-color, black);
                border-color: var(--dice-counter-border-color, black);
                width: var(--dice-counter-button-size, 1.5em);
                height: var(--dice-counter-button-size, 1.5em);
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 0;
                cursor: pointer;
            }

            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            span {
                display: flex;
                justify-content: center;
                align-items: center;
                font-size: var(--dice-counter-count-size, 1em);
                border-width: var(--dice-counter-border-width, 1px);
                border-color: var(--dice-counter-border-color, black);
                border-style: var(--dice-counter-border-style, solid);
                border-radius: var(--dice-counter-count-border-radius, 4px);
                margin: 0 var(--dice-counter-spacing, 0.2em);
                padding: 0.5em;
                line-height: 1;
                width: var(--dice-counter-count-size, 1.5em);
                height: var(--dice-counter-count-size, 1.5em);
            }
        
        `;

        this.shadowRoot.append(style,this.wrapper);

    }

    updateDOM() {
        this.counter.innerHTML = this.value;
        if (this.value == 6) {
            this.incrementButton.disabled = true;
        } else {
            this.incrementButton.disabled = false;
        }
        if (this.allowOnes && this.value == 1) {
            this.decrementButton.disabled = true;
        } else if (this.value == 2) {
            this.decrementButton.disabled = true;
        } else {
            this.decrementButton.disabled = false;
        }
    }

    increment() {
        if (this.value == 6) {
            return;
        }
        this.value++;
        this.updateDOM();
    }

    decrement() {
        if (this.allowOnes && this.value == 1) {
            return;
        } else if (this.value == 2) {
            return;
        }
        this.value--;
        this.updateDOM();
    }
}

if (customElements) {
    customElements.define('dice-counter', DiceCounter);
}