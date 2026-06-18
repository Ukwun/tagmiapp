import { AdminDashboardService } from "./admin-dashboard.service";
export declare class AdminDashboardController {
    private readonly dashboardService;
    constructor(dashboardService: AdminDashboardService);
    getDashboard(): Promise<any>;
    getFeedPerformance(): Promise<any>;
}
