const app = {
    initMenu: function () {
        const thisApp = this;

        for (let productData in thisApp.data.products) {
            new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        }
    },

    initData: function () {
        const thisApp = this;
        thisApp.data = {};
        const url = settings.db.url + '/' + settings.db.products;

        fetch(url)
            .then(function (rawResponse) {
                return rawResponse.json();
            })
            .then(function (parsedResponse) {
                thisApp.data.products = parsedResponse;
                thisApp.initMenu();
            })
            .catch(function (error) {
                console.error('Error:', error);
            });
    },
    initCart: function () {
        const thisApp = this;

        const cartElem = document.querySelector(select.containerOf.cart);
        thisApp.cart = new Cart(cartElem);
    },

    init: function () {
        const thisApp = this;

        thisApp.initData();
        thisApp.initCart();
    },

};

app.init();
