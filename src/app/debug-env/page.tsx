export const dynamic = 'force-dynamic';

export default function DebugEnvPage() {
    const clientId = process.env.GOOGLE_CLIENT_ID || "NOT_SET";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "NOT_SET";
    const nextAuthUrl = process.env.NEXTAUTH_URL || "NOT_SET";

    // Masking for safety
    const maskedId = clientId.length > 10 ? `${clientId.substring(0, 15)}...${clientId.substring(clientId.length - 5)}` : clientId;
    const maskedSecret = clientSecret === "NOT_SET" ? "MISSING" : `Present (Length: ${clientSecret.length})`;

    return (
        <div className="p-10 font-mono text-sm">
            <h1 className="text-2xl font-bold mb-4">Environment Debugger</h1>
            <div className="space-y-2 border p-4 rounded bg-gray-50">
                <p><strong>NODE_ENV:</strong> {process.env.NODE_ENV}</p>
                <p><strong>NEXTAUTH_URL:</strong> {nextAuthUrl}</p>
                <p><strong>GOOGLE_CLIENT_ID:</strong> {maskedId} (Length: {clientId.length})</p>
                <p><strong>GOOGLE_CLIENT_SECRET:</strong> {maskedSecret}</p>
            </div>
            <p className="mt-4 text-red-500 font-bold">
                請截圖此頁面傳給我，確認後請立即刪除此頁面。
            </p>
        </div>
    );
}
