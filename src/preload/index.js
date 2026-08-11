import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
// Expose the API to the renderer
const api = {
    crm: {
        getTasks: () => ipcRenderer.invoke("crm:getTasks"),
        quickLog: (data) => ipcRenderer.invoke("crm:quickLog", data),
        completeTask: (taskId) => ipcRenderer.invoke("crm:completeTask", taskId),
        getCustomerTimeline: (customerId) => ipcRenderer.invoke("crm:getCustomerTimeline", customerId),
        getAvailableVehicles: () => ipcRenderer.invoke("crm:getAvailableVehicles"),
        addRemark: (data) => ipcRenderer.invoke("crm:addRemark", data),
    },
    inventory: {
        getAll: (filters) => ipcRenderer.invoke("inventory:get-all", filters ?? {}),
        updateStatus: (data) => ipcRenderer.invoke("inventory:update-status", data),
        logRepair: (data) => ipcRenderer.invoke("inventory:log-repair", data),
        updateCustody: (data) => ipcRenderer.invoke("inventory:update-custody", data),
    },
    financials: {
        getTodaySummary: () => ipcRenderer.invoke("financials:getTodaySummary"),
    },
};
if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld("electron", electronAPI);
        contextBridge.exposeInMainWorld("api", api);
    }
    catch (error) {
        console.error(error);
    }
}
else {
    // @ts-ignore (define in d.ts)
    window.electron = electronAPI;
    // @ts-ignore (define in d.ts)
    window.api = api;
}
