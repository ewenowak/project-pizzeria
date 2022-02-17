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