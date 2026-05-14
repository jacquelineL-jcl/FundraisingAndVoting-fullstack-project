import React, { useState } from "react";
import { matchPath, useNavigate } from "react-router-dom";
import { ethers, Interface } from "ethers";
import { useAccount } from "wagmi";
import { useEffect } from "react";

// Import both contract artifacts
import VotingArtifact from "../Voting-user.json";

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
  List, ListItem
} from "@mui/material";

import { useParams } from "react-router-dom";
import { experimental_streamedQuery } from "@tanstack/react-query";

const iface = new Interface(VotingArtifact.abi);

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

function VotingUI() {
  const {votingAddress} = useParams();
  const navigate = useNavigate();
  const {isConnected} = useAccount();

  // wallet connection
  useEffect(() => {
    if (!isConnected){
      navigate("/");
    }
  }, [isConnected, navigate]);

  const [deadline, setDeadline] = useState("");
  const [candidates, setCandidates] = useState([]);
  const [voteCount, setVoteCount] = useState("");
  const [winner, setWinner] = useState("");

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  const [loading, setLoading] = useState(false);

  const [remainingTime, setRemainingTime] = useState("");

  const [selectedCandidate, setSelectedCandidate] = useState(null);

  
    async function fetchContractData() {
        const provider = new ethers.BrowserProvider(window.ethereum);

        const contract = new ethers.Contract(
          votingAddress,
          VotingArtifact.abi,
          provider
        );

        const end = await contract.endTime();
        setDeadline(new Date(Number(end) * 1000).toLocaleString());

        const count = await contract.getCandidateLength();
        const list = [];
        for (let i = 0; i < count; i++) {
          const name = await contract.candidates(i);
          const votes = await contract.getVoteCount(i);
          list.push({ name, votes: Number(votes) });
        }
        setCandidates(list);
    }

  useEffect(() => {
    fetchContractData();
  }, [votingAddress]);

  const handleVoting = async(voteTo) =>{
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
      votingAddress,
      VotingArtifact.abi,
      signer
    );

    const tx = await contract.vote(voteTo);
    await tx.wait();

    await fetchContractData();

    setSnackbarMessage("Voting successful!");
    setShowSnackbar(true);
  }catch (err){
    let message = "Voting failed";
    if (err.data) {
      try {
        const decoded = iface.parseError(err.data);
        message = decoded.name; // e.g. "GoalWasNotMet"
      } catch {}
    } else {
      message = err.reason || err.message || message;
    }
    setSnackbarMessage(`Voting Failed: ${message}`);
    setShowSnackbar(true);
    }
  }

  const getWinner = async() => {
    try{
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
      votingAddress,
      VotingArtifact.abi,
      signer
    );

    const newWinner = await contract.getWinner();
    setWinner(newWinner);

    setSnackbarMessage(`Winner is: ${newWinner}`);
    setShowSnackbar(true);
    }catch (err){
    let message = "Winner Election failed";
    if (err.data) {
      try {
        const decoded = iface.parseError(err.data);
        message = decoded.name; // e.g. "GoalWasNotMet"
      } catch {}
    } else {
      message = err.reason || err.message || message;
    }
    setSnackbarMessage(`Winner Election Failed: ${message}`);
    setShowSnackbar(true);
    }
  }

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
      votingAddress,
      VotingArtifact.abi,
      provider
    );

    const deadlineBN = await contract.endTime();
    const deadline = Number(deadlineBN); // ensure it's safe

    interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = deadline - now;

      if (diff <= 0) {
        setRemainingTime("Expired");
        clearInterval(interval);
      } else {
        setRemainingTime(formatRemaining(diff));
      }
    }, 1000);
  }

  startCountdown();

  return () => clearInterval(interval);
  }, [votingAddress]);


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

    {/* Content */}
    <Card sx={{ width: "fit-content", p: 3 }}>
      <CardContent>
        <Typography variant="h4"
          sx={{fontWeight: "bold"}}
        >
          Voting
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          {votingAddress}
        </Typography>

        <Typography >
          Time remaining: {remainingTime}
        </Typography>

                <Stack spacing={2} sx={{ mt: 3 }}>
                  
                  <List>
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="center"
                      spacing={2}
                      sx={{ mt: 3 }}
                    >
                      {candidates.map((c, idx) => (
                        <Typography
                          key={c.address || c.name || idx}
                          variant="h6"
                          sx={{ fontWeight: "bold" }}
                        >
                          {c.name}: {c.votes}
                        </Typography>
                      ))}
                    </Stack>
                  </List>

                      <List>
                        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                          {candidates.map((c, idx) => (
                            <ListItem
                              key={c.address || c.name || idx}
                              sx={{ display: "flex", alignItems: "center",}}
                            >
                              <Button
                                variant="outlined"
                                onClick={() => setSelectedCandidate(idx)}
                                
                                sx={{ 
                                  flexGrow: 1,
                                  background: selectedCandidate === idx
                                    ? "rgba(255, 255, 255, 0.47)" // highlight when selected
                                    : "rgba(56, 204, 230, 0.62)",
                                  "&:hover": {
                                      background: selectedCandidate === idx
                                        ? "rgba(150,150,150,0.9)" // darker grey hover when selected
                                        : "rgba(64, 213, 240, 0.81)", // brighter blue hover when not selected
                                    },
                                }}
                              >
                                {c.name}
                              </Button>
                            </ListItem>
                          ))}
                        </Stack>
                      </List>

                  <Button
                    variant="contained"
                    color="primary"
                    disabled={selectedCandidate === null}
                    onClick={() => handleVoting(selectedCandidate)}
                    sx={{ display: "flex", justifyContent: "center", mt: 2, 
                      background: "rgba(56, 230, 94, 0.62)",
                      "&:hover": {
                      background: "rgba(56, 230, 94, 0.77)",
                      },
                    }}
                  >
                    Confirm Vote
                  </Button>
                  
                  <Button
                    variant="outlined"
                    onClick={getWinner}
                    sx={{
                      background: "rgba(230, 218, 56, 0.62)",
                      color: "#fff",
                      "&:hover": {
                      background: "rgba(253, 242, 93, 0.75)",
                      },
                    }}
                  >
                    <Typography>Get Winner</Typography>
                  </Button>
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
      <VotingUI />
    </ThemeProvider>
  );
}