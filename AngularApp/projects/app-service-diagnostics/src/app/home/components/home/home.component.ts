import { DetectorControlService, FeatureNavigationService } from 'diagnostic-data';
import { HttpResponse } from '@angular/common/http';
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
import { PortalKustoTelemetryService } from '../../../shared/services/portal-kusto-telemetry.service';
import { WebSitesService } from '../../../resources/web-sites/services/web-sites.service';
import { AppType } from '../../../shared/models/portal';
import { SubscriptionPropertiesService} from '../../../shared/services/subscription-properties.service';
@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

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
  providerRegisterUrl: string;
  get inputAriaLabel(): string {
    return this.searchValue !== '' ?
      `${this.searchResultCount} Result` + (this.searchResultCount !== 1 ? 's' : '') :
      '';
  }

  constructor(private _resourceService: ResourceService, private _categoryService: CategoryService, private _notificationService: NotificationService, private _router: Router,
    private _detectorControlService: DetectorControlService, private _featureService: FeatureService, private _logger: LoggingV2Service, private _authService: AuthService,
    private _navigator: FeatureNavigationService, private _activatedRoute: ActivatedRoute, private armService: ArmService,private loggingService:PortalKustoTelemetryService,
    private subscriptionPropertiesService: SubscriptionPropertiesService) {

    if (_resourceService.armResourceConfig && _resourceService.armResourceConfig.homePageText
      && _resourceService.armResourceConfig.homePageText.title && _resourceService.armResourceConfig.homePageText.title.length > 1
      && _resourceService.armResourceConfig.homePageText.description && _resourceService.armResourceConfig.homePageText.description.length > 1
      && _resourceService.armResourceConfig.homePageText.searchBarPlaceHolder && _resourceService.armResourceConfig.homePageText.searchBarPlaceHolder.length > 1) {
      this.homePageText = _resourceService.armResourceConfig.homePageText;
      this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
    }
    else {
      if(this._resourceService.resource.type === 'Microsoft.Web/hostingEnvironments') {
        this.homePageText = {
          title:'App Service Environment Diagnostics',
          description: 'Use App Service Environment Diagnostics to investigate how your App Service Environment is performing, diagnose issues, and discover how to\
          improve the availability of your App Service Environment. Select the problem category that best matches the information or tool that you\'re\
          interested in:',
          searchBarPlaceHolder: 'Search App Service Environment Diagnostics'
        };
        this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
      }
      else {
        if(this._resourceService && this._resourceService instanceof WebSitesService && (this._resourceService as WebSitesService).appType === AppType.FunctionApp) {
          this.homePageText = {
            title:'Azure Functions Diagnostics',
            description: 'Use Azure Functions Diagnostics to investigate how your function app is performing, diagnose issues, and discover how to\
            improve your function app. Select the problem category that best matches the information or tool that you\'re\
            interested in:',
            searchBarPlaceHolder: 'Search Azure Functions Diagnostics'
          };
          this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
        }
        else {
          this.homePageText = {
            title:'App Service Diagnostics',
            description: 'Use App Service Diagnostics to investigate how your app is performing, diagnose issues, and discover how to\
            improve your application. Select the problem category that best matches the information or tool that you\'re\
            interested in:',
            searchBarPlaceHolder: 'Search App Service Diagnostics'
          };
          this.searchPlaceHolder = this.homePageText.searchBarPlaceHolder;
        }
      }
    }

    if (this.isAKSOnNationalCloud){
        
      this.homePageText = {
        title:'Azure Kubernetes Service Diagnostics',
        description: 'Explore ways to diagnose and troubleshoot the common problems of your cluster from CRUD operations to connection problems. Click on any of the documents below to start troubleshooting.',
        searchBarPlaceHolder: 'Search a keyword that best describes your issue'
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
    this.providerRegisterUrl = `/subscriptions/${this.subscriptionId}/providers/Microsoft.ChangeAnalysis/register`;
    if (!this._detectorControlService.startTime) {
      this._detectorControlService.setDefault();
    }
    let locationPlacementId =  '';
    this.subscriptionPropertiesService.getSubscriptionProperties(this.subscriptionId).subscribe((response : HttpResponse<{}>) => {
        let subscriptionProperties = response.body['subscriptionPolicies'];
        if(subscriptionProperties) {
            locationPlacementId = subscriptionProperties['locationPlacementId'];
            let eventProps = {
                subscriptionId: this.subscriptionId,
                subscriptionLocationPlacementId: locationPlacementId
            };
            this.loggingService.logEvent('SubscriptionProperties', eventProps);
        }
    });

    if(this._resourceService.resource.type === 'Microsoft.Web/sites') {
        if(locationPlacementId.toLowerCase() !== 'geos_2020-01-01') {
            // Register Change Analysis Resource Provider.
            this.armService.postResourceFullResponse(this.providerRegisterUrl, {}, true, '2018-05-01').subscribe((response: HttpResponse<{}>) => {
            let eventProps = {
                url: this.providerRegisterUrl
                };
                this.loggingService.logEvent("Change Analysis Resource Provider registered",eventProps);
            }, (error: any) => {
                this.logHTTPError(error, 'registerResourceProvider');
            });
        } else {
            this._categoryService.filterCategoriesForSub();
        }
    }
  }

  public get isAKSOnNationalCloud() : boolean {
    return this.armService.isNationalCloud 
    && this._resourceService.parseResourceUri(this._resourceService.resourceIdForRouting).provider.toLowerCase() == 'microsoft.containerservice';
  }

  onSearchBoxFocus(event: any): void {
    this.searchBoxFocus = true;
  }

  clearSearch() {
    this.searchBoxFocus = false;
    this.searchValue = '';
    this.searchResultCount = 0;
  }

  updateSearchValue(searchValue) {
    this.searchValue = searchValue;

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

  onSearchLostFocus() {
    if (this.searchValue === '') {
      this.searchResultCount = 0;
    }
  }

  onFocusClear() {
    if (this.searchValue === '') {
      this.clearSearch();
    }
  }

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

  private logHTTPError(error: any, methodName: string): void {
    let errorLoggingProps = {
        errorMsg: error.message ? error.message : 'Server Error',
        statusCode: error.status ? error.status : 500
    };
    this.loggingService.logTrace('HTTP error in ' + methodName, errorLoggingProps);
}
}

