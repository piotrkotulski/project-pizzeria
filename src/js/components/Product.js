import {select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
    constructor(id, data) {
        const thisProduct = this;

        thisProduct.id = id;
        thisProduct.data = data;

        thisProduct.renderInMenu();
        thisProduct.getElements();
        thisProduct.initAccordion();
        thisProduct.initOrderForm();
        thisProduct.initAmountWidget();
        thisProduct.processOrder();
    }

    renderInMenu() {
        const thisProduct = this;
        const generatedHTML = templates.menuProduct(thisProduct.data);

        thisProduct.element = utils.createDOMFromHTML(generatedHTML);

        const menuContainer = document.querySelector(select.containerOf.menu);

        menuContainer.appendChild(thisProduct.element);
    }

    getElements() {
        const thisProduct = this;

        thisProduct.accordionTrigger = thisProduct.element.querySelector(
            select.menuProduct.clickable);
        thisProduct.form = thisProduct.element.querySelector(
            select.menuProduct.form);
        thisProduct.formInputs = thisProduct.form.querySelectorAll(
            select.all.formInputs);
        thisProduct.cartButton = thisProduct.element.querySelector(
            select.menuProduct.cartButton);
        thisProduct.priceElem = thisProduct.element.querySelector(
            select.menuProduct.priceElem);
        thisProduct.imageWrapper = thisProduct.element.querySelector(
            select.menuProduct.imageWrapper);
        thisProduct.amountWidgetElem = thisProduct.element.querySelector(
            select.menuProduct.amountWidget);
    }

    initAmountWidget() {
        const thisProduct = this;

        thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
        thisProduct.amountWidgetElem.addEventListener('updated', function () {
            thisProduct.processOrder();
        });
    }

    initAccordion() {
        const thisProduct = this;

        //const clickableTrigger = thisProduct.element.querySelector('.product__name');

        thisProduct.accordionTrigger.addEventListener('click', function (event) {
            event.preventDefault();

            const activeProduct =
                thisProduct.element.parentElement.querySelector('.product.active');

            if (activeProduct && activeProduct !== thisProduct.element) {
                activeProduct.classList.remove('active');
            }

            thisProduct.element.classList.toggle('active');
        });
    }

    initOrderForm() {
        const thisProduct = this;

        thisProduct.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisProduct.processOrder();
        });

        for (let input of thisProduct.formInputs) {
            input.addEventListener('change', function () {
                thisProduct.processOrder();
            });
        }

        thisProduct.cartButton.addEventListener('click', function (event) {
            event.preventDefault();
            thisProduct.processOrder();
            thisProduct.addToCart();
        });
    }

    processOrder() {
        const thisProduct = this;
        const formData = utils.serializeFormToObject(thisProduct.form);
        let price = thisProduct.data.price;

        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];

            for (let optionId in param.options) {
                if (param.options.hasOwnProperty(optionId)) {
                    const option = param.options[optionId];
                    const optionImage = thisProduct.imageWrapper.querySelector(
                        `.${paramId}-${optionId}`);
                    const optionSelected =
                        formData[paramId] && formData[paramId].includes(optionId);

                    if (optionImage) {
                        if (optionSelected) {
                            optionImage.classList.add(classNames.menuProduct.imageVisible);
                        } else {
                            optionImage.classList.remove(
                                classNames.menuProduct.imageVisible);
                        }
                    }

                    if (optionSelected) {
                        if (!option.default) {
                            price += option.price;
                        }
                    } else {
                        if (option.default) {
                            price -= option.price;
                        }
                    }
                }
            }
        }
        thisProduct.priceSingle = price;
        price *= thisProduct.amountWidget.value;
        thisProduct.priceElem.innerHTML = price;
    }

    addToCart() {
        const thisProduct = this;

        // app.cart.add(thisProduct.prepareCartProduct());
        const event = new CustomEvent('add-to-cart', {
            bubbles: true,
            detail: {
                product: thisProduct.prepareCartProduct(),
            },
        });
        thisProduct.element.dispatchEvent(event);
    }

    prepareCartProduct() {
        const thisProduct = this;
        const params = thisProduct.prepareCartProductParams();

        const productSummary = {
            id: thisProduct.id,
            name: thisProduct.data.name,
            amount: thisProduct.amountWidget.value,
            priceSingle: thisProduct.priceSingle,
            price: thisProduct.priceSingle * thisProduct.amountWidget.value,
            params: params
        };

        return productSummary;
    }

    prepareCartProductParams() {
        const thisProduct = this;

        const formData = utils.serializeFormToObject(thisProduct.form);
        const params = {};

        for (let paramId in thisProduct.data.params) {
            const param = thisProduct.data.params[paramId];

            params[paramId] = {
                label: param.label,
                options: {}
            };

            for (let optionId in param.options) {
                const option = param.options[optionId];
                const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

                if (optionSelected) {
                    params[paramId].options[optionId] = option.label;
                }
            }
        }

        return params;
    }
}

export default Product;