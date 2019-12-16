import { DetectorControlService, FeatureNavigationService, DetectorResponse } from 'diagnostic-data';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Category } from '../../../shared-v2/models/category';
import { CategoryService } from '../../../shared-v2/services/category.service';
import { FeatureService } from '../../../shared-v2/services/feature.service';
import { LoggingV2Service } from '../../../shared-v2/services/logging-v2.service';
import { NotificationService } from '../../../shared-v2/services/notification.service';
import { ResourceService } from '../../../shared-v2/services/resource.service';
import { HomePageText } from '../../../shared/models/arm/armResourceConfig';
import { ArmService } from '../../../shared/services/arm.service';
import { AuthService } from '../../../startup/services/auth.service';
import { TelemetryService } from 'diagnostic-data';
import { PortalKustoTelemetryService } from '../../../shared/services/portal-kusto-telemetry.service';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import { DiagnosticService } from 'diagnostic-data';
import { ISearchBoxProps } from 'office-ui-fabric-react';
import { FabDropdownComponent } from '@angular-react/fabric';
// import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import {
    ICalendarStrings,
    IContextualMenuProps,
    ISelection,
    Selection,
    DropdownMenuItemType,
    IDropdownOption,
    ICheckboxProps,
    IPersonaProps,
    IPeoplePickerProps,
    IIconProps
} from 'office-ui-fabric-react';
// import { FabPeoplePickerComponent } from '@angular-react/fabric/public-api';
import { from } from 'rxjs';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    logEvent(...args: any[]) {
        console.log(args);
    }
    iconProps: ISearchBoxProps['iconProps'] = {iconName: 'Filter'};
    resourceName: string;
    categories: Category[];
    searchValue = '';
    searchBoxFocus: boolean;
    searchLogTimout: any;
    event: any;
    subscriptionId: string;
    searchResultCount: number;
    homePageText: HomePageText;
    searchPlaceHolder: string;
    get inputAriaLabel(): string {
        return this.searchValue !== '' ?
            `${this.searchResultCount} Result` + (this.searchResultCount !== 1 ? 's' : '') :
            '';
    }

    constructor(private _resourceService: ResourceService, private _categoryService: CategoryService, private _notificationService: NotificationService, private _router: Router,
        private _detectorControlService: DetectorControlService, private _featureService: FeatureService, private _logger: LoggingV2Service, private _authService: AuthService,
        private _navigator: FeatureNavigationService, private _activatedRoute: ActivatedRoute, private armService: ArmService, private logService: TelemetryService, private kustologgingService: PortalKustoTelemetryService, private _diagnosticService: DiagnosticService) {

        if (_resourceService.armResourceConfig && _resourceService.armResourceConfig.homePageText
            && _resourceService.armResourceConfig.homePageText.title && _resourceService.armResourceConfig.homePageText.title.length > 1
            && _resourceService.armResourceConfig.homePageText.description && _resourceService.armResourceConfig.homePageText.description.length > 1
            && _resourceService.armResourceConfig.homePageText.searchBarPlaceHolder && _resourceService.armResourceConfig.homePageText.searchBarPlaceHolder.length > 1) {
            this.homePageText = _resourceService.armResourceConfig.homePageText;
            this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
        }
        else {
            this.homePageText = {
                title: 'App Service Diagnostics',
                description: 'App Service Diagnostics to investigate how your app is performing, diagnose issues, and discover how to\
         improve your application. Select the problem category that best matches the information or tool that you\'re\
         interested in:',
                searchBarPlaceHolder: 'Search App Service Diagnostics'
            };
        }


        if (_resourceService.armResourceConfig) {
            this._categoryService.initCategoriesForArmResource(_resourceService.resource.id);
        }

        this._categoryService.categories.subscribe(categories => this.categories = categories);


        this._authService.getStartupInfo().subscribe(startupInfo => {
            if (startupInfo.additionalParameters && Object.keys(startupInfo.additionalParameters).length > 0) {
                let path = 'resource' + startupInfo.resourceId.toLowerCase();
                path = this._updateRouteBasedOnAdditionalParameters(path, startupInfo.additionalParameters);
                if (path) {
                    this._router.navigateByUrl(path);
                }
            }
        });
        this.subscriptionId = this._activatedRoute.snapshot.params['subscriptionid'];
    }

    ngOnInit() {
        this.resourceName = this._resourceService.resource.name;

        if (!this._detectorControlService.startTime) {
            this._detectorControlService.setDefault();
        }

        this.logService.logEvent("telemetry service logging", {});
        this.kustologgingService.logEvent("kusto telemetry service logging", {});


        initializeIcons('https://static2.sharepointonline.com/files/fabric/assets/icons/');
        
    };

    onSearchBoxFocus(event: any): void {
        this.searchBoxFocus = true;
    }

    clearSearch() {
        this.searchBoxFocus = false;
        this.searchValue = '';
        this.searchResultCount = 0;
    }

    updateSearchValue(searchValue) {
        this.searchValue = searchValue.newValue;

        if (this.searchLogTimout) {
            clearTimeout(this.searchLogTimout);
        }

        this.searchLogTimout = setTimeout(() => {
            this._logSearch();
        }, 5000);
    }

    onResultCount(count: number) {
        this.searchResultCount = count;
    }

    // onSearchLostFocus() {
    //     if (this.searchValue === '') {
    //         this.searchResultCount = 0;
    //     }
    // }

    // onFocusClear() {
    //     if (this.searchValue === '') {
    //         this.clearSearch();
    //     }
    // }

    private _updateRouteBasedOnAdditionalParameters(route: string, additionalParameters: any): string {
        if (additionalParameters.featurePath) {
            let featurePath: string = additionalParameters.featurePath;
            featurePath = featurePath.startsWith('/') ? featurePath.replace('/', '') : featurePath;

            return `${route}/${featurePath}`;
        }

        return null;
    }


    private _logSearch() {
        this._logger.LogSearch(this.searchValue);
    }
}
