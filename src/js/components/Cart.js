import {settings, select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart {
  constructor(element){
    const thisCart = this;
      
    thisCart.products = [];

    thisCart.getElements(element);

    thisCart.initActions();
  }

  getElements(element){
    const thisCart = this;
      
    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);

    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);

    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);

    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);

    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);

    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
      
  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
        
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });
  }

  add(menuProduct){
      
    const thisCart = this;
      
    /* generate HTML based on template */

    const generatedHTML = templates.cartProduct(menuProduct);
      
    /* generated DOM */

    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      
    /* add product to Cart */
      
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    thisCart.update();
  }

  update(){
    const thisCart = this;

    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (thisCart.product of thisCart.products) {
        
      thisCart.totalNumber = thisCart.totalNumber + thisCart.product.amount;
      thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;

      thisCart.subtotalPrice = thisCart.subtotalPrice + thisCart.product.price;
    }

    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;

    if (thisCart.totalNumber == 0){
      thisCart.totalPrice = 0;
    } else {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    }
     
    for (let totalPriceSum of thisCart.dom.totalPrice){
      totalPriceSum.innerHTML = thisCart.totalPrice;
    }
      
    thisCart.dom.deliveryFee.innerHTML = thisCart.deliveryFee;
  }

  remove(cartProduct){
    const thisCart = this;

    const indexOfRemoveProduct = thisCart.products.indexOf(cartProduct);

    thisCart.products.splice(indexOfRemoveProduct, 1);

    cartProduct.dom.wrapper.remove();

    thisCart.update();
  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    const payload = {
        
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: []
    };
      
    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
      
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': ' application/json',
      },
      body: JSON.stringify(payload)
    };
    fetch(url, options);
  }
}

export default Cart;