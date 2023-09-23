import {settings, select} from '../settings.js';

class AmountWidget {
    constructor(element) {
        const thisWidget = this;
        thisWidget.getElements(element);
        thisWidget.initActions();
        thisWidget.setValue(thisWidget.input.value || settings.amountWidget.defaultValue);
    }

    getElements(element) {
        const thisWidget = this;

        thisWidget.element = element;
        thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
        thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
        thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value) {
        const thisWidget = this;

        const newValue = parseInt(value);
        const minValue = settings.amountWidget.defaultMin;
        const maxValue = settings.amountWidget.defaultMax;

        if (!isNaN(newValue) && newValue >= minValue && newValue <= maxValue && thisWidget.value !== newValue) {

            thisWidget.value = newValue;
        }

        thisWidget.input.value = thisWidget.value;
        this.announce();
    }

    initActions() {
        const thisWidget = this;

        thisWidget.input.addEventListener('change', event => {
            event.preventDefault();
            this.setValue(thisWidget.input.value);
        });

        thisWidget.linkDecrease.addEventListener('click', event => {
            event.preventDefault();
            this.setValue(thisWidget.value - 1);
        });

        thisWidget.linkIncrease.addEventListener('click', event => {
            event.preventDefault();
            this.setValue(thisWidget.value + 1);

        });
    }

    announce() {
        const thisWidget = this;

        const event = new CustomEvent('updated', {
            bubbles: true
        });

        thisWidget.element.dispatchEvent(event);
    }
}

export default AmountWidget;