class Counter extends HTMLElement {
    static get observedAttributes() { return ['value']; }
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        this.value = 0;
        let valueAttribute = this.getAttribute('value');
        if (valueAttribute) {
            this.value = parseInt(valueAttribute);
        }
        this.disabled = this.hasAttribute('disabled') ? true : false;
        this.max = this.hasAttribute('max') ? parseInt(this.getAttribute('max')) : false;
        this.min = this.hasAttribute('min') ? parseInt(this.getAttribute('min')) : false;

        this.wrapper = document.createElement('div');

        this.incrementButton = document.createElement('button');
        this.incrementButton.innerHTML = '+';

        this.decrementButton = document.createElement('button');
        this.decrementButton.innerHTML = '-';

        this.counter = document.createElement('span');

        this.incrementButton.addEventListener('click', this.increment.bind(this), false);
        this.decrementButton.addEventListener('click', this.decrement.bind(this), false);

        if (!this.disabled) {
            this.wrapper.append(this.decrementButton,this.counter,this.incrementButton);
        } else {
            this.wrapper.append(this.counter);
        }

        this.updateDOM();

        const style = document.createElement('style');
        style.textContent = `
            div {
                display: inline-flex;
                flex-flow: row nowrap;
                justify-content: center;
                align-items:center;
            }

            span {
                display: block;
                margin: 0 var(--counter-spacing, 0.5em);
            }

            button {
                -webkit-appearance: none;
                background-color: var(--counter-button-background-color, transparent);
                color: var(--counter-button-color, inherit);
                display: flex;
                justify-content: center;
                align-items:center;
                line-height: 1;
                border-radius: var(--counter-border-radius,50%);
                border-color: var(--counter-border-color, black);
                border-width: var(--counter-border-width, 1px);
                border-style: var(--counter-border-style, solid);
                width: var(--dice-counter-button-size, 1.5em);
                height: var(--dice-counter-button-size, 1.5em);
                padding: 0;
                cursor: pointer;
            }

            button:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }
        `;

        this.shadowRoot.append(style,this.wrapper);
    }

    updateDOM() {
        this.counter.innerHTML = this.value;
        if (this.max !== false && this.value == this.max) {
            this.incrementButton.disabled = true;
        } else {
            this.incrementButton.disabled = false;
        }
        if (this.min !== false && this.value == this.min) {
            this.decrementButton.disabled = true;
        } else {
            this.decrementButton.disabled = false;
        }
    }

    increment() {
        if (this.disabled) {
            return;
        }
        if (this.max && this.value == this.max) {
            return;
        }
        this.value++;
        this.updateDOM();
    }

    decrement() {
        if (this.disabled) {
            return;
        }
        if (this.min && this.value == this.min) {
            return;
        }
        this.value--;
        this.updateDOM();
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'value') {
            this.value = parseInt(newValue);
        }
        this.updateDOM();
    }
}

if (customElements) {
    customElements.define('counter-el', Counter);
}