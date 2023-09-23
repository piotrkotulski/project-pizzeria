import {select, classNames, settings, templates} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

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
        thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
        thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
        thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
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

        thisCart.dom.form.addEventListener('submit', function (event) {
            event.preventDefault();
            thisCart.sendOrder();
        });
    }

    update() {
        const thisCart = this;
        thisCart.deliveryFee = settings.cart.defaultDeliveryFee;


        thisCart.totalNumber = 0;
        thisCart.subtotalPrice = 0;


        for (let cartProduct of thisCart.products) {
            thisCart.totalNumber += cartProduct.amountWidget.value;
            thisCart.subtotalPrice += cartProduct.priceSingle * cartProduct.amountWidget.value;
        }

        if (thisCart.totalNumber === 0) {
            thisCart.totalPrice = 0;
            thisCart.deliveryFee = 0;
        } else {
            thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
            console.log(thisCart.totalPrice);
        }

        thisCart.dom.totalNumber.textContent = thisCart.totalNumber;
        thisCart.dom.subtotalPrice.textContent = thisCart.subtotalPrice;
        thisCart.dom.deliveryFee.textContent = thisCart.deliveryFee;

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

    sendOrder() {
        const thisCart = this;

        const url = settings.db.url + '/' + settings.db.orders;

        const payload = {
            address: thisCart.dom.address.value,
            phone: thisCart.dom.phone.value,
            totalPrice: thisCart.totalPrice,
            subtotalPrice: thisCart.subtotalPrice,
            totalNumber: thisCart.totalNumber,
            deliveryFee: thisCart.deliveryFee,
            products: [],
        };

        const products = thisCart.products.map(cartProduct => cartProduct.getData());

        payload.products = products;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options)
            .then(function (rawResponse) {
                return rawResponse.json();
            })
            .then(function (parsedResponse) {
                console.log('Order sent:', parsedResponse);
                window.alert('Twoje zamówienie zostało wysłane do realizacji.');
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    }
}

export default Cart;