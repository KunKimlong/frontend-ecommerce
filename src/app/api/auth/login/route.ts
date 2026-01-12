// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        if (!username || !password) {
            return NextResponse.json(
                { message: "Username and password are required" },
                { status: 400 }
            );
        }

        const springBootUrl = process.env.SPRING_BOOT_API_URL || "http://localhost:168/api";

        console.log('🔐 Attempting login to:', `${springBootUrl}/auth/login`);

        const response = await fetch(`${springBootUrl}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        console.log('📡 Backend response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
            console.error('❌ Login failed:', errorData);
            return NextResponse.json(
                { success: false, message: errorData.message || "Login failed" },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('✅ Login response:', { ...data, accessToken: data.accessToken ? '***' : undefined });

        // ✅ Extract token (check different possible field names)
        const token = data.accessToken || data.access_token || data.token || data.jwt;

        if (!token) {
            console.error('❌ No token in response:', Object.keys(data));
            return NextResponse.json(
                { success: false, message: "No token received from server" },
                { status: 500 }
            );
        }

        // Create response
        const res = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                user: data.user || data.username,
            },
            { status: 200 }
        );

        // ✅ Set cookie
        res.cookies.set("authToken", token, {
            httpOnly: false,
            secure: false,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7  // 7 days
        });

        console.log('🍪 Cookie set: authToken');

        // Set refresh token if available
        const refreshToken = data.refreshToken || data.refresh_token;
        if (refreshToken) {
            res.cookies.set("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 30  // 30 days
            });
            console.log('🍪 Cookie set: refreshToken');
        }

        return res;
    } catch (error) {
        console.error("❌ Login API error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}