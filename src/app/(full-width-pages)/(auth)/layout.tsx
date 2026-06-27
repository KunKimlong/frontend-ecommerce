import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";

async function getStoreInfo() {
  try {
    const baseUrl = process.env.SPRING_BOOT_API_URL || "http://localhost:168/api";
    const res = await fetch(`${baseUrl}/store/info`, { next: { revalidate: 60 } });
    if (res.ok) return res.json();
  } catch {}
  return { name: null, description: null, logoPath: null };
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const store = await getStoreInfo();
  const logoUrl = store.logoPath
    ? `${process.env.BACKEND_URL || "http://localhost:168"}${store.logoPath}`
    : null;

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <ThemeProvider>
        <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col dark:bg-gray-900 sm:p-0">
          {children}
          <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
            <div className="relative items-center justify-center flex z-1">
              <GridShape />
              <div className="flex flex-col items-center max-w-xs">
                <Link href="/" className="block mb-4">
                  {logoUrl ? (
                    <Image
                      width={231}
                      height={48}
                      src={logoUrl}
                      alt={store.name || "Logo"}
                      unoptimized
                    />
                  ) : (
                    <Image
                      width={231}
                      height={48}
                      src="./images/logo/auth-logo.svg"
                      alt="Logo"
                    />
                  )}
                </Link>
                {store.description ? (
                  <p className="text-center text-gray-400 dark:text-white/60">
                    {store.description}
                  </p>
                ) : (
                  <p className="text-center text-gray-400 dark:text-white/60">
                    Free and Open-Source Tailwind CSS Admin Dashboard Template
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
            <ThemeTogglerTwo />
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
