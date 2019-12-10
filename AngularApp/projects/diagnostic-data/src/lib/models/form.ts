import { DetectorResponse } from '../models/detector';
export class Form {
    formId: number;
    formTitle: string;
    formInputs: FormInput[] = [];
    formButtons: FormButton[] = [];
    errorMessage: string = '';
    formResponse: DetectorResponse;
    loadingFormResponse: boolean = false;
}

export class FormInput {
    internalId: string;
    inputId: number;
    inputType: InputType;
    inputLabel: string;
    inputValue: any;
    isRequired: boolean = false;
    displayValidation: boolean = false;
    items: ListItem[] = [];

    constructor(internalId: string, id: number, inputType: InputType, label: string, isRequired: boolean, _items: ListItem[]) {
        this.internalId = internalId;
        this.inputId = id;
        this.inputType = inputType;
        this.inputLabel = label;
        this.isRequired = isRequired;
        this.items = [];
        if (_items != null) {
            for (let index = 0; index < _items.length; index++) {
                this.items.push(_items[index]);
            }
        }

    }
}

export class FormButton extends FormInput {
    buttonStyle: ButtonStyles;
    constructor(internalId: string, id: number, inputType: InputType, label: string, isRequired: boolean, buttonStyle?: ButtonStyles) {
        super(internalId, id, inputType, label, isRequired, null);
        this.buttonStyle = buttonStyle != undefined ? buttonStyle : ButtonStyles.Primary;
    }
}

export class RadioButtonList extends FormInput {
    constructor(internalId: string, id: number, inputType: InputType, label: string, isRequired: boolean, items: ListItem[]) {
        super(internalId, id, inputType, label, isRequired, items);
    }
}

export enum InputType {
    TextBox,
    Checkbox,
    RadioButton,
    DropDown,
    Button
}

export enum ButtonStyles {
    Primary = 0,
    Secondary,
    Success,
    Danger,
    Warning,
    Info,
    Light,
    Dark,
    Link
}

export interface ListItem {
    text: string;
    value: string;
    isSelected: boolean;
}