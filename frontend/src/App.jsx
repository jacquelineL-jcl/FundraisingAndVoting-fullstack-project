// App.jsx
import React, { useEffect } from "react";

// RainbowKit + Wagmi imports
import "@rainbow-me/rainbowkit/styles.css";
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, useAccount } from "wagmi";
import { sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// React Router imports
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

// Local components
import Dashboard from "./Dashboard";
import FundraisingUI from "./FundraisingUI";
import VotingUI from "./VotingUI";

// MUI imports
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

// Wagmi + RainbowKit config
const config = getDefaultConfig({
  appName: "DApp Dashboard",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  chains: [sepolia],
});

const queryClient = new QueryClient();

// Custom MUI theme
const theme = createTheme({
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.47)",
          border: "1px solid rgba(255, 255, 255, 0.48)",
          boxShadow: "0 8px 32px rgba(255, 255, 255, 0.34)",
          color: "#fff",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.47)",
          border: "1px solid rgba(255, 255, 255, 0.48)",
          boxShadow: "0 8px 32px rgba(255, 255, 255, 0.34)",
          color: "#fff",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.47)",
          border: "1px solid rgba(255, 255, 255, 0.48)",
          boxShadow: "0 8px 32px rgba(255, 255, 255, 0.34)",
          color: "#fff",
        },
      },
    },
  },
  typography: {
    fontFamily: "Poppins, monospace",
  },
  palette: { text: { primary: "#ffffff" } },
});

function AppContent() {
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    if (isConnected) {
      navigate("/dashboard");
    }
  }, [isConnected, navigate]);

  if (!isConnected) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(35deg, #0f2027, #203a43, #2c5364)",
          p: 3,
        }}
      >
        <Card sx={{ maxWidth: 500, width: "100%" }}>
          <CardContent sx={{ p: 4 }}>
            <Typography
              variant="h4"
              align="center"
              gutterBottom
              sx={{ color: "text.primary", mb: 3 }}
            >
              DApp Dashboard
            </Typography>

            <Stack spacing={2} alignItems="stretch">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <Button
                    onClick={openConnectModal}
                    sx={{
                      width: "100%",
                      background: "rgba(0, 162, 255, 0.51)",
                      "&:hover": { background: "rgba(70, 218, 255, 0.66)" },
                    }}
                  >
                    Connect Wallet
                  </Button>
                )}
              </ConnectButton.Custom>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return null; // once connected, useEffect handles redirect
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider chains={[sepolia]} theme={lightTheme()}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppContent />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/fundraising/:fundraisingAddress" element={<FundraisingUI />} />
                <Route path="/voting/:votingAddress" element={<VotingUI />} />
              </Routes>
            </BrowserRouter>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}