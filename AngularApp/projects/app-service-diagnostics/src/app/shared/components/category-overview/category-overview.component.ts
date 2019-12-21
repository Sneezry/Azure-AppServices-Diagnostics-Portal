import { Component, OnInit, ViewChild, TemplateRef, ElementRef, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { Category } from '../../../shared-v2/models/category';
import { InputRendererOptions, JsxRenderFunc, ReactWrapperComponent } from '@angular-react/core';
import { IPanelHeaderRenderer, IPanelProps } from 'office-ui-fabric-react/lib/Panel';
import { Message, TextMessage} from '../../../supportbot/models/message';
import { MessageSender, ButtonActionType } from '../../../supportbot/models/message-enums';
import { MessageProcessor } from '../../../supportbot/message-processor.service';
import { DynamicComponent } from '../../../supportbot/dynamic-component/dynamic.component';
import { TextMessageComponent } from '../../../supportbot/common/text-message/text-message.component';
import { FabDropdownComponent } from '@angular-react/fabric';
import { addMonths, addYears, addDays, addWeeks } from 'office-ui-fabric-react/lib/utilities/dateMath/DateMath';
import { mergeStyleSets, hiddenContentStyle , MessageBarType}from 'office-ui-fabric-react';

import {
    PanelType,
    IPanelStyles,
    ICalendarStrings,
    IContextualMenuProps,
    ISelection,
    Selection,
    DropdownMenuItemType,
    IDropdownOption,
    ICheckboxProps,
    IPersonaProps,
    IPeoplePickerProps
} from 'office-ui-fabric-react';

import { GenieChatFlow } from '../../../supportbot/message-flow/v2-flows/genie-chat.flow';
//  import {} from 'office-ui-fabric-core/lib';
//  createInputJsxRenderer, createRenderPropHandler

const suffix = ' cm';

@Component({
    selector: 'category-overview',
    templateUrl: './category-overview.component.html',
    styleUrls: ['./category-overview.component.scss',
    ]
})
//extends Renderable

export class CategoryOverviewComponent implements OnInit {
    @ViewChild('ms-Panel-scrollableContent', { static: false }) myScrollContainer1: ElementRef;
    @ViewChild('scrollMe', { static: true }) myScrollContainer: any;
    @ViewChild('timepicker', { static: true }) timepicker: any;
    // @ViewChild(MarkdownComponent, {static: false})
    // public set markdown(v: MarkdownComponent) {
    //     this.markdownDiv = v;
    //     if (this.markdownDiv) {
    //       this.listenObj = this.renderer.listen(this.markdownDiv.element.nativeElement, 'click', (evt) => this._interceptorService.interceptLinkClick(evt, this.router, this.detector, this.telemetryService));
    //     }
    //   }
        //  @ViewChild('ms-Panel-scrollableContent', { static: false }) myScrollContainer: ElementRef;
        categoryId: string = "";
        category: Category;
        showCalendar: boolean = false;

        messages: Message[] = [];
        showTypingMessage: boolean;
        chatContainerHeight: number;
        isOpen: boolean = false;
        // navigationContent: InputRendererOptions<IPanelProps>;
        //  navigationContent: RenderPropContext<IPanelProps>;
        navigationContent: (() => HTMLElement);
        renderFooter: (() => HTMLElement);
        isLightDismiss: boolean = true;
        welcomeMessage: string = "Welcome to App Service Diagnostics. My name is Genie and I am here to help you answer any questions you may have about diagnosing and solving your problems with your app. Please describe the issue of your app.";
        panelStyles: any;
        type: PanelType = PanelType.custom;
        width: string = "1200px";
        internalTime: string = "";

        selectedItem?: IDropdownOption;
        timeDivider: DropdownMenuItemType = DropdownMenuItemType.Divider;
        options: FabDropdownComponent['options'] = [
          { key: 'Last1Hour', text: 'Last 1 Hour',  data: {  iconProps: {iconName: 'CaretRight'}, }},
          { key: 'Last6Hours', text: 'Last 6 Hours' , data: {icon: "RadioButtonOff"}},
          { key: 'Last12Hour', text: 'Last 12 Hours' , data: {icon: "RadioButtonOff"}},
          { key: 'Last24Hours1', text: 'Last 24 Hours' , data: {icon: "RadioButtonOff"}},
          { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
          { key: 'Custom', text: 'Custom' , data: {icon: "RadioButtonOff"}}
        ];

        showChoices: boolean = false;
        showTimerPicker: boolean = false;
        choiceGroupOptions: any=[
            { key: 'Last1Hour', text: 'Last 1 Hour',  onClick: ()=>{this.setTime("Last 1 Hour"); this.showTimerPicker = false}},
            { key: 'Last6Hours', text: 'Last 6 Hours' , onClick: ()=>{this.setTime("Last 6 Hours");this.showTimerPicker = false}},
            { key: 'Last12Hour', text: 'Last 12 Hours' , onClick: ()=>{this.setTime("Last 12 Hours"); this.showTimerPicker = false}},
            { key: 'Last24Hours', text: 'Last 24 Hours' , onClick: ()=>{this.setTime("Last 24 Hours");this.showTimerPicker = false}},
            { key: 'Custom', text: 'Custom' , onClick: ()=>{this.showTimerPicker = true}},
        ];

        setTime(x: string){
            this.internalTime = x;
        }

        setTimewithClock(x: number){
            this.startClock = `${this.endHour-x}:${this.startMinutes}`;
            this.internalTime = `${this.startDate} ${this.startClock} - ${this.endDate} ${this.endClock} `;
        }

        calloutStyles: any = {
            overflowY: "hidden",
            right:20,
            top: 50,
            padding: 10
        };

        applyTimeRange() {
            this.time = "Time Range: " + this.internalTime;
            this.showChoices = !this.showChoices;
        }

        cancelTimeRange() {
            this.showChoices = !this.showChoices;
        }



        logEvent(...args: any[]) {
            console.log(args);
            if (args.length > 1 && args[1].option != undefined && args[1].option.key === "Custom") {
                this.dropdownStyles.isOpen = true;
                this.options.push({ key: 'StartTime', text: 'Start Time' });
                this.options.push({ key: 'EndTime', text: 'End Time' });
            }
        }

        // commandbar related
        commandbarStyles= {
            // type: PanelType.smallFixedNear,
            backgroundColor: "white"
          //   customWidth: "585",
         };
        listenObj: any;
        dropdownOpen: boolean = true;
        customizeTime: boolean = false;
        customIcon: string = "RadioBtnOff";
        time: string = "Time Range: Last 24 Hours"

        itemProps1:Partial<IContextualMenuProps> = {
            onItemClick: (ev, item) => {
              console.log(`${item.text} clicked`);
              return false;
            }
        };


        dropdownStyles = {
            // type: PanelType.smallFixedNear,
             isOpen: false
          //   customWidth: "585",
         };

        renderCheckboxLabel: any = {
            getProps: defaultProps => ({
              item: defaultProps["item"],
              dismissMenu: false
            }),
        };


        onMouseOverEventHandler(event: any){
            console.log("event from mouse over", event);
            event.preventDefault();
        }

        onClickEventHandler(event: any) {
            console.log("event from onclick", event);
            event.preventDefault();
        }

        setText(event: any) {
            this.time = "Setting the time";
            this.customizeTime = true;
            this.customIcon = "RadioBtnOn";

       //     console.log("item", item);
        //     console.log("event", event, event.item.onClick);
        //    // event.preventDefault();
        //     event.item.onClick = ((e) => {
        //         e.preventDefault();
        //     });

            console.log("time picker", this.timepicker);
            var x = document.getElementsByClassName("ms-Callout-container");
            console.log("Callout picker", x[0], x[0]);

          //  x[0].style.display = "block";
            //console.log("Callout picker", x[0], x[0].style.display);
            //event.preventDefault();

        }
        dates: ICalendarStrings = {
            months: [
              'January',
              'February',
              'March',
              'April',
              'May',
              'June',
              'July',
              'August',
              'September',
              'October',
              'November',
              'December',
            ],

            shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

            days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

            shortDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

            goToToday: 'Go to today',
            weekNumberFormatString: 'Week number {0}',
          };

          today: Date = new Date(Date.now());
          maxDate: Date = this.today;
          endHour: any = this.today.getHours();
          endMinutes: any = this.today.getMinutes();
          startHour: any = this.today.getHours();
          startMinutes: any = this.today.getMinutes();
          startDate: any = addDays(this.today, -1).toISOString().split('T')[0];
          endDate: any = this.today.toISOString().split('T')[0];
       //   minDate: Date = (new Date(Date.now())).add(-30).days();
       //   maxDate: Date = new Date(Date.now()-)

           minDate: Date = addMonths(this.today, -1);


        startClock: string = `${this.startHour}:${this.startMinutes}`;
        endClock: string = `${this.endHour}:${this.endMinutes}`;

        messageBarType: MessageBarType = MessageBarType.warning;
           onIncrement(value: string): string | void {
            value = this._removeSuffix(value, suffix);

            if (+value >= 13) {
              return value + suffix;
            }

            return String(+value + 2) + suffix;
          }

          getErrorMessageOnTextField(value: string): string {
            var values = value.split(":");
            var errorMessage = "";
            if (!(values.length > 1 && +values[0] <= 24 && +values[1] <= 59))
            {
                errorMessage = `Invalid time`;
            }
            return errorMessage;
          }

          onDecrement(value: string): string | void {
            value = this._removeSuffix(value, suffix);

            if (+value <= 3) {
              return value + suffix;
            }
            return String(+value - 2) + suffix;
          }

          onValidate(value: string, event: Event): string | void {
            value = this._removeSuffix(value, suffix);
            if (value.trim().length === 0 || isNaN(+value)) {
              return '0' + suffix;
            }

            return String(value) + suffix;
          }

          private _hasSuffix(value: string, suffix: string): Boolean {
            const subString = value.substr(value.length - suffix.length);
            return subString === suffix;
          }

          private _removeSuffix(value: string, suffix: string): string {
            if (!this._hasSuffix(value, suffix)) {
              return value;
            }

            return value.substr(0, value.length - suffix.length);
          }


    // @ViewChild('panelTitle', { static: true }) navigationContentTemplate: TemplateRef<any>;
    // @ViewChild("headerTemplate", { static: true }) headerTemplate: TemplateRef<any>;
    // @ViewChild('tpl', { static: true }) tpl: TemplateRef<any>;

    constructor(private _activatedRoute: ActivatedRoute, private _messageProcessor: MessageProcessor, private _genieChatFlow: GenieChatFlow, private _router: Router, private _categoryService: CategoryService) {
            this.panelStyles = {
           // type: PanelType.smallFixedNear,
            root: {
                          // position: 'fixed',
                          width: 585,
                          // boxSizing: 'border-box',
                          // overflowY: 'auto',
                          // overflowX: 'hiden',
                      },
         //   customWidth: "585",
        };
        this.chatContainerHeight = 0;
    }

    ngAfterViewInit() {
        var x = document.getElementById("custom");
        console.log("x", x);
        x.addEventListener("click", function(event){
          // console.log("I am clicking");
          event.preventDefault()
        });
        console.log("Afterview init updating scrolling", this.myScrollContainer);
      }

    sendFeedback() {

    }

    refresh() {
        this.showChoices = !this.showChoices;
    }

    showSearch() {

    }

    onCopyClicked() {

    }

    scrollToBottom(event?: any): void {

        try {
          //this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].scrollHeight;
           var height =   this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
            this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = height;

            // if ( this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop <  this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight)
            // {
            //     this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop = this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight;
            // }

            console.log("3. scrolltop after scrollTop", this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollTop, this.myScrollContainer.elementRef.nativeElement.childNodes[0].childNodes[2].scrollHeight);
        } catch (err) {
            console.log("status scrollToBottom", err);
        }
    }

    getMessage(event?: any): void {
        console.log("status oncomplete: event", event);
        const self = this;
        const message = this._messageProcessor.getNextMessage(event);

        if (message) {
            this.messages.push(message);
            if (message.messageDelayInMs >= 2000) {
                this.showTypingMessage = true;

                // To show the typing message icon, we need to scroll the page to the bottom.
                setTimeout(() => {
                  //  this.scrollToBottom();
                }, 200);
            }
        }
    }


    onSearchEnter(event: any): void {
        this._genieChatFlow.createMessageFlowForAnaysis(event.newValue).subscribe((analysisMessages: Message[]) => {
            analysisMessages.forEach(message => {
                this.messages.push(message);
            });

            console.log("constructing messages onsearch", this.messages);
        });
  }

  openMessageBar: boolean = false;
    closePanel() {
        this.openMessageBar = true;
        this.isOpen = false;
        console.log("isOpen", this.isOpen);
    }
    ngOnInit() {
        // document.getElementById("custom").addEventListener("click", function(event){
        //     // console.log("I am clicking");
        //     event.preventDefault()
        //   });


        this.categoryId = this._activatedRoute.parent.snapshot.params.category;

        this._categoryService.categories.subscribe(categorys => {
            this.category = categorys.find(category => this.categoryId === category.id);
          });

          console.log("categoryId", this.categoryId);
        this.messages.push(new TextMessage(this.welcomeMessage, MessageSender.System, 200));
        this.chatContainerHeight = window.innerHeight - 170;



        document.getElementById('close').onclick = () => {
            this.isOpen = false;
            console.log("this.isOpen", this.isOpen);
        }


        this.renderFooter = () => {
            // let panelTitle =  document.createElement('fab-search-box') as HTMLElement;
            let panelTitle = document.createElement('div') as HTMLElement;
            //  panelTitle.placeholder = 'Type your question';
            // panelTitle.style.left = '25px';
            // panelTitle.style.right = '32px';
            // panelTitle.style.top = '0px';
            // panelTitle.style.height = '27px';
            // panelTitle.style.fontFamily = "Segoe UI";
            // panelTitle.style.fontSize = "18px";
            // panelTitle.style.lineHeight = "24px";
            // panelTitle.style.display = "flex";
            // panelTitle.style.alignItems = "flex-end";
            panelTitle.innerHTML = "Hi my name is Genie";
            return panelTitle;
            // (props?: P, defaultRender?: (props?: P) => JSX.Element | null): JSX.Element | null;
        };



        // this.navigationContent =  {
        //     render: defaultProps => ({
        //       ...defaultProps,
        //       onRenderNavigationContent: (props, defaultRender) => return (
        //         <>
        //     <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //     {
        //     ${defaultRender!(props)}
        //   </>)
        //     }),
        //   };

        //     this.navigationContent =   (props, defaultRender) => {
        //         `<>
        //     <SearchBox placeholder="Search here..." styles={searchboxStyles} ariaLabel="Sample search box. Does not actually search anything." />
        //     {// This custom navigation still renders the close button (defaultRender).
        //     // If you don't use defaultRender, be sure to provide some other way to close the panel.
        //     ${defaultRender!(props)}
        //   </>`;
        // };
        console.log("routes", this._activatedRoute.parent);
        console.log("categoryId", this.categoryId);
    }
}