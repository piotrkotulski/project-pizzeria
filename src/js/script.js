/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const select = {
        templateOf: {
            menuProduct: '#template-menu-product',
            cartProduct: '#template-cart-product',
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
                input: 'input.amount',
                linkDecrease: 'a[href="#less"]',
                linkIncrease: 'a[href="#more"]',
            },
        },

        cart: {
            productList: '.cart__order-summary',
            toggleTrigger: '.cart__summary',
            totalNumber: `.cart__total-number`,
            totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
            subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
            deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
            form: '.cart__order',
            formSubmit: '.cart__order [type="submit"]',
            phone: '[name="phone"]',
            address: '[name="address"]',
        },
        cartProduct: {
            amountWidget: '.widget-amount',
            price: '.cart__product-price',
            edit: '[href="#edit"]',
            remove: '[href="#remove"]',
        },

    };

    const classNames = {
        menuProduct: {
            wrapperActive: 'active',
            imageVisible: 'active',
        },

        cart: {
            wrapperActive: 'active',
        },

    };

    const settings = {
        amountWidget: {
            defaultValue: 1,
            defaultMin: 1,
            defaultMax: 9,
        },
        cart: {
            defaultDeliveryFee: 20,
        },
    };

    const templates = {
        menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
        cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
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

            app.cart.add(thisProduct.prepareCartProduct());
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

    class Cart {
        constructor(element) {
            const thisCart = this;

            thisCart.products = [];

            thisCart.getElements(element);

            thisCart.initActions();

        }

        getElements(element) {
            const thisCart = this;

            thisCart.dom = {};
            thisCart.dom.wrapper = element;
            thisCart.dom.productList = element.querySelector(select.cart.productList);
            thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
            thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
            thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
            thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
            thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
        }


        initActions() {
            const thisCart = this;

            thisCart.dom.toggleTrigger.addEventListener('click', function () {
                thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive); // Toggle klasy
            });

            thisCart.dom.productList.addEventListener('updated', function () {
                thisCart.update();
            });

            thisCart.dom.productList.addEventListener('remove', function (event) {
                const cartProduct = event.detail.cartProduct;
                thisCart.remove(cartProduct);
            });
        }

        update() {
            const thisCart = this;
            const deliveryFee = settings.cart.defaultDeliveryFee;


            let totalNumber = 0;
            let subtotalPrice = 0;


            for (let cartProduct of thisCart.products) {
                totalNumber += cartProduct.amountWidget.value;
                subtotalPrice += cartProduct.priceSingle * cartProduct.amountWidget.value;
            }

            if (totalNumber === 0) {
                thisCart.totalPrice = 0;
            } else {
                thisCart.totalPrice = subtotalPrice + deliveryFee;
                console.log(thisCart.totalPrice);
            }

            thisCart.dom.totalNumber.textContent = totalNumber;
            thisCart.dom.subtotalPrice.textContent = subtotalPrice;
            thisCart.dom.deliveryFee.textContent = deliveryFee;
            //thisCart.dom.totalPrice.textContent = thisCart.totalPrice;

            for (let totalPrice of thisCart.dom.totalPrice) {
                totalPrice.textContent = thisCart.totalPrice;
            }
        }


        add(menuProduct) {
            const thisCart = this;

            const generatedHTML = templates.cartProduct(menuProduct);

            const generatedDOM = utils.createDOMFromHTML(generatedHTML);

            thisCart.dom.productList.appendChild(generatedDOM);

            const cartProductInstance = new CartProduct(menuProduct, generatedDOM);

            thisCart.products.push(cartProductInstance);
            cartProductInstance.initAmountWidget();
            thisCart.update();
        }

        remove(cartProduct) {
            const thisCart = this;
            const productIndex = thisCart.products.indexOf(cartProduct);

            if (productIndex !== -1) {
                cartProduct.dom.wrapper.remove();
                thisCart.products.splice(productIndex, 1);
                thisCart.update();
            }
        }

    }

    class CartProduct {
        constructor(menuProduct, element) {
            const thisCartProduct = this;

            thisCartProduct.id = menuProduct.id;
            thisCartProduct.name = menuProduct.name;
            thisCartProduct.priceSingle = menuProduct.priceSingle;
            thisCartProduct.params = JSON.parse(JSON.stringify(menuProduct.params));

            thisCartProduct.getElements(element);
            thisCartProduct.initAmountWidget();
            thisCartProduct.processOrder();
            thisCartProduct.initActions();
        }

        getElements(element) {
            const thisCartProduct = this;

            thisCartProduct.dom = {};
            thisCartProduct.dom.wrapper = element;
            thisCartProduct.dom.amountWidget = element.querySelector(select.cartProduct.amountWidget);
            thisCartProduct.dom.price = element.querySelector(select.cartProduct.price);
            thisCartProduct.dom.edit = element.querySelector(select.cartProduct.edit);
            thisCartProduct.dom.remove = element.querySelector(select.cartProduct.remove);
        }

        initAmountWidget() {
            const thisCartProduct = this;

            thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget);
            thisCartProduct.dom.amountWidget.addEventListener('updated', function () {
                thisCartProduct.processOrder();
            });
        }

        processOrder() {
            const thisCartProduct = this;

            thisCartProduct.amount = thisCartProduct.amountWidget.value;
            thisCartProduct.price = thisCartProduct.priceSingle * thisCartProduct.amount;

            thisCartProduct.dom.price.innerHTML = thisCartProduct.price;
        }

        remove() {
            const thisCartProduct = this;

            const event = new CustomEvent('remove', {
                bubbles: true,
                detail: {
                    cartProduct: thisCartProduct,
                },
            });

            thisCartProduct.dom.wrapper.dispatchEvent(event);
            console.log('click remove');
        }

        initActions() {
            const thisCartProduct = this;

            thisCartProduct.dom.edit.addEventListener('click', function (event) {
                event.preventDefault();
            });
            thisCartProduct.dom.remove.addEventListener('click', function (event) {
                event.preventDefault();
                thisCartProduct.remove();
            })
        }
    }

    const app = {
        initMenu: function () {
            const thisApp = this;

            for (let productData in thisApp.data.products) {
                new Product(productData, thisApp.data.products[productData]);
            }
        },

        initData: function () {
            const thisApp = this;

            thisApp.data = dataSource;
        },
        initCart: function () {
            const thisApp = this;

            const cartElem = document.querySelector(select.containerOf.cart);
            thisApp.cart = new Cart(cartElem);
        },

        init: function () {
            const thisApp = this;

            thisApp.initData();
            thisApp.initMenu();
            thisApp.initCart();
        },

    };

    app.init();
});
