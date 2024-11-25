import { Component, ElementRef, forwardRef, Input, OnInit, OnChanges, SimpleChanges, ViewChild, Output, EventEmitter, Renderer2, ChangeDetectorRef, Inject, AfterViewInit, ViewChildren, QueryList, NgZone, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormBuilder, FormGroup, AbstractControl, ValidationErrors, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { slideMotion } from './utils/animation/slide';
import { DateAdapter, JalaliDateAdapter, GregorianDateAdapter } from './date-adapter';
import { CustomLabels, DateRange, Lang_Locale, RangeInputLabels } from './utils/models';
import { DatePickerPopupComponent } from './date-picker-popup/date-picker-popup.component';
import { CdkOverlayOrigin, ConnectedOverlayPositionChange, ConnectionPositionPair, HorizontalConnectionPos, OverlayModule, VerticalConnectionPos } from '@angular/cdk/overlay';
import { DATE_PICKER_POSITION_MAP, DEFAULT_DATE_PICKER_POSITIONS, NzConnectedOverlayDirective } from './utils/overlay/overlay';
import { DOCUMENT, NgIf, NgTemplateOutlet } from '@angular/common';
import { DestroyService, QeydarDatePickerService } from './date-picker.service';
import { fromEvent, takeUntil } from 'rxjs';
import { CalendarType, DatepickerMode, Placement, RangePartType, ValueFormat } from './utils/types';
import { DateMaskDirective } from './utils/input-mask.directive';

@Component({
  selector: 'qeydar-date-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  template: `
    <div qeydarDatepickerStyles class="date-picker-wrapper" [class.date-picker-rtl]="rtl" [class.disabled]="disabled" [formGroup]="form">
      <ng-container *ngIf="!isInline; else inlineMode">
        <ng-container *ngIf="!isRange; else rangeMode">
          <div class="input-container">
            <label for="dateInput" *ngIf="inputLabel">{{ inputLabel }}</label>
            <input
              #datePickerInput
              type="text"
              formControlName="dateInput"
              [qeydar-dateMask]="format"
              [disableInputMask]="disableInputMask"
              (click)="toggleDatePicker(null,$event)"
              (focus)="onFocusInput(null,$event)"
              (blur)="onInputBlur(null,$event)"
              (keydown)="onInputKeydown($event)"
              [class.focus]="isOpen"
              [placeholder]="getPlaceholder()"
              [attr.disabled]="disabled? 'disabled':null"
            >
            <ng-container *ngTemplateOutlet="icon"></ng-container>
          </div>
        </ng-container>
        <ng-template #rangeMode>
          <div *ngIf="rangeInputLabels" class="range-input-labels">
            <div class="start-label">
              <label for="startDateInput">{{ rangeInputLabels.start }}</label>
            </div>
            <div class="end-label">
              <label for="endDateInput">{{ rangeInputLabels.end }}</label>
            </div>
          </div>
          <div class="range-input-container">
            <input
              #rangePickerInput
              type="text"
              formControlName="startDateInput"
              [qeydar-dateMask]="format"
              [disableInputMask]="disableInputMask"
              (click)="toggleDatePicker('start',$event)"
              (focus)="onFocusInput('start',$event)"
              (focusout)="onFocusout($event)"
              (blur)="onInputBlur('start',$event)"
              (keydown)="onInputKeydown($event)"
              [class.focus]="isOpen && activeInput === 'start'"
              [placeholder]="getPlaceholder('start')"
              [attr.disabled]="disabled? 'disabled':null"
            >
            <span class="range-separator">→</span>
            <input
              #rangePickerInput
              type="text"
              formControlName="endDateInput"
              [qeydar-dateMask]="format"
              [disableInputMask]="disableInputMask"
              (click)="toggleDatePicker('end',$event)"
              (focus)="onFocusInput('end',$event)"
              (focusout)="onFocusout($event)"
              (blur)="onInputBlur('end',$event)"
              (keydown)="onInputKeydown($event)"
              [class.focus]="isOpen && activeInput === 'end'"
              [placeholder]="getPlaceholder('end')"
              [attr.disabled]="disabled? 'disabled':null"
            >
            <ng-container *ngTemplateOutlet="icon"></ng-container>
          </div>
        </ng-template>
        <ng-template #icon>
            <button class="calendar-button" (click)="toggleDatePicker(null, $event)" tabindex="-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 24 24" fill="#999">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M6 2C6 1.44772 6.44772 1 7 1C7.55228 1 8 1.44772 8 2V3H16V2C16 1.44772 16.4477 1 17 1C17.5523 1 18 1.44772 18 2V3H19C20.6569 3 22 4.34315 22 6V20C22 21.6569 20.6569 23 19 23H5C3.34315 23 2 21.6569 2 20V6C2 4.34315 3.34315 3 5 3H6V2ZM16 5V6C16 6.55228 16.4477 7 17 7C17.5523 7 18 6.55228 18 6V5H19C19.5523 5 20 5.44772 20 6V9H4V6C4 5.44772 4.44772 5 5 5H6V6C6 6.55228 6.44772 7 7 7C7.55228 7 8 6.55228 8 6V5H16ZM4 11V20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20V11H4Z" fill="#999"/>
              </svg>
            </button>
        </ng-template>
      </ng-container>
      <ng-template #inlineMode>
        <div
          class="dp-dropdown"
          [class.qeydar-picker-dropdown-rtl]="rtl"
          [class.qeydar-picker-dropdown-placement-bottomLeft]="currentPositionY === 'bottom' && currentPositionX === 'start'"
          [class.qeydar-picker-dropdown-placement-topLeft]="currentPositionY === 'top' && currentPositionX === 'start'"
          [class.qeydar-picker-dropdown-placement-bottomRight]="currentPositionY === 'bottom' && currentPositionX === 'end'"
          [class.qeydar-picker-dropdown-placement-topRight]="currentPositionY === 'top' && currentPositionX === 'end'"
          [class.qeydar-picker-dropdown-range]="isRange"
        >
          <qeydar-date-picker-popup
            [rtl]="rtl"
            [@slideMotion]="'enter'"
            [selectedDate]="selectedDate"
            [selectedStartDate]="selectedStartDate"
            [selectedEndDate]="selectedEndDate"
            [mode]="mode"
            [isRange]="isRange"
            [customLabels]="customLabels"
            [calendarType]="calendarType"
            [minDate]="minDate"
            [maxDate]="maxDate"
            [cssClass]="cssClass"
            [footerDescription]="footerDescription"
            [activeInput]="activeInput"
            [showSidebar]="showSidebar"
            [showToday]="showToday"
            [showTimePicker]="showTimePicker"
            [timeDisplayFormat]="timeDisplayFormat"
            (dateSelected)="onDateSelected($event)"
            (dateRangeSelected)="onDateRangeSelected($event)"
            (closePicker)="close()"
            (clickInside)="focus()"
            tabindex="-1"
            [attr.disabled]="disabled? 'disabled':null"
          ></qeydar-date-picker-popup>
        </div>
      </ng-template>
      <ng-template
        cdkConnectedOverlay
        nzConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="isOpen"
        [cdkConnectedOverlayPositions]="overlayPositions"
        [cdkConnectedOverlayTransformOriginOn]="'.qeydar-picker-wrapper'"
        [cdkConnectedOverlayHasBackdrop]="false"
        (positionChange)="onPositionChange($event)"
        (detach)="close()"
      >
        <div
          class="qeydar-picker-wrapper"
          [class.disabled]="disabled"
          [@slideMotion]="'enter'"
          style="position: relative;"
          (click)="$event.stopPropagation()"
        >
          <ng-container *ngTemplateOutlet="inlineMode"></ng-container>
        </div>
      </ng-template>
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
      font-family: inherit;
      max-width: 300px;
      padding: 6px 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      font-size: 14px;
      outline: none;
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
      padding: 4px 4px 0;
      cursor: pointer;
      font-size: 16px;
    }
    .range-input-labels {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      color: #444;
      padding: 0px 5px 5px;
    }
    .end-label {
      width: 49%;
    }
    .disabled {
      opacity: 0.8;
      pointer-events: none;
    }
    .disabled .range-input-container {
      background: #f3f3f3;
    }
    .input-container .calendar-button {
      position: absolute;
      right: 0;
      bottom: 5px;
    }
    .date-picker-rtl .input-container .calendar-button {
      right: auto;
      left: 0;
    }
    .input-container {
      display: flex;
      flex-direction: column;
      gap: 3px;
      color: #444
    }
    // rtl
    :dir(rtl) .range-separator{
      rotate: 180deg;
    }
  `],
  host: {
    "[class.qeydar-datepicker]": "true",
    "[class.qeydar-datepicker-rtl]": "rtl"
  },
  imports: [
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    OverlayModule,
    NgTemplateOutlet,
    NzConnectedOverlayDirective,
    DateMaskDirective,
    DatePickerPopupComponent
  ],
  providers: [
    DestroyService,
    QeydarDatePickerService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePickerComponent),
      multi: true
    }
  ],
  animations: [slideMotion]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit, OnChanges, AfterViewInit, OnDestroy {
  // ========== Input Properties ==========
  @Input() rtl = false;
  @Input() mode: DatepickerMode = 'day';
  @Input() isRange = false;
  @Input() customLabels: Array<CustomLabels>;
  @Input() calendarType: CalendarType = 'gregorian';
  @Input() lang: Lang_Locale;
  @Input() cssClass = '';
  @Input() footerDescription = '';
  @Input() rangeInputLabels: RangeInputLabels;
  @Input() inputLabel: string;
  @Input() placement: Placement = 'bottomRight';
  @Input() disabled = false;
  @Input() isInline = false;
  @Input() showSidebar = true;
  @Input() showToday = false;
  @Input() valueFormat: ValueFormat = 'gregorian';
  @Input() disableInputMask = false;
  @Input() set minDate(date: Date | string | null) {
    if (date) {
      this._minDate = date;
    }
  };
  get minDate() : Date {
    return this._minDate
  }
  
  @Input() set maxDate(date: Date | string | null) {
    if (date) {
      this._maxDate = date;
    }
  };
  get maxDate() : Date {
    return this._maxDate
  }

  @Input() set format(value: string) {
    this._format = value;
    this.showTimePicker = this.hasTimeComponent(value);
    this.timeDisplayFormat = this.extractTimeFormat(value);
  }
  get format(): string {
    return this._format;
  }

  // ========== Output Properties ==========
  @Output() onFocus = new EventEmitter<any>();
  @Output() onBlur = new EventEmitter<any>();
  @Output() onChangeValue = new EventEmitter<any>();
  @Output() onOpenChange = new EventEmitter<boolean>();

  // ========== ViewChild/ViewChildren Properties ==========
  @ViewChild('datePickerInput') datePickerInput: ElementRef;
  @ViewChildren('rangePickerInput') rangePickerInputs?: QueryList<ElementRef<HTMLInputElement>>;
  @ViewChild(DatePickerPopupComponent) datePickerPopup: DatePickerPopupComponent;

  // ========== Class Properties ==========
  origin: CdkOverlayOrigin;
  overlayPositions: ConnectionPositionPair[] = [...DEFAULT_DATE_PICKER_POSITIONS];
  currentPositionX: HorizontalConnectionPos = 'start';
  currentPositionY: VerticalConnectionPos = 'bottom';
  document: Document;

  isOpen = false;
  selectedDate: Date | null = null;
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  form: FormGroup;
  dateAdapter: DateAdapter<Date>;
  activeInput: 'start' | 'end' | '' = '';
  hideStateHelper = false;
  isInternalChange = false;
  lastEmittedValue: any = null;
  showTimePicker = false;
  timeDisplayFormat = 'HH:mm';

  documentClickListener: (event: MouseEvent) => void;
  private _minDate: any;
  private _maxDate: any;
  private _format = 'yyyy/MM/dd';

  constructor(
    public fb: FormBuilder,
    public elementRef: ElementRef,
    public renderer: Renderer2,
    public cdref: ChangeDetectorRef,
    public dpService: QeydarDatePickerService,
    public destroy$: DestroyService,
    public ngZone: NgZone,
    public jalali: JalaliDateAdapter,
    public gregorian: GregorianDateAdapter,
    @Inject(DOCUMENT) doc: Document,
  ) {
    this.initializeComponent(doc);
  }

  // ========== Lifecycle Hooks ==========
  ngOnInit(): void {
    this.initialize();
    document.addEventListener('click', this.documentClickListener);
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.handleChanges(changes);
  }

  ngAfterViewInit(): void {
    this.setupAfterViewInit();
    this._minDate = this.dateAdapter?.parse(this._minDate,this.format);
    this._maxDate = this.dateAdapter?.parse(this._maxDate,this.format);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    document.removeEventListener('click', this.documentClickListener);
  }

  // ========== Initialization Methods ==========
  initializeComponent(doc: Document): void {
    this.origin = new CdkOverlayOrigin(this.elementRef);
    this.document = doc;
    this.form = this.fb.group({
      dateInput: [''],
      startDateInput: [''],
      endDateInput: ['']
    });
    this.documentClickListener = this.handleDocumentClick.bind(this);
    this.lang = this.calendarType === 'jalali' ? this.dpService.locale_fa  : this.dpService.locale_en;
    this.dpService.locale = this.lang;
  }

  initialize(): void {
    this.setDateAdapter();
    this.setupFormControls();
  }

  setupAfterViewInit(): void {
    this.setupActiveInputSubscription();
    this.setupMouseDownEventHandler();
  }

  // ========== Date Adapter Methods ==========
  setDateAdapter(): void {
    this.dateAdapter = this.calendarType === 'jalali' ? this.jalali : this.gregorian;
  }

  // ========== Form Control Methods ==========
  setupFormControls(): void {
    if (this.isRange) {
      this.form.get('startDateInput')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => this.onInputChange(value, 'start'));
      this.form.get('endDateInput')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => this.onInputChange(value, 'end'));
    } else {
      this.form.get('dateInput')?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => this.onInputChange(value));
    }
  }

  // ========== Event Handlers ==========
  handleChanges(changes: SimpleChanges): void {
    if (changes['calendarType']) {
      this.setDateAdapter();
      this.updateInputValue();
      this.lang = this.calendarType === 'jalali' ? this.dpService.locale_fa : this.dpService.locale_en;
      this.dpService.locale = this.lang;
    }
    if (changes['minDate'] || changes['maxDate']) {
      this._minDate = this.dateAdapter?.parse(this._minDate,this.format);
      this._maxDate = this.dateAdapter?.parse(this._maxDate,this.format);
      this.form.updateValueAndValidity();
    }
    if (changes['mode'] || changes['isRange']) {
      this.setupFormControls();
    }
    if (changes['placement']) {
      this.setPlacement(this.placement);
    }
    if (changes['lang']) {
      this.lang = changes['lang'].currentValue;
      this.dpService.locale = this.lang;
    }
    if (changes['mode'] && !changes['format']) {
      this.format = this.getFormatForMode();
    }
    if (changes['isRange'] && this.isRange ==  false) {
      this.origin = new CdkOverlayOrigin(this.elementRef);
    }
    if (changes['valueFormat']) {
      this.emitValueIfChanged();
    }
  }

  handleDocumentClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      if (this.isOpen) {
        this.close();
        this.onInputBlur(this.activeInput as any, event as any);
      }
      this.hideStateHelper = false;
    }
  }

  // ========== Input Handling Methods ==========
  onInputChange(value: string, inputType?: 'start' | 'end'): void {
    if (!this.isInternalChange) {
      if (this.isRange) {
        this.handleRangeInputChange(value, inputType);
      } else {
        this.handleSingleInputChange(value);
      }
      this.updateDatePickerPopup();
    }
  }

  handleRangeInputChange(value: string, inputType?: 'start' | 'end'): void {
    const date = this.dateAdapter.parse(value, this.format);
    if (date) {
      if (inputType === 'start') {
        this.selectedStartDate = this.clampDate(date);
      } else if (inputType === 'end') {
        this.selectedEndDate = this.clampDate(date);
      }
      this.emitValueIfChanged();
    }
  }

  handleSingleInputChange(value: string): void {
    const date = this.dateAdapter.parse(value, this.format);
    if (date) {
      this.selectedDate = this.clampDate(date);
      this.emitValueIfChanged();
    }
  }

  // ========== Value Emission Methods ==========
  emitValueIfChanged(): void {
    const newValue = this.prepareValueForEmission();
    if (newValue && JSON.stringify(newValue) !== JSON.stringify(this.lastEmittedValue)) {
      this.lastEmittedValue = newValue;
      this.onChange(newValue);
      this.onChangeValue.emit(newValue);
    }
  }

  prepareValueForEmission(): any {
    if (this.isRange) {
      if (this.selectedStartDate && this.selectedEndDate) {
        return {
          start: this.convertDateToFormat(this.selectedStartDate, this.calendarType),
          end: this.convertDateToFormat(this.selectedEndDate, this.calendarType)
        };
      }
    } else if (this.selectedDate) {
      return this.convertDateToFormat(this.selectedDate, this.calendarType);
    }
    return null;
  }

  // ========== Date Selection Methods ==========
  onDateSelected(date: Date): void {
    const clampedDate = this.clampDate(date);
    if (this.isRange) {
      this.handleRangeDateSelection(clampedDate);
    } else {
      this.handleSingleDateSelection(clampedDate);
    }
    this.hideStateHelper = true;
    this.updateDatePickerPopup();
    this.focus();
  }

  handleRangeDateSelection(date: Date): void {
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate) ||
      this.dateAdapter.isBefore(date, this.selectedStartDate)) {
      this.selectedStartDate = date;
      this.selectedEndDate = null;
      this.form.get('startDateInput')?.setValue(this.dateAdapter.format(date, this.format), { emitEvent: false });
      this.form.get('endDateInput')?.setValue('', { emitEvent: false });
    } else {
      this.selectedEndDate = date;
      this.form.get('endDateInput')?.setValue(this.dateAdapter.format(date, this.format), { emitEvent: false });
      this.emitValueIfChanged();
      this.close();
    }
  }

  handleSingleDateSelection(date: Date): void {
    this.selectedDate = date;
    const formattedDate = this.dateAdapter.format(date, this.format);
    this.form.get('dateInput')?.setValue(formattedDate, { emitEvent: false });
    this.emitValueIfChanged();
    this.close();
  }

  // ========== Date Range Methods ==========
  onDateRangeSelected(dateRange: DateRange): void {
    this.hideStateHelper = true;

    this.selectedStartDate = this.clampDate(<Date>dateRange.start);
    const startFormatted = this.dateAdapter.format(this.selectedStartDate, this.format);
    this.form.get('startDateInput')?.setValue(startFormatted, { emitEvent: false });

    if (dateRange.end) {
      this.selectedEndDate = this.clampDate(<Date>dateRange.end);
      const endFormatted = this.dateAdapter.format(this.selectedEndDate, this.format);
      this.form.get('endDateInput')?.setValue(endFormatted, { emitEvent: false });
      this.emitValueIfChanged();
      if (!this.hasTimeComponent(this.format)) this.close();
      this.updateDatePickerPopup();
      this.focus();
    }
  }

  // ========== UI State Methods ==========
  close(): void {
    if (this.isInline) {
      return;
    }
    if (this.isOpen) {
      this.isOpen = false;
      this.onOpenChange.emit(false);
      this.cdref.markForCheck();
    }
  }

  open(): void {
    if (this.isInline || this.isOpen || this.disabled) {
      return;
    }
    this.isOpen = true;
    this.onOpenChange.emit(true);
    this.focus();
    this.cdref.markForCheck();
  }

  focus(): void {
    const activeInputElement = this.getInput(this.activeInput);
    if (this.document.activeElement !== activeInputElement) {
      activeInputElement?.focus();
      const length = activeInputElement?.value?.length;
      activeInputElement?.setSelectionRange(length, length);
    }
  }

  // ========== UI Helper Methods ==========
  getInput(partType?: RangePartType): HTMLInputElement | undefined {
    if (this.isInline) {
      return undefined;
    }
    return this.isRange
      ? partType === 'start'
        ? this.rangePickerInputs?.first.nativeElement
        : this.rangePickerInputs?.last.nativeElement
      : this.datePickerInput?.nativeElement;
  }

  getPlaceholder(inputType: string = null): string {
    if (inputType === 'start') return this.lang.startDate;
    if (inputType === 'end') return this.lang.endDate;

    switch (this.mode) {
      case 'month': return this.lang.selectMonth;
      case 'year': return this.lang.selectYear;
      default: return this.lang.selectDate;
    }
  }

  // ========== Date Validation Methods ==========
  clampDate(date: Date): Date {
    if (this.minDate && this.dateAdapter.isBefore(date, this.minDate)) {
      return this.minDate;
    }
    if (this.maxDate && this.dateAdapter.isAfter(date, this.maxDate)) {
      return this.maxDate;
    }
    return date;
  }

  // ========== Date Validation Methods (continued) ==========
  dateFormatValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const format = this.getFormatForMode();
    if (!this.dateAdapter.isValidFormat(value, format)) {
      return { invalidFormat: true };
    }
    return null;
  }

  getFormatForMode(): string {
    switch (this.mode) {
      case 'year':
        return 'yyyy';
      case 'month':
        return 'yyyy/MM';
      default:
        return this.format;
    }
  }

  // ========== Overlay Position Methods ==========
  setPlacement(placement: Placement): void {
    const position: ConnectionPositionPair = DATE_PICKER_POSITION_MAP[placement];
    this.overlayPositions = [position, ...DEFAULT_DATE_PICKER_POSITIONS];
    this.currentPositionX = position.originX;
    this.currentPositionY = position.originY;
  }

  onPositionChange(position: ConnectedOverlayPositionChange): void {
    if (this.currentPositionX !== position.connectionPair.originX ||
        this.currentPositionY !== position.connectionPair.originY)
    {
      this.currentPositionX = position.connectionPair.originX;
      this.currentPositionY = position.connectionPair.originY;
      this.cdref.markForCheck();
    }
  }

  // ========== Input Event Handlers ==========
  onFocusout(event: FocusEvent): void {
    event.preventDefault();
    this.onTouch();
    if (
      !this.elementRef.nativeElement.contains(event.relatedTarget as Node) &&
      !this.datePickerPopup?.el.nativeElement.contains(event.relatedTarget as Node)
    ) {
      this.close();
    }
  }

  onInputBlur(inputType: 'start' | 'end' | null, event: Event): void {
    const inputValue = this.getInputValue(inputType);
    
    if (typeof inputValue === 'string' && !this.isOpen) {
      const correctedValue = this.validateAndCorrectInput(inputValue);
      if (correctedValue !== inputValue) {
        this.handleCorrectedValue(inputType, correctedValue);
      }
      this.onBlur.emit({
        input: inputType,
        event,
        value: correctedValue
      });
    }
  }

  getInputValue(inputType: 'start' | 'end' | null): string | undefined {
    if (this.isRange) {
      return inputType === 'start' 
        ? this.form.get('startDateInput')?.value 
        : this.form.get('endDateInput')?.value;
    }
    return this.form.get('dateInput')?.value;
  }

  validateAndCorrectInput(value: string): string {
    let date = this.dateAdapter.parse(value, this.format);
    if (!date) {
      const today = this.dateAdapter.today();
      date = this.minDate ? this.dateAdapter.max([today, this.minDate]) : today;
    } else {
      date = this.clampDate(date);
    }
    return this.dateAdapter.format(date, this.format);
  }

  handleCorrectedValue(inputType: 'start' | 'end' | null, correctedValue: string): void {
    this.isInternalChange = true;
    if (this.isRange) {
      this.handleRangeCorrectedValue(inputType, correctedValue);
    } else {
      this.handleSingleCorrectedValue(correctedValue);
    }
    this.isInternalChange = false;
  }

  handleRangeCorrectedValue(inputType: 'start' | 'end' | null, correctedValue: string): void {
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
    
    if (this.datePickerPopup) {
      this.datePickerPopup.selectedStartDate = this.selectedStartDate;
      this.datePickerPopup.selectedEndDate = this.selectedEndDate;
      this.datePickerPopup.generateCalendar();
    }
  }

  handleSingleCorrectedValue(correctedValue: string): void {
    this.form.get('dateInput')?.setValue(correctedValue);
    this.selectedDate = this.dateAdapter.parse(correctedValue, this.format);
    this.onChange(this.selectedDate);
    
    if (this.datePickerPopup) {
      this.datePickerPopup.selectedDate = this.selectedDate;
    }
  }

  onFocusInput(inputType: 'start' | 'end' | null, event: Event): void {
    if (this.hideStateHelper == false){
      this.toggleDatePicker(inputType, event);
      this.hideStateHelper = true
    } else {
      this.hideStateHelper = false;
    }
  }

  toggleDatePicker(inputType: 'start' | 'end' | null, event: Event): void {
    this.onFocus.emit({
      input: inputType,
      event
    });
    this.activeInput = inputType;
    this.dpService.activeInput$.next(this.activeInput);
    this.open();
    this.cdref.detectChanges();
  }

  onInputKeydown(event: KeyboardEvent): void {
    if ((!event.shiftKey && event.key === 'Tab') || (!event.shiftKey && event.key === 'Enter')) {
      if (this.isRange) {
        return;
      }
      this.close();
    }
  }

  // ========== Update Methods ==========
  updateInputValue(): void {
    if (this.isRange) {
      if (this.selectedStartDate) {
        this.form.get('startDateInput')?.setValue(
          this.dateAdapter.format(this.selectedStartDate, this.format)
        );
      }
      if (this.selectedEndDate) {
        this.form.get('endDateInput')?.setValue(
          this.dateAdapter.format(this.selectedEndDate, this.format)
        );
      }
    } else if (this.selectedDate) {
      this.form.get('dateInput')?.setValue(
        this.dateAdapter.format(this.selectedDate, this.format)
      );
    }
  }

  updateDatePickerPopup(): void {
    if (this.datePickerPopup) {
      if (this.isRange) {
        this.datePickerPopup.selectedStartDate = this.selectedStartDate;
        this.datePickerPopup.selectedEndDate = this.selectedEndDate;
        if (this.showTimePicker){
          this.datePickerPopup.timePicker.updateFromDate(
            this.activeInput == 'start'?
            this.selectedStartDate:
            this.selectedEndDate
          );
          this.datePickerPopup.timePicker.scrollToTime()
        }
      } else {
        this.datePickerPopup.selectedDate = this.selectedDate;
        if (this.showTimePicker){
          this.datePickerPopup.timePicker.updateFromDate(this.selectedDate);
          this.datePickerPopup.timePicker.scrollToTime();
        }
      }
      this.datePickerPopup.generateCalendar();
      this.cdref.detectChanges();
    }
  }

  convertDateToFormat(date: Date, fromType: CalendarType): any {
    if (!date) return null;

    switch (this.valueFormat) {
      case 'date':
        return date;
      case 'jalali':
        return this.jalali.format(date, this.format);
      case 'gregorian':
        return this.gregorian.format(date, this.format);
      default:
        return this.dateAdapter.format(date, this.format);
    }
  }

  // ========== ControlValueAccessor Implementation ==========
  onChange: any = () => {};
  onTouch: any = () => {};

  writeValue(value: any): void {
    if (value) {
      this.isInternalChange = true;
      
      if (this.isRange && typeof value === 'object') {
        const startDate = this.parseIncomingValue(value.start);
        const endDate = this.parseIncomingValue(value.end);
        
        if (startDate) {
          this.selectedStartDate = startDate;
          this.form.get('startDateInput')?.setValue(
            this.dateAdapter.format(startDate, this.format),
            { emitEvent: false }
          );
        }
        
        if (endDate) {
          this.selectedEndDate = endDate;
          this.form.get('endDateInput')?.setValue(
            this.dateAdapter.format(endDate, this.format),
            { emitEvent: false }
          );
        }
      } else {
        const parsedDate = this.parseIncomingValue(value);
        if (parsedDate) {
          this.selectedDate = parsedDate;
          this.form.get('dateInput')?.setValue(
            this.dateAdapter.format(parsedDate, this.format),
            { emitEvent: false }
          );
        }
      }
      
      this.lastEmittedValue = value;
      this.isInternalChange = false;
      this.updateDatePickerPopup();

      this.cdref.markForCheck();
    } else {
      this.resetValues();
    }
  }

  resetValues(): void {
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

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouch = fn;
  }

  // ========== Setup Methods ==========
  setupActiveInputSubscription(): void {
    this.dpService.activeInput$
      .pipe(takeUntil(this.destroy$))
      .subscribe((active: any) => {
        this.activeInput = active;
        if (active) {
          if (!this.isOpen)
            this.origin = new CdkOverlayOrigin(this.activeInput == 'start'? this.rangePickerInputs?.first: this.rangePickerInputs.last)
          this.focus();
        }
      });
  }

  setupMouseDownEventHandler(): void {
    this.ngZone.runOutsideAngular(() =>
      fromEvent(this.elementRef.nativeElement, 'mousedown')
        .pipe(takeUntil(this.destroy$))
        .subscribe((event: any) => {
          if ((event.target as HTMLInputElement).tagName.toLowerCase() !== 'input') {
            event.preventDefault();
          }
        })
    );
  }

  parseDateValue(value: any): Date | null {
    if (value instanceof Date) {
      return value;
    }
    return this.dateAdapter.parse(value, this.format);
  }

  parseValueFromFormat(value: string | Date, targetAdapter: DateAdapter<Date>): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;

    return targetAdapter.parse(value, this.format);
  }

  parseIncomingValue(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;

    // Try parsing with both adapters
    let parsedDate: Date | null = null;

    // First try with the calendar type's adapter
    // parsedDate = this.dateAdapter.parse(value, this.format);
    // if (parsedDate) return parsedDate;

    // Then try with the alternate adapter
    const alternateAdapter = this.valueFormat === 'jalali' ? this.jalali: this.gregorian;
    parsedDate = alternateAdapter.parse(value, this.format);
    if (parsedDate) return parsedDate;

    return null;
  }

  // ========== Time Methods ==========
  private hasTimeComponent(format: string): boolean {
    return /[Hh]|[m]|[s]|[a]/g.test(format);
  }

  private extractTimeFormat(format: string): string {
    const timeMatch = format.match(/[Hh]{1,2}:mm(?::ss)?(?:\s*[aA])?/);
    return timeMatch ? timeMatch[0] : 'HH:mm';
  }
}