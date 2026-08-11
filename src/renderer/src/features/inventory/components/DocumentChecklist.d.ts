import React from "react";
interface DocumentChecklistProps {
    open: boolean;
    selectedChassis: {
        chassisNumber: string;
        keysCount: number;
        documentsPresent: boolean;
    } | null;
    onClose: () => void;
    onSave: (payload: {
        chassisNumber: string;
        keysCount: number;
        documentsPresent: boolean;
    }) => Promise<void> | void;
}
declare const DocumentChecklist: React.FC<DocumentChecklistProps>;
export default DocumentChecklist;
