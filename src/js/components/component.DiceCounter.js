class DiceCounter extends HTMLElement {
    constructor() {
        super();

        this.allowones = this.hasAttribute('allowones') ? true : false;
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
        this.wrapper.classList.add('wrapper');

        this.incrementButton = document.createElement('button');
        this.incrementButton.innerHTML = '+';

        this.decrementButton = document.createElement('button');
        this.decrementButton.innerHTML = '-';

        this.counter = document.createElement('dice-el');
        this.counter.setAttribute('value', this.value);

        this.incrementButton.addEventListener('click', this.increment.bind(this), false);
        this.decrementButton.addEventListener('click', this.decrement.bind(this), false);

        this.wrapper.append(this.decrementButton,this.counter,this.incrementButton);

        this.updateDOM();

        const style = document.createElement('style');
        style.textContent = `

            div.wrapper {
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

            dice-el {
                margin: 0 var(--dice-counter-spacing, 0.2em);
            }
        `;

        this.shadowRoot.append(style,this.wrapper);

    }

    updateDOM() {
        this.counter.setAttribute('value',this.value);
        if (this.value == 6) {
            this.incrementButton.disabled = true;
        } else {
            this.incrementButton.disabled = false;
        }
        if (this.allowones && this.value == 1) {
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
        if (this.allowones && this.value == 1) {
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