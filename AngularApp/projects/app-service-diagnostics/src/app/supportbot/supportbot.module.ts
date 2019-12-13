import { NgModule, ModuleWithProviders } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { AvailabilityModule } from '../availability/availability.module';
import { SolutionsModule } from '../solutions/solutions.module';

import { StartupMessages } from './message-flow/startup/startupmessages';
import { MainMenuMessageFlow } from './message-flow/main-menu/mainmenumessageflow';
import { HealthCheckMessageFlow } from './message-flow/health-check/healthcheckmessageflow';
import { FeedbackMessageFlow } from './message-flow/feedback/feedbackmessageflow';
import { MessageProcessor } from './message-processor.service';

import { HomepageComponent } from './homepage/homepage.component';
import { SupportBotComponent } from './support-bot.component';
import { DynamicComponent } from './dynamic-component/dynamic.component';
import { TextMessageComponent } from './common/text-message/text-message.component';
import { ButtonMessageComponent } from './common/button-message/button-message.component';
import { LoadingMessageComponent } from './common/loading-message/loading-message.component';
import { MainMenuComponent } from './message-flow/main-menu/main-menu.component';
import { HealthCheckComponent } from './message-flow/health-check/health-check.component';
import { TalkToAgentMessageComponent } from './message-flow/talk-to-agent/talk-to-agent-message.component';
import { FeedbackComponent } from './message-flow/feedback/feedback.component';
import { SolutionsMessageComponent } from './common/solutions-message/solutions-message.component';
import { GraphMessageComponent } from './common/graph-message/graph-message.component';
import { CpuAnalysisChatFlow } from './message-flow/cpu-analysis-chat/cpu-analysis-chat-flow';
import { ProblemStatementMessageComponent } from './common/problem-statement-message/problem-statement-message.component';

import { AppInsightsSettingsComponent } from '../availability/app-insights/app-insights-settings.component';
import { CategoryMenuComponent } from './message-flow/category-menu/category-menu.component';
import { DetectorSummaryComponent } from './message-flow/detector-summary/detector-summary.component';
import { DocumentSearchComponent } from './message-flow/document-search/document-search.component';
import { DocumentSearchResultsComponent } from './message-flow/document-search-results/document-search-results.component';
import { SharedV2Module } from '../shared-v2/shared-v2.module';
import { DiagnosticDataModule } from 'diagnostic-data';
import { GenericCategoryFlow } from './message-flow/v2-flows/generic-category.flow';
import { GenieChatFlow } from './message-flow/v2-flows/genie-chat.flow';
import { AvailabilityPerformanceFlow } from './message-flow/v2-flows/availability-performance.flow';
import { HealthCheckV3Component } from './message-flow/health-check-v3/health-check-v3.component';
import { FabIconModule,FabChoiceGroupModule } from '@angular-react/fabric';
import { SummaryCardComponent } from './message-flow/summary-card/summary-card.component';
import { DynamicAnalysisComponent } from './message-flow/dynamic-analysis/dynamic-analysis.component';

@NgModule({
    declarations: [
        HomepageComponent,
        SupportBotComponent,
        DynamicComponent,
        TextMessageComponent,
        LoadingMessageComponent,
        MainMenuComponent,
        ButtonMessageComponent,
        HealthCheckComponent,
        TalkToAgentMessageComponent,
        FeedbackComponent,
        SolutionsMessageComponent,
        GraphMessageComponent,
        ProblemStatementMessageComponent,
        CategoryMenuComponent,
        DetectorSummaryComponent,
        DocumentSearchComponent,
        DocumentSearchResultsComponent,
        HealthCheckV3Component,
        SummaryCardComponent,
        DynamicAnalysisComponent

    ],
    imports: [
        SharedModule,
        AvailabilityModule,
        SolutionsModule,
        SharedV2Module,
        DiagnosticDataModule,
        FabIconModule,
        FabChoiceGroupModule,
    ],
    exports: [
        HomepageComponent,
        SupportBotComponent,
        CategoryMenuComponent,
        DetectorSummaryComponent,
        HealthCheckV3Component,
        DynamicComponent
    ],
    providers: [
        StartupMessages,
        MainMenuMessageFlow,
        HealthCheckMessageFlow,
        FeedbackMessageFlow,
        CpuAnalysisChatFlow,
        MessageProcessor,
        AvailabilityPerformanceFlow,
        GenericCategoryFlow,
        GenieChatFlow
    ]
})
export class SupportBotModule {
}
