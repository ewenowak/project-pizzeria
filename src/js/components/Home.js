import {templates, select, classNames} from '../settings.js';


class Home{
  constructor(element){
    const thisHome = this;
    
    thisHome.render(element);
    thisHome.initLinks();
    thisHome.initWidget();
  }

  render(element){
    const thisHome = this;

    const generatedHTML = templates.home();

    thisHome.dom = {};

    thisHome.dom.wrapper = element;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector(select.home.carousel);
    /*thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address); */
  }

  activatePage(pageId){
    const thisHome = this;

    thisHome.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.navLinks = document.querySelectorAll(select.nav.links);

    /* add class active to matching page, remove from non-matching */
    
    for (let page of thisHome.pages){
      page.classList.toggle(classNames.pages.active, page.id == pageId);
    }

    /* add class active to matching page, remove from non-matching */
    for (let link of thisHome.navLinks){
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') == '#' + pageId
      );
    }
  }

  initLinks(){
    const thisHome = this;

    thisHome.links = document.querySelectorAll('.link');

    for(let link of thisHome.links){

      /* I WANNA TALK ABOUT THIS PART DURING OUR MEETING 
      link.addEventListener('mouseenter', function(event){
        event.preventDefault();
        link.classList.toggle(classNames.home.active);
      });*/
      link.addEventListener('click', function(event){
        event.preventDefault();
        const clickedElement = this;
        const id = clickedElement.getAttribute('href').replace('#', '');

        thisHome.activatePage(id);
      });
    }
  }

  initWidget(){
    const thisHome = this;
    // eslint-disable-next-line no-undef
    thisHome.flickity = new Flickity(thisHome.dom.carousel, {
      cellAlign: 'left',
      contain: true,
      prevNextButtons: false,
      wrapAround: true,
      autoPlay: 3000,

    });

  }

 

}
export default Home;