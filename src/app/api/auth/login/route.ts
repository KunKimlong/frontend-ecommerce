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

        const springBootUrl =
            process.env.SPRING_BOOT_API_URL || "http://localhost:168";

        const response = await fetch(`${springBootUrl}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.message || "Login failed" },
                { status: response.status }
            );
        }

        // ---- create the response JSON
        const res = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                user: data.user,
            },
            { status: 200 }
        );

        // ---- SET COOKIES HERE (correct way)
        res.cookies.set("token", data.accessToken, {
            httpOnly: false,     // allow js-cookie to read
            secure: false,       // must be false in localhost
            sameSite: "lax",
            path: "/",
        });

        if (data.refresh_token) {
            res.cookies.set("refreshToken", data.refresh_token, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                path: "/",
            });
        }

        return res;
    } catch (error) {
        console.error("Login API error:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
