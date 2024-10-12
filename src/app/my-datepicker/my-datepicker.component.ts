import { Component, ElementRef, HostListener, forwardRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { slideMotion } from './animation/slide';
import { DateAdapter, JalaliDateAdapter, GregorianDateAdapter } from './date-adapter';
import { CustomLabels, lang_En, lang_Fa, Lang_Locale } from './date-picker-popup/models';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';

@Component({
  selector: 'qeydar-date-picker',
  template: `
    <div class="date-picker-wrapper" [formGroup]="form">
      <ng-container *ngIf="mode !== 'range'; else rangeMode">
        <input
          type="text"
          formControlName="dateInput"
          [qeydar-dateMask]="format"
          (focus)="toggleDatePicker(null,$event)"
          (blur)="onInputBlur(null,$event)"
          (keypress)="onInputKeypress($event)"
          [class.focus]="isOpen"
          [placeholder]="getPlaceholder()"
        >
      </ng-container>
      <ng-template #rangeMode>
        <div class="range-input-container">
          <input
            type="text"
            formControlName="startDateInput"
            [qeydar-dateMask]="format"
            (focus)="toggleDatePicker('start',$event)"
            (blur)="onInputBlur('start',$event)"
            [class.focus]="isOpen && activeInput === 'start'"
            [placeholder]="getPlaceholder('start')"
          >
          <span class="range-separator">→</span>
          <input
            type="text"
            formControlName="endDateInput"
            [qeydar-dateMask]="format"
            (focus)="toggleDatePicker('end',$event)"
            (blur)="onInputBlur('end',$event)"
            [class.focus]="isOpen && activeInput === 'end'"
            [placeholder]="getPlaceholder('end')"
            (keypress)="onInputKeypress($event)"
          >
          <button class="calendar-button" (click)="toggleDatePicker(null, $event)" tabindex="-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" fill="#999">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C6 1.44772 6.44772 1 7 1C7.55228 1 8 1.44772 8 2V3H16V2C16 1.44772 16.4477 1 17 1C17.5523 1 18 1.44772 18 2V3H19C20.6569 3 22 4.34315 22 6V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V6C2 4.34315 3.34315 3 5 3H6V2ZM16 5V6C16 6.55228 16.4477 7 17 7C17.5523 7 18 6.55228 18 6V5H19C19.5523 5 20 5.44772 20 6V9H4V6C4 5.44772 4.44772 5 5 5H6V6C6 6.55228 6.44772 7 7 7C7.55228 7 8 6.55228 8 6V5H16ZM4 11V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V11H4Z" fill="#999"/>
            </svg>
          </button>
        </div>
      </ng-template>
      <app-date-picker-popup
        *ngIf="isOpen"
        [rtl]="rtl"
        [@slideMotion]="'enter'"
        [selectedDate]="selectedDate"
        [selectedStartDate]="selectedStartDate"
        [selectedEndDate]="selectedEndDate"
        [mode]="mode"
        [customLabels]="customLabels"
        [calendarType]="calendarType"
        [minDate]="minDate"
        [maxDate]="maxDate"
        (dateSelected)="onDateSelected($event)"
        (dateRangeSelected)="onDateRangeSelected($event)"
        (closePicker)="isOpen = false"
      ></app-date-picker-popup>
    </div>
  `,
  styles: [`
    :host.qeydar-datepicker ::ng-deep {
      display: block;
      max-width: fit-content;
    }
    .date-picker-wrapper {
      position: relative;
      max-width: fit-content;
    }
    input {
      font-family: 'vazirmatn';
      width: 100%;
      max-width: 300px;
      padding: 6px 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      transition: all 0.3s;
    }
    input:hover {
      border-color: #40a9ff;
    }
    input.focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24,144,255,0.2);
      outline: none;
    }
    .range-input-container {
      display: flex;
      align-items: center;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
    }
    .range-input-container input {
      border: none;
      flex: 1;
      width: 50%;
      padding: 6px 10px;
      border-radius: 0;
    }
    .range-input-container input.focus {
      border-bottom: 1px solid;
      border-color: #40a9ff;
      box-shadow: none !important;
    }
    .range-separator {
      padding: 0 8px;
      color: #999;
    }
    .calendar-button {
      background: none;
      border: none;
      padding: 6px;
      cursor: pointer;
      font-size: 16px;
    }
    // rtl
    :dir(rtl) .range-separator{
      rotate: 180deg;
    }
  `],
  host: {
    "[class.qeydar-datepicker]": "true"
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  animations: [slideMotion]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnChanges {
  @Input() rtl = false;
  @Input() mode: 'day' | 'month' | 'year' | 'range' = 'day';
  @Input() format = 'yyyy/MM/dd';
  @Input() customLabels: Array<CustomLabels> = [];
  @Input() calendarType: 'jalali' | 'georgian' = 'georgian';
  @Input() minDate: Date | null = null;
  @Input() maxDate: Date | null = null;
  @Input() lang: Lang_Locale = this.calendarType == 'jalali'? new lang_Fa(): new lang_En();
  @Output() onFocus: EventEmitter<any> = new EventEmitter();
  @Output() onBlur: EventEmitter<any> = new EventEmitter();
  @Output() onChangeValue: EventEmitter<any> = new EventEmitter();

  @ViewChild(DatePickerPopupComponent) datePickerPopup: DatePickerPopupComponent;

  isOpen = false;
  selectedDate: Date | null = null;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  form: FormGroup;
  dateAdapter: DateAdapter<Date>;
  activeInput: 'start' | 'end' | null = null;
  private isInternalChange = false;
  private lastEmittedValue: any = null;

  constructor(private elementRef: ElementRef, private fb: FormBuilder) {
    this.form = this.fb.group({
      dateInput: [''],
      startDateInput: [''],
      endDateInput: ['']
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  ngOnInit() {
    this.setDateAdapter();
    this.setupFormControls();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['calendarType']) {
      this.setDateAdapter();
      this.updateInputValue();
      this.lang = this.calendarType == 'jalali'? new lang_Fa(): new lang_En();
    }
    if (changes['minDate'] || changes['maxDate']) {
      this.form.updateValueAndValidity();
    }
    if (changes['mode']) {
      this.setupFormControls();
    }
  }

  setDateAdapter() {
    this.dateAdapter = this.calendarType === 'jalali' ? new JalaliDateAdapter() : new GregorianDateAdapter();
  }

  setupFormControls() {
    if (this.mode === 'range') {
      this.form.get('startDateInput')?.valueChanges.subscribe(value => this.onInputChange(value, 'start'));
      this.form.get('endDateInput')?.valueChanges.subscribe(value => this.onInputChange(value, 'end'));
    } else {
      this.form.get('dateInput')?.valueChanges.subscribe(value => this.onInputChange(value));
    }
  }

  onInputChange(value: string, inputType?: 'start' | 'end') {
    if (!this.isInternalChange) {
      if (this.mode === 'range') {
        const date = this.dateAdapter.parse(value, this.format);
        if (date) {
          if (inputType === 'start') {
            this.selectedStartDate = this.clampDate(date);
          } else if (inputType === 'end') {
            this.selectedEndDate = this.clampDate(date);
          }
          this.emitValueIfChanged();
        }
      } else {
        const date = this.dateAdapter.parse(value, this.format);
        if (date) {
          this.selectedDate = this.clampDate(date);
          this.emitValueIfChanged();
        }
      }
      this.updateDatePickerPopup();
    }
  }

  emitValueIfChanged() {
    let newValue: any;
    if (this.mode === 'range') {
      if (this.selectedStartDate && this.selectedEndDate) {
        newValue = {
          start: this.dateAdapter.format(this.selectedStartDate, this.format),
          end: this.dateAdapter.format(this.selectedEndDate, this.format)
        };
      }
    } else {
      if (this.selectedDate) {
        newValue = this.dateAdapter.format(this.selectedDate, this.format);
      }
    }

    if (newValue && JSON.stringify(newValue) !== JSON.stringify(this.lastEmittedValue)) {
      this.lastEmittedValue = newValue;
      this.onChange(newValue);
    }
    if (newValue) {
      this.onChangeValue.emit(newValue);
    }
  }

  onInputBlur(inputType: 'start' | 'end', event: Event) {
    let inputValue: string | undefined;
    let value;
    if (this.mode === 'range') {
      inputValue = inputType === 'start' ? this.form.get('startDateInput')?.value : this.form.get('endDateInput')?.value;
    } else {
      inputValue = this.form.get('dateInput')?.value;
    }

    if (typeof inputValue === 'string') {
      const correctedValue = this.validateAndCorrectInput(inputValue);
      value = correctedValue;
      if (correctedValue !== inputValue) {
        this.isInternalChange = true;
        if (this.mode === 'range') {
          if (inputType === 'start') {
            this.form.get('startDateInput')?.setValue(correctedValue);
            this.selectedStartDate = this.dateAdapter.parse(correctedValue, this.format);
          } else {
            this.form.get('endDateInput')?.setValue(correctedValue);
            this.selectedEndDate = this.dateAdapter.parse(correctedValue, this.format);
          }
          if (this.selectedStartDate && this.selectedEndDate) {
            this.onChange({
              start: this.dateAdapter.format(this.selectedStartDate, this.format),
              end: this.dateAdapter.format(this.selectedEndDate, this.format)
            });
          }
          // Update the date picker popup
          if (this.datePickerPopup) {
            this.datePickerPopup.selectedStartDate = this.selectedStartDate;
            this.datePickerPopup.selectedEndDate = this.selectedEndDate;
            this.datePickerPopup.generateCalendar();
          }
        } else {
          this.form.get('dateInput')?.setValue(correctedValue);
          this.selectedDate = this.dateAdapter.parse(correctedValue, this.format);
          this.onChange(this.selectedDate);
          // Update the date picker popup
          if (this.datePickerPopup) {
            this.datePickerPopup.selectedDate = this.selectedDate;
            this.datePickerPopup.generateCalendar();
          }
        }
        this.isInternalChange = false;
      }
    }
    this.onBlur.emit({
      input: inputType,
      event,
      value
    })
  }

  validateAndCorrectInput(value: string): string {
    let date = this.dateAdapter.parse(value, this.format);
    if (!date) {
      // If the date is invalid, return today's date or minDate if today is before minDate
      const today = this.dateAdapter.today();
      date = this.minDate ? this.dateAdapter.max([today, this.minDate]) : today;
    } else {
      date = this.clampDate(date);
    }
    return this.dateAdapter.format(date, this.format);
  }

  toggleDatePicker(inputType: 'start' | 'end', event: Event) {
    this.onFocus.emit({
      input: inputType,
      event
    })
    this.isOpen = true;
    this.activeInput = inputType || null;
  }

  onDateSelected(date: Date) {
    const clampedDate = this.clampDate(date);
    if (this.mode === 'range') {
      if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate) || this.dateAdapter.isBefore(clampedDate, this.selectedStartDate)) {
        this.selectedStartDate = clampedDate;
        this.selectedEndDate = null;
        this.form.get('startDateInput')?.setValue(this.dateAdapter.format(clampedDate, this.format), { emitEvent: false });
        this.form.get('endDateInput')?.setValue('', { emitEvent: false });
      } else {
        this.selectedEndDate = clampedDate;
        this.form.get('endDateInput')?.setValue(this.dateAdapter.format(clampedDate, this.format), { emitEvent: false });
        this.emitValueIfChanged();
        this.isOpen = false;
      }
    } else {
      this.selectedDate = clampedDate;
      const formattedDate = this.dateAdapter.format(clampedDate, this.format);
      this.form.get('dateInput')?.setValue(formattedDate, { emitEvent: false });
      this.emitValueIfChanged();
      this.isOpen = false;
    }
    this.updateDatePickerPopup();
  }

  updateDatePickerPopup() {
    if (this.datePickerPopup) {
      if (this.mode === 'range') {
        this.datePickerPopup.selectedStartDate = this.selectedStartDate;
        this.datePickerPopup.selectedEndDate = this.selectedEndDate;
      } else {
        this.datePickerPopup.selectedDate = this.selectedDate;
      }
      this.datePickerPopup.generateCalendar();
    }
  }

  onDateRangeSelected(dateRange: { start: Date, end: Date }) {
    this.selectedStartDate = this.clampDate(dateRange.start);
    this.selectedEndDate = this.clampDate(dateRange.end);
    const startFormatted = this.dateAdapter.format(this.selectedStartDate, this.format);
    const endFormatted = this.dateAdapter.format(this.selectedEndDate, this.format);
    this.form.get('startDateInput')?.setValue(startFormatted, { emitEvent: false });
    this.form.get('endDateInput')?.setValue(endFormatted, { emitEvent: false });
    this.emitValueIfChanged();
    this.isOpen = false;
    this.updateDatePickerPopup();
  }

  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const format = this.getFormatForMode();

    if (!this.dateAdapter.isValidFormat(value, format)) {
      return { invalidFormat: true };
    }

    return null;
  }

  updateInputValue() {
    if (this.mode === 'range') {
      if (this.selectedStartDate) {
        this.form.get('startDateInput')?.setValue(this.dateAdapter.format(this.selectedStartDate, this.format));
      }
      if (this.selectedEndDate) {
        this.form.get('endDateInput')?.setValue(this.dateAdapter.format(this.selectedEndDate, this.format));
      }
    } else if (this.selectedDate) {
      this.form.get('dateInput')?.setValue(this.dateAdapter.format(this.selectedDate, this.format));
    }
  }

  getPlaceholder(inputType: string = null): string {
    switch (this.mode) {
      case 'day':
        return this.lang.selectDate;
      case 'month':
        return this.lang.selectMonth;
      case 'year':
        return this.lang.selectYear;
      case 'range':
        if (inputType == 'start') {
          return this.lang.startDate;
        } else {
          return this.lang.endDate;
        }
      default:
        return this.lang.selectDate;
    }
  }

  clampDate(date: Date): Date {
    if (this.minDate && this.dateAdapter.isBefore(date, this.minDate)) {
      return this.minDate;
    }
    if (this.maxDate && this.dateAdapter.isAfter(date, this.maxDate)) {
      return this.maxDate;
    }
    return date;
  }

  getFormatForMode(): string {
    switch (this.mode) {
      case 'year':
        return 'yyyy';
      case 'month':
        return 'yyyy/MM';
      case 'day':
      case 'range':
        return this.format;
      default:
        return this.format;
    }
  }
  // key controls
  onInputKeypress(event: KeyboardEvent) {
    if (!event.shiftKey && event.key == 'Tab' || !event.shiftKey && event.key == 'Enter') {  // Only handle forward tab, not shift+tab
      this.isOpen = false;
    }
  }
  // ControlValueAccessor methods
  onChange: any = () => { };
  onTouch: any = () => { };

  writeValue(value: any): void {
    if (value) {
      this.isInternalChange = true;
      if (this.mode === 'range' && typeof value === 'object') {
        this.selectedStartDate = this.dateAdapter.parse(value.start, this.format);
        this.selectedEndDate = this.dateAdapter.parse(value.end, this.format);
        this.form.get('startDateInput')?.setValue(value.start, { emitEvent: false });
        this.form.get('endDateInput')?.setValue(value.end, { emitEvent: false });
      } else if (this.mode !== 'range') {
        const parsedDate = this.dateAdapter.parse(value, this.format);
        if (parsedDate) {
          this.selectedDate = this.clampDate(parsedDate);
          this.form.get('dateInput')?.setValue(value, { emitEvent: false });
        }
      }
      this.lastEmittedValue = value;
      this.isInternalChange = false;
      this.updateDatePickerPopup();
    } else {
      this.isInternalChange = true;
      this.selectedDate = null;
      this.selectedStartDate = null;
      this.selectedEndDate = null;
      this.form.get('dateInput')?.setValue('', { emitEvent: false });
      this.form.get('startDateInput')?.setValue('', { emitEvent: false });
      this.form.get('endDateInput')?.setValue('', { emitEvent: false });
      this.lastEmittedValue = null;
      this.isInternalChange = false;
      this.updateDatePickerPopup();
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }
}