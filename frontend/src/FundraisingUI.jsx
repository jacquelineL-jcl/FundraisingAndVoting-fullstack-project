import React, { useState } from "react";
import { matchPath, useNavigate } from "react-router-dom";
import { ethers, Interface } from "ethers";
import { useAccount } from "wagmi";
import { useEffect } from "react";

// Import both contract artifacts
import FundraisingArtifact from "../Fundraiser-user.json";

// MUI imports
import { createTheme, ThemeProvider } from "@mui/material/styles";
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
  FormControl, InputLabel, Select, MenuItem,
  LinearProgress
} from "@mui/material";

import { useParams } from "react-router-dom";
import { experimental_streamedQuery } from "@tanstack/react-query";

const iface = new Interface(FundraisingArtifact.abi);

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
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.66)",
            transform: "scale(1.05)",
          },
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
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 16,
            "&:hover fieldset": {
              borderColor: "rgb(255, 255, 255)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#1f78c2", // focus border black
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          "& fieldset": {
            borderColor: "rgba(255, 255, 255, 0.48)",
          },
          "&:hover fieldset": {
            borderColor: "rgb(255, 255, 255)",
          },
          "&.Mui-focused fieldset": {
            borderColor: "#1b84ca", 
          },
        },
        input: {
          color: "#000000", // default input text color (for TextFields)
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.47)",
          border: "1px solid rgba(255, 255, 255, 0.48)",
          boxShadow: "0 8px 32px rgba(255, 255, 255, 0.34)",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          background: "rgba(255,255,255,0.25)",
          backdropFilter: "blur(8px)",
          color: "#000000", // chosen value text black
          "& .MuiSelect-icon": {
            color: "#000000", // dropdown arrow
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          background: "rgba(255, 255, 255, 0.85)", // white glass dropdown
          backdropFilter: "blur(12px)",
          color: "#000000", // dropdown text black
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: "#000000", // option text black
          "&.Mui-selected": {
            backgroundColor: "rgba(0,162,255,0.15)",
            color: "#000000", // keep selected text black
          },
          "&:hover": {
            backgroundColor: "rgba(0,162,255,0.2)",
            color: "#000000", // hover text black
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#000000", // label black
          "&.Mui-focused": {
            color: "#000000", // label stays black on focus
          },
        },
      },
    },
  },
  typography: {
    fontFamily: "Poppins, monospace",
  },
  palette: {
    text: { primary: "#ffffff" },
  },
});

function FundraisingUI(){
  const { fundraisingAddress } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useAccount();   // RainbowKit/wagmi hook
  
  // redirect if wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      navigate("/"); // back to App.jsx
    }
  }, [isConnected, navigate]);

  const [goalAmount, setGoalAmount] = useState("");
  const [deadline, setDeadline] = useState("");
  const [currentFunds, setCurrentFunds] = useState("");
  const [status, setStatus] = useState("");

  const [deposit, setDeposit] = useState("");

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [loading, setLoading] = useState(false);

  const [remainingTime, setRemainingTime] = useState("");

  
    async function fetchContractData() {
      try {
        // connect to Ethereum provider (Metamask)
        const provider = new ethers.BrowserProvider(window.ethereum);

        // create contract instance (read-only)
        const contract = new ethers.Contract(
          fundraisingAddress,
          FundraisingArtifact.abi,
          provider
        );

        // read values from contract
        const goal = await contract.fundingGoal();
        const end = await contract.deadline();
        const funds = await contract.totalRaised();
        const state = await contract.status();

        // update state
        setGoalAmount(parseFloat(ethers.formatEther(goal)));
        setDeadline(new Date(Number(end) * 1000).toLocaleString());
        setCurrentFunds(parseFloat(ethers.formatEther(funds)));
        const statusMap = {
        0: "active",
        1: "successful",
        2: "failed"
        };

      setStatus(statusMap[Number(state)]);
      } catch (err) {
        console.error("Error reading contract:", err);
      }
    }
  
  useEffect(() => {
    fetchContractData();
  }, [fundraisingAddress]);

  const handleDeposit = async() =>{
  try{
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      fundraisingAddress,
      FundraisingArtifact.abi,
      signer
    );

    const tx = await contract.deposit({
      value: ethers.parseEther(deposit)
    });

    await tx.wait();

    await fetchContractData();

    setSnackbarMessage("Deposit successful!");
    setShowSnackbar(true);
  }catch(err){
    let message = "Refund failed";
    if (err.data) {
      try {
        const decoded = iface.parseError(err.data);
        message = decoded.name; // e.g. "GoalWasNotMet"
      } catch {}
    } else {
      message = err.reason || err.message || message;
    }
    setSnackbarMessage(`Transaction Failed: ${message}`);
    setShowSnackbar(true);
  }
};

const handleRefund = async() =>{
  try{
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      fundraisingAddress,
      FundraisingArtifact.abi,
      signer
    );

    const tx = await contract.refund();
    await tx.wait();
    setSnackbarMessage("Refund successful!");
    setShowSnackbar(true);
  } catch(err) {
    let message = "Refund failed";
    if (err.data) {
      try {
        const decoded = iface.parseError(err.data);
        message = decoded.name; // e.g. "GoalWasNotMet"
      } catch {}
    } else {
      message = err.reason || err.message || message;
    }
    setSnackbarMessage(`Refund Failed: ${message}`);
    setShowSnackbar(true);
  }
};

  const getStatus = async() =>{
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
      fundraisingAddress,
      FundraisingArtifact.abi,
      signer
    );

      const newStatus = await contract.checkStatus();
      
      const statusMap = {
        0: "active",
        1: "successful",
        2: "failed"
        };
      
      setStatus(statusMap[Number(newStatus)]);

      setSnackbarMessage(`Status Refreshed: ${statusMap[Number(newStatus)]}`);
      setShowSnackbar(true);
    }catch(err){
      let message = "Refund failed";
    if (err.data) {
      try {
        const decoded = iface.parseError(err.data);
        message = decoded.name; // e.g. "GoalWasNotMet"
      } catch {}
    } else {
      message = err.reason || err.message || message;
    }
    setSnackbarMessage(`Get Status Failed: ${message}`);
    setShowSnackbar(true);
    }
  }

  const percentage = Math.min((currentFunds / goalAmount) * 100, 100);

  function formatRemaining(seconds) {
    if (seconds <= 0) return "Expired";
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  }

  useEffect(() => {
    let interval;

    async function startCountdown() {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        fundraisingAddress,
        FundraisingArtifact.abi,
        provider
      );

      const deadlineBN = await contract.deadline();
      const deadline = Number(deadlineBN);

      interval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const diff = deadline - now;
        setRemainingTime(formatRemaining(diff));
      }, 1000);
    }

    startCountdown();
    return () => clearInterval(interval);
  }, [fundraisingAddress]);

  
  return (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(35deg, #0f2027, #203a43, #2c5364)", // gradient background
      p: 3,
    }}
  >
  {/* Snackbar */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={4000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setShowSnackbar(false)} severity="info">
            {snackbarMessage}
          </Alert>
        </Snackbar>
  {/* Box */}
    <Card sx={{ width: "fit-content", p: 3 }}>
      <CardContent>
        <Typography variant="h4"
          sx={{fontWeight: "bold"}}
        >
          Fundraiser
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {fundraisingAddress}
        </Typography>

        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 10,
            borderRadius: 5,
            "& .MuiLinearProgress-bar": {
              backgroundColor: "rgba(253, 242, 93, 0.85)", // custom bar color
            },
            backgroundColor: "rgba(255,255,255,0.2)", // track color
          }}
        />
        <Box sx={{background: "none"}}>
        <Typography sx={{ mt: 1 }}>
          {currentFunds} / {goalAmount} ETH
        </Typography>

        <Typography >
          Time remaining: {remainingTime}
        </Typography>
        </Box>

        <Stack spacing={2} sx={{ mt: 3 }}>
          <TextField
            fullWidth
            label="Deposit Amount (ETH)"
            value={deposit}
            onChange={(e) => setDeposit(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleDeposit}
            sx={{
              background: "rgba(64, 228, 58, 0.62)",
              "&:hover": {
              background: "rgba(64, 228, 58, 0.82)",
              },
            }}
          >
            <Typography>Deposit</Typography>
          </Button>
          <Button
            variant="outlined"
            onClick={handleRefund}
            sx={{
              background: "rgba(238, 63, 63, 0.75)",
              color: "#fff",
              "&:hover": {
              background: "rgba(255, 55, 55, 0.84)",
              },
            }}
          >
            <Typography>Refund</Typography>
          </Button>
          <Button
            variant="outlined"
            onClick={getStatus}
            sx={{
              background: "rgba(230, 218, 56, 0.62)",
              color: "#fff",
              "&:hover": {
              background: "rgba(253, 242, 93, 0.75)",
              },
            }}
          >
            <Typography>Refresh Status</Typography>
          </Button>

          <typography align="center" gutterBottom>
            Contract status: {status}
          </typography>
        </Stack>
      </CardContent>
    </Card>
  </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FundraisingUI />
    </ThemeProvider>
  );
}