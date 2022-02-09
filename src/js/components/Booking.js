import {classNames, select, settings, templates} from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import {utils} from '../utils.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = [];
    

    thisBooking.render(element);
    thisBooking.initWidgets();  
    thisBooking.getData();
  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],

      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],

      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    const urls = {
      booking:       settings.db.url + '/' + settings.db.bookings
                                     + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events 
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events + 
                                       '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePickerWidget.minDate;
    const maxDate = thisBooking.datePickerWidget.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;
      
    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);
      
    for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }
  
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePickerWidget.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables){
      let tableID = table.getAttribute(settings.booking.tableIdAttribute);
      
      if(!isNaN(tableID)){
        tableID = parseInt(tableID);  
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableID)
      ){
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  initTables(event){
    const thisBooking = this;
    const clickedElement = event.target;

    const clickedTable = clickedElement.classList.contains(classNames.booking.table);
    const clickedTableBooked = clickedElement.classList.contains(classNames.booking.tableBooked);
    const idTable = clickedElement.getAttribute(settings.booking.tableIdAttribute);

    //console.log('idTable', idTable);
   
    //console.log('clickedTable', clickedTable);

    if(clickedTable){
      if(!clickedTableBooked){ 

        for (let table of thisBooking.dom.tables){
          table.classList.remove(classNames.booking.tableSelected);
          
          thisBooking.selectedTable = []; 
        }
        clickedElement.classList.add(classNames.booking.tableSelected);
        thisBooking.selectedTable.push(idTable);
        //console.log('thisBooking.selectedTable', thisBooking.selectedTable);
      } else {
        alert('Ten stolik jest już zarezerwowany, wybierz inny.');
        //console.log('stolik zarezerwowany'); 
      } 
    } 
  }
  
  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = element;
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.containerOf.tables);
    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.form);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    

    thisBooking.dom.peopleAmount.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function(event){
      event.preventDefault();
    });  

    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.datePicker.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function(event){
      event.preventDefault();
    });

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
    });

    thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
      thisBooking.initTables(event);
    });

    thisBooking.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisBooking.sendBooking();
      console.log('kliknąłem submit');
    });
  }

  sendBooking(){
    const thisBooking = this;
    const url = settings.db.url + '/' + settings.db.bookings;
    
    
    const payload = {
        
      date: thisBooking.datePickerWidget.value,
      hour: thisBooking.hourPickerWidget.value,
      table: (!(thisBooking.selectedTable == 0) ? parseInt(thisBooking.selectedTable[0], 10) : null),
      duration: thisBooking.hoursAmountWidget.value,
      ppl: thisBooking.peopleAmountWidget.value,
      starters: [],
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.address.value,
    };
    for (let starter of thisBooking.dom.starters){
      if(starter.checked){
        payload.starters.push(starter.value);
      }
    }
      
    console.log('payload', payload);

    thisBooking.makeBooked(payload.date, payload.hour,payload.duration,payload.table);
   
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
export default Booking;