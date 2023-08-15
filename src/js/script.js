/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
    ('use strict');

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
        },
        containerOf: {
            menu: '#product-list',
            cart: '#cart',
        },
        all: {
            menuProducts: '#product-list > .product',
            menuProductsActive: '#product-list > .product.active',
            formInputs: 'input, select',
        },
        menuProduct: {
            clickable: '.product__header',
            form: '.product__order',
            priceElem: '.product__total-price .price',
            imageWrapper: '.product__images',
            amountWidget: '.widget-amount',
            cartButton: '[href="#add-to-cart"]',
        },
        widgets: {
            amount: {
                input: 'input[name="amount"]',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },
    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },
    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 0,
            defaultMax: 10,
        },
    };

    const templates = {
        menuProduct: Handlebars.compile(
            document.querySelector(select.templateOf.menuProduct).innerHTML),
    };

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
            console.log('new Product:', thisProduct);
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
            });
        }

        processOrder() {
            const thisProduct = this;
            const formData = utils.serializeFormToObject(thisProduct.form);
            console.log('formData', formData);

            let price = thisProduct.data.price;

            for (let paramId in thisProduct.data.params) {
                const param = thisProduct.data.params[paramId];
                console.log(paramId, param);

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
            price *= thisProduct.amountWidget.value;
            thisProduct.priceElem.innerHTML = price;
        }
    }

    class AmountWidget {
        constructor(element) {
            const thisWidget = this;
            thisWidget.getElements(element);
            thisWidget.setValue(settings.amountWidget.defaultValue);
            thisWidget.initActions();


            console.log('Amount widget:', thisWidget);
            console.log('constructor agumenys', element);
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
                thisWidget.input.value = thisWidget.value;
                this.announce();

            }
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

            const event = new Event('updated');
            thisWidget.element.dispatchEvent(event);
        }
    }

    const app = {
        initMenu: function () {
            const thisApp = this;

            console.log('thisApp.data:', thisApp.data);

            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }
        },

        initData: function () {
            const thisApp = this;

            thisApp.data = dataSource;
        },

        init: function () {
            const thisApp = this;
            console.log('*** App starting ***');
            console.log('thisApp:', thisApp);
            console.log('classNames:', classNames);
            console.log('settings:', settings);
            console.log('templates:', templates);

            thisApp.initData();
            thisApp.initMenu();
        },
    };

    app.init();
}
