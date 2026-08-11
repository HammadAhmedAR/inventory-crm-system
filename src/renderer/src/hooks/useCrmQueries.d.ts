/** Fetch all follow-up tasks */
export declare function useDailyTasks(): import("@tanstack/react-query").UseQueryResult<any, Error>;
/** Log a new walk-in prospect details */
export declare function useQuickLogLead(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    fullName: string;
    phone: string;
    chassisNumber?: string;
    quotedPrice?: number;
    customerRemark?: string;
    actionTag?: string;
    dueDate?: string;
}, unknown>;
/** Complete an active task */
export declare function useCompleteTask(): import("@tanstack/react-query").UseMutationResult<any, Error, string, unknown>;
/** Fetch customer profile timeline logs */
export declare function useCustomerTimeline(customerId: string | null): import("@tanstack/react-query").UseQueryResult<any, Error>;
/** Fetch all available inventory vehicles */
export declare function useAvailableVehicles(): import("@tanstack/react-query").UseQueryResult<any, Error>;
/** Add a custom interaction remark to active customer timeline */
export declare function useAddRemark(): import("@tanstack/react-query").UseMutationResult<any, Error, {
    customerId: string;
    remark: string;
    actionTag: string;
}, unknown>;
