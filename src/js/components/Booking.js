import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from '../components/DatePicker.js';
import HourPicker from '../components/HourPicker.js';

class Booking {
    constructor(element) {
        this.render(element);
        this.initWidgets();
    }

    render(element) {
        const generatedHTML = templates.bookingWidget();
        this.dom = {};
        this.dom.wrapper = element;
        this.dom.wrapper.innerHTML = generatedHTML;

        this.dom.peopleAmount = this.dom.wrapper.querySelector(select.booking.peopleAmount);
        this.dom.hoursAmount = this.dom.wrapper.querySelector(select.booking.hoursAmount);
        this.dom.datePicker = this.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        this.dom.hourPicker = this.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    }

    initWidgets() {
        const thisBooking = this;

        this.peopleAmountWidget = new AmountWidget(this.dom.peopleAmount);
        this.hoursAmountWidget = new AmountWidget(this.dom.hoursAmount);
        this.datePicker = new DatePicker(thisBooking.dom.datePicker);
        this.hourPicker = new HourPicker(thisBooking.dom.hourPicker);
    }
}

export default Booking;

