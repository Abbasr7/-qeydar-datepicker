import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, ElementRef, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { CalendarType, DatepickerMode } from 'projects/qeydar-datepicker/src/date-picker.component';
import { TimeValueType } from 'projects/qeydar-datepicker/src/public-api';
import { RangeInputLabels } from 'qeydar-datepicker';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        width: '250px',
        opacity: 1,
      })),
      state('out', style({
        width: '0',
        display:'none'
      })),
      transition('in => out', [
        animate('300ms ease-in-out')
      ]),
      transition('out => in', [
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})
export class AppComponent implements OnInit{
  isSidebarOpen = true;
  showPart = 'datepicker';

  // models
  selectedDate: any = '1403/02/11';
  selectedTime: any = '17:17';
  
  // setting
  rtl: boolean = true;
  calendarType: CalendarType = 'jalali';
  mode: DatepickerMode = 'day';
  isRange: boolean = false;
  format: string = 'yyyy/MM/dd';
  footerDescription: string = '';
  inputLabel: string = '';
  rangeInputLabel: RangeInputLabels = {start: '', end: ''};
  disabled: boolean = false;
  showSidebar: boolean = false;
  emitInDateFormat: boolean = false;
  showToday: boolean = false;
  isInline: boolean = false;
  maxDate: Date | string;
  minDate: Date | string;
  showIcon: boolean = true;
  timeValueType: TimeValueType = 'string';
  timeFormat: '12' | '24' = '24';
  timeDisplayFormat: string = 'HH:mm';
  maxTime: string;
  minTime: string;
  
  // examples
  demoCode: string;

  form = new FormGroup({
    time: new FormControl('17:17'),
    date: new FormControl('2024-09-29T00:00:00')
  });

  ngOnInit(): void {}

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleCode(elm: HTMLDivElement) {
    let display = elm.style.display;
    if (display != 'block') {
      elm.style.display = 'block';
      this.updateCode();
    } else {
      elm.style.display = 'none';
    }  
  }

  onChangeCalendarType(event: Event) {
    this.calendarType = (<HTMLSelectElement>event.target).value as CalendarType;
    this.updateCode();
  }

  onChangeMode(event: Event) {
    this.mode = (<HTMLSelectElement>event.target).value as DatepickerMode;
    this.updateCode();
  }

  updateCode() {
    if (this.showPart == 'datepicker')
      this.updateDateCode();
    else
      this.updateTimeCode();
  }

  updateDateCode() {
    let settings = `rtl: boolean = ${this.rtl};
        calendarType: CalendarType = ${this.calendarType};
        mode: DatepickerMode = ${this.mode};
        isRange: boolean = ${this.isRange};
        format: string = ${this.format};
        footerDescription: string = ${this.footerDescription};
        inputLabel: string = ${this.inputLabel};
        rangeInputLabel: RangeInputLabels = ${this.rangeInputLabel};
        disabled: boolean = ${this.disabled};
        showSidebar: boolean = ${this.showSidebar};
        emitInDateFormat: boolean = ${this.emitInDateFormat};
        showToday: boolean = ${this.showToday};
        isInline: boolean = ${this.isInline};
        minDate: Date | string = ${this.minDate};
        maxDate: Date | string = ${this.maxDate};
    `;

    this.demoCode = `
      @Component({
        selector: 'app-root',
        template: '
          <qeydar-date-picker
            [rtl]="rtl"
            [calendarType]="calendarType"
            [format]="format"
            [footerDescription]="footerDescription"
            [inputLabel]="inputLabel"
            [rangeInputLabels]="rangeInputLabel"
            [showSidebar]="showSidebar"
            [disabled]="disabled"
            [emitInDateFormat]="emitInDateFormat"
            [isRange]="isRange"
            [showToday]="showToday"
            [maxDate]="maxDate"
            [minDate]="minDate"
            [mode]="mode"
            [(ngModel)]="selectedDate"
            (ngModelChange)="onChangeDate($event)"
          ></qeydar-date-picker>
          <code>Result:  {{ selectedDate | json }}</code>
        ',
        styleUrls: ['./app.component.scss'],
      })
      export class AppComponent{

        // Can accept both Date object and string
        selectedDate: Date | string = 1403/02/11;

        // setting
        ${settings}
        onChangeDate(event:Date | string) {
          console.log('event:',event);
        }
      }
    `;
  }

  updateTimeCode() {
    let settings = `rtl: boolean = ${this.rtl};
        showIcon: boolean = ${this.showIcon};
        timeValueType: TimeValueType = ${this.timeValueType};
        timeFormat: '12' | '24' = ${this.timeFormat};
        timeDisplayFormat: string = ${this.timeDisplayFormat};
        maxTime: string = ${this.maxTime};
        minTime: string = ${this.minTime};
    `;

    this.demoCode = `
      @Component({
        selector: 'app-root',
        template: '
          <qeydar-time-picker
            [rtl]="rtl"
            [showIcon]="showIcon"
            [timeFormat]="timeFormat"
            [displayFormat]="timeDisplayFormat"
            [valueType]="timeValueType"
            [minTime]="minTime"
            [maxTime]="maxTime"
            [(ngModel)]="selectedTime"
            (ngModelChange)="onChange($event)"
          ></qeydar-time-picker>
          <code>Result:  {{ selectedTime | json }}</code>
        ',
        styleUrls: ['./app.component.scss'],
      })
      export class AppComponent{

        // Can accept both Date object and string
        selectedTime: Date | string = '17:17';

        // setting
        ${settings}
        onChangeDate(event:Date | string) {
          console.log('event:',event);
        }
      }
    `;
  }

  onChange(event:any) {
    console.log('event:',event);
  }
}
