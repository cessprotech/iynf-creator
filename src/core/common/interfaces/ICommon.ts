export interface MSResponse {
    status: boolean;
    data: Record<string, any> | null;
    error: string | null
}