// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logged out successfully" },
            { status: 200 }
        );

        // Clear authToken cookie
        response.cookies.set("authToken", "", {
            path: "/",
            expires: new Date(0),
        });

        // Clear refreshToken cookie
        response.cookies.set("refreshToken", "", {
            path: "/",
            httpOnly: true,
            expires: new Date(0),
        });

        console.log('🍪 Cookies cleared: authToken, refreshToken');

        return response;
    } catch (error) {
        console.error("Logout API error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
