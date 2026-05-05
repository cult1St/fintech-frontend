"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/auth-context";
import { ThemeProvider } from "@/context/theme-context";
import { WalletProvider } from "@/context/wallet-context";
import { NotificationsProvider } from "@/context/notifications-context";

const queryClient = new QueryClient();

const Providers = ({ children }: {children: React.ReactNode}) => {
    return(
        <ThemeProvider>
            <QueryClientProvider client={queryClient} >
                <AuthProvider>
                    <WalletProvider>
                        <NotificationsProvider>
                            {children}
                        </NotificationsProvider>
                    </WalletProvider>
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    )
}

export default Providers;
