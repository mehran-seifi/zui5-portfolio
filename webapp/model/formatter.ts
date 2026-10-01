export function orderStatusState(status?: string): string {
    switch (status) {
        case "Completed":
            return "Success";
        case "Open":
            return "Warning";
        case "In Progress":
            return "Information";
        default:
            return "None";
    }
}
