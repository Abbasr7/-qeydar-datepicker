<div align="center">
  <a href="https://www.npmjs.com/package/@qeydar/datepicker" target="_blank">
    <img src="https://img.shields.io/badge/Npm-v1.1.4-orange" alt="NPM Version" />
  </a>
  <img src="https://img.shields.io/badge/Angular-%E2%89%A514.0.0-red" alt="Angular Version" />
</div>

# Qeydar Date and Time Pickers

A comprehensive package providing separate DatePicker and TimePicker components for Angular applications, with support for both Jalali (Persian) and Gregorian calendars.
This package supports Angular 14 and above. Specific version compatibility:

| Package Version | Angular Version |
| --------------- | --------------- |
| 1.x.x           | ≥14.0.0         |

## Demo

You can see the online [Demo](https://datepicker.qydr.ir/)

## Components

This package includes two main components:

1. `QeydarDatePicker`: A flexible date picker with range selection support and time selection
2. `QeydarTimePicker`: A standalone time picker with 12/24 hour format support

## Features

### DatePicker

- 📅 Support for both Jalali (Persian) and Gregorian calendars
- 🎯 Single date and date range selection
- ⏰ Integrated time selection support
- 🌐 Multilingual support (English/Persian)
- 📏 Min/Max date restrictions
- 🎨 Customizable styles
- 📱 Responsive design
- ⌨️ Keyboard navigation
- 🔄 Form integration
- 📋 Custom period labels
- 📐 Multiple placement options
- 🔄 Value format flexibility (string/Date object)
- 🎯 Today button support
- 🚫 Disabled dates support with custom filtering
- 🎨 Custom templates for days, months, and years
- 🔒 Read-only mode support

### TimePicker

- ⏰ 12/24 hour format support
- ⏱️ Optional seconds display
- 🔒 Time range restrictions
- 🎭 Time input mask
- 🌐 Multilingual AM/PM
- 📍 Inline display mode
- 🔄 Date adapter integration
- 🚫 Disabled times support with custom filtering

## Installation

```bash
npm install @angular/cdk@<COMPATIBLE_VERSION> @qeydar/datepicker
```

### Dependencies

```json
{
  "@angular/cdk": ">=14.0.0",
  "date-fns": ">=2.0.0",
  "date-fns-jalali": ">=2.13.0"
}
```

### Required Styles

```css
@import "@angular/cdk/overlay-prebuilt.css";
```

## DatePicker Usage

### Basic Usage

```typescript
// app.module.ts
import { QeydarDatePickerModule } from "@qeydar/datepicker";

@NgModule({
  imports: [QeydarDatePickerModule],
})
export class AppModule {}

// component.ts
@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="selectedDate"
      [calendarType]="'jalali'"
    ></qeydar-date-picker>
  `,
})
export class AppComponent {
  selectedDate: Date | string = "1403/01/01"; // Can accept both Date object and string
}
```

### Range Selection

The DatePicker supports flexible range selection with multiple ways to handle values:

```typescript
@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="dateRange"
      [isRange]="true"
      [rangeInputLabels]="{ start: 'From', end: 'To' }"
      [emitInDateFormat]="false"
      [calendarType]="'jalali'"
    ></qeydar-date-picker>
  `,
})
export class AppComponent {
  // Using string values
  dateRange = {
    start: "1403/08/12",
    end: "1403/08/15",
  };

  // Using mixed values (string and Date)
  dateRange2 = {
    start: "1403/08/12",
    end: new Date(),
  };

  // Using Date objects
  dateRange3 = {
    start: new Date("2024-01-01"),
    end: new Date("2024-01-07"),
  };

  // With emitInDateFormat=true, values will be emitted as Date objects
  onRangeChange(range: { start: Date; end: Date }) {
    console.log("Start:", range.start);
    console.log("End:", range.end);
  }
}
```

### Range Selection with Predefined Periods

```typescript
// Define custom period labels
const customLabels: CustomLabels[] = [
  {
    label: 'This Week',
    value: [new Date('2024-01-01'), new Date('2024-01-07')]
  },
  {
    label: 'Last 7 Days',
    value: ['1403/08/05', '1403/08/12'] // Can use strings for Jalali dates
  },
  {
    label: 'Custom Range',
    value: 'custom'
  }
];

@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="dateRange"
      [isRange]="true"
      [customLabels]="customLabels"
      (onChangeValue)="onRangeChange($event)"
    ></qeydar-date-picker>
  `
})
```

### Date and Time Selection

```typescript
@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="selectedDateTime"
      [format]="'yyyy/MM/dd HH:mm:ss'"
      [showTimePicker]="true"
      [timeDisplayFormat]="'HH:mm'"
      [showToday]="true"
    ></qeydar-date-picker>
  `,
})
export class AppComponent {
  selectedDateTime: Date | string = new Date();
}
```

### Value Format Options

```typescript
@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="selectedDate"
      [valueFormat]="'gregorian'"  // 'gregorian' | 'jalali' | 'date'
      [calendarType]="'jalali'"
    ></qeydar-date-picker>
  `
})
```

### Disabled Dates

```typescript
@Component({
  template: `
    <qeydar-date-picker
      [(ngModel)]="selectedDate"
      [disabledDates]="disabledDates"
      [disabledDatesFilter]="disabledDatesFilter"
    ></qeydar-date-picker>
  `,
})
export class AppComponent {
  // These will disable the entire day
  disabledDates = [
    new Date(2024, 0, 1), // Jan 1, 2024
    new Date(2024, 11, 25), // Dec 25, 2024
    "2024/01/15", // Jan 15, 2024
  ];

  // This will disable specific days advanced
  disabledDatesFilter = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // Disable weekends
  };
}
```

### Custom Templates

The DatePicker now supports custom templates for days, months, and years, allowing you to customize how these elements are rendered:

```typescript
@Component({
  template: `
    <qeydar-date-picker [(ngModel)]="selectedDate">
      <!-- Custom day template -->
      <ng-template qeydarTemplate="day" let-day>
        <div class="custom-day">
          {{ day.getDate() }}
          <!-- Add custom indicators or styling -->
          <span *ngIf="isSpecialDay(day)" class="special-indicator">*</span>
        </div>
      </ng-template>

      <!-- Custom month template -->
      <ng-template qeydarTemplate="month" let-month>
        <div class="custom-month">
          {{ getMonthName(month) }}
          <!-- Add custom content -->
        </div>
      </ng-template>

      <!-- Custom year template -->
      <ng-template qeydarTemplate="year" let-year>
        <div class="custom-year">
          {{ year }}
          <!-- Add custom styling or indicators -->
        </div>
      </ng-template>
    </qeydar-date-picker>
  `,
})
export class AppComponent {
  isSpecialDay(date: Date): boolean {
    // Your custom logic
    return date.getDate() === 1;
  }
}
```

### Read-only Mode

The DatePicker now supports two types of read-only modes:

```typescript
@Component({
  template: `
    <!-- Completely read-only - prevents both input and calendar interaction -->
    <qeydar-date-picker
      [(ngModel)]="selectedDate"
      [readOnly]="true"
    ></qeydar-date-picker>

    <!-- Read-only input but allows calendar interaction -->
    <qeydar-date-picker
      [(ngModel)]="selectedDate"
      [readOnlyInput]="true"
    ></qeydar-date-picker>
  `
})
```

## TimePicker Usage

The TimePicker is a separate component for time selection:

```typescript
@Component({
  template: `
    <qeydar-time-picker
      [(ngModel)]="selectedTime"
      [timeFormat]="'24'"
      [showSeconds]="true"
      [minTime]="'09:00'"
      [maxTime]="'17:00'"
    ></qeydar-time-picker>
  `,
})
export class AppComponent {
  selectedTime = "14:30:00";

  // Or using Date object with valueType="date"
  selectedDateTime = new Date();
}
```

### TimePicker with Custom Format

```typescript
<qeydar-time-picker
  [(ngModel)]="time"
  [timeFormat]="'12'"
  [displayFormat]="'hh:mm a'"
  [rtl]="true"
  (timeChange)="onTimeChange($event)"
></qeydar-time-picker>
```

### Inline Mode with Date Adapter

```typescript
@Component({
  template: `
    <qeydar-time-picker
      [(ngModel)]="time"
      [inline]="true"
      [dateAdapter]="dateAdapter"
      [timeDisplayFormat]="'HH:mm:ss'"
      (timeChange)="onTimeChange($event)"
    ></qeydar-time-picker>
  `,
})
export class AppComponent {
  constructor(public dateAdapter: GregorianDateAdapter) {}
}
```

### Disabled Times

```typescript
@Component({
  template: `
    <qeydar-time-picker
      [(ngModel)]="selectedTime"
      [disabledTimesFilter]="disabledTimesFilter"
    ></qeydar-time-picker>
  `,
})
export class AppComponent {
  // Disable lunch hours (12:00-13:00)
  disabledTimesFilter = (date: Date) => {
    const hour = date.getHours();
    const minute = date.getMinutes();

    // Disable specific hour
    if (hour === 12) return true;

    // Disable specific minutes
    if (minute === 45) return true;

    return false;
  };
}
```

## API Reference

### DatePicker Inputs

| Input               | Type                              | Default      | Description                                                |
| ------------------- | --------------------------------- | ------------ | ---------------------------------------------------------- | --------- | -------------------------------------------------- |
| rtl                 | boolean                           | false        | Right-to-left mode                                         |
| mode                | 'day' \| 'month' \| 'year'        | 'day'        | Selection mode                                             |
| isRange             | boolean                           | false        | Enable range selection                                     |
| format              | string                            | 'yyyy/MM/dd' | Date format                                                |
| calendarType        | 'jalali' \| 'gregorian'           | 'gregorian'  | Calendar type                                              |
| minDate             | Date                              | null         | Minimum selectable date                                    |
| maxDate             | Date                              | null         | Maximum selectable date                                    |
| cssClass            | string                            | ''           | Custom CSS class                                           |
| footerDescription   | string                            | ''           | Footer description text                                    |
| rangeInputLabels    | RangeInputLabels                  | undefined    | Labels for range inputs                                    |
| inputLabel          | string                            | undefined    | Label for single input                                     |
| placement           | Placement                         | 'bottomLeft' | Dropdown placement                                         |
| disabled            | boolean                           | false        | Disable the datepicker                                     |
| isInline            | boolean                           | false        | Show calendar inline                                       |
| showSidebar         | boolean                           | true         | Show sidebar with months/years                             |
| showToday           | boolean                           | false        | Highlight today's date                                     |
| valueFormat         | 'gregorian' \| 'jalali' \| 'date' | 'gregorian'  | Output value format                                        |
| disableInputMask    | boolean                           | false        | To disable input mask                                      |
| disabledDates       | Arrar<Date                        |              | string>                                                    | undefined | Array of Date and string to disable the entire day |
| disabledDatesFilter | (date: Date) => boolean           | undefined    | Function to determine if a date should be disabled         |
| disabledTimesFilter | (date: Date) => boolean           | undefined    | Function to determine if a time of date should be disabled |
| allowEmpty          | boolean                           | true         | Allow empty value                                          |
| readOnly            | boolean                           | false        | Make the entire component read-only                        |
| readOnlyInput       | boolean                           | false        | Make only the input field read-only                        |

### DatePicker Outputs

| Output        | Type                  | Description                     |
| ------------- | --------------------- | ------------------------------- |
| onFocus       | EventEmitter<any>     | Fires when input receives focus |
| onBlur        | EventEmitter<any>     | Fires when input loses focus    |
| onChangeValue | EventEmitter<any>     | Fires when value changes        |
| onOpenChange  | EventEmitter<boolean> | Fires when picker opens/closes  |

### TimePicker Inputs

| Input               | Type                    | Default       | Description                                        |
| ------------------- | ----------------------- | ------------- | -------------------------------------------------- |
| placeholder         | string                  | 'Select time' | Input placeholder                                  |
| displayFormat       | string                  | 'hh:mm a'     | Time display format                                |
| minTime             | string                  | undefined     | Minimum selectable time                            |
| maxTime             | string                  | undefined     | Maximum selectable time                            |
| valueType           | 'string' \| 'date'      | 'string'      | Output value type                                  |
| cssClass            | string                  | ''            | Custom CSS class                                   |
| showIcon            | boolean                 | true          | Show clock icon                                    |
| rtl                 | boolean                 | false         | Right-to-left mode                                 |
| lang                | Lang_Locale             | lang_En       | Language settings                                  |
| inline              | boolean                 | false         | Show time picker inline (without popup)            |
| dateAdapter         | DateAdapter<Date>       | undefined     | Custom date adapter for time manipulation          |
| disableInputMask    | boolean                 | false         | To disable input mask                              |
| disabledTimesFilter | (date: Date) => boolean | undefined     | Function to determine if a time should be disabled |
| disabled            | boolean                 | false         | Disable the time picker                            |
| allowEmpty          | boolean                 | true          | Allow empty value                                  |

### TimePicker Outputs

| Output     | Type                  | Description                    |
| ---------- | --------------------- | ------------------------------ |
| timeChange | EventEmitter<any>     | Fires when time changes        |
| openChange | EventEmitter<boolean> | Fires when picker opens/closes |

## Form Integration Examples

### Reactive Forms with Both Components

```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <!-- Date Range -->
      <qeydar-date-picker
        formControlName="dateRange"
        [isRange]="true"
        [calendarType]="'jalali'"
      ></qeydar-date-picker>

      <!-- Time -->
      <qeydar-time-picker
        formControlName="time"
        [timeFormat]="'24'"
      ></qeydar-time-picker>
    </form>
  `,
})
export class AppComponent {
  form = this.fb.group({
    dateRange: [
      {
        start: "1403/08/12",
        end: new Date(),
      },
    ],
    time: ["14:30"],
  });

  constructor(private fb: FormBuilder) {}
}
```

#### Inline Mode

```typescript
<qeydar-time-picker
  [(ngModel)]="time"
  [inline]="true"
  [timeFormat]="'24'"
  [displayFormat]="'HH:mm:ss'"
></qeydar-time-picker>
```

### Calendar Types and Localization

The TimePicker automatically adapts to your chosen calendar system:

```typescript
// Jalali (Persian) Time Picker
<qeydar-time-picker
  [(ngModel)]="time"
  [rtl]="true"
  [timeFormat]="'12'"
></qeydar-time-picker>

// Gregorian Time Picker
<qeydar-time-picker
  [(ngModel)]="time"
  [rtl]="false"
  [timeFormat]="'24'"
></qeydar-time-picker>
```

### Template-driven Forms

```typescript
<form #form="ngForm">
  <qeydar-date-picker
    [(ngModel)]="dateRange"
    name="dateRange"
    [isRange]="true"
    required
  ></qeydar-date-picker>

  <qeydar-time-picker
    [(ngModel)]="time"
    name="time"
    required
  ></qeydar-time-picker>
</form>
```

## Styling

Both components can be styled using CSS variables:

```css
.qeydar-time-picker {
  --primary-color: #40a9ff;
  --border-color: #d9d9d9;
  --text-color: #666;
  --background-color: white;
  --hover-background: #f5f5f5;
  --selected-background: #e6f4ff;
  --selected-text-color: #1890ff;
  --disabled-color: #d9d9d9;
}

/* Inline mode specific styles */
.time-picker-popup.inline {
  border: 1px solid var(--border-color);
  border-radius: 8px;
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
