import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { useEffect } from "react";

// Import both contract artifacts
import FundraisingArtifact from "../Fundraiser.json";
import VotingArtifact from "../Voting.json";

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
  FormControl, InputLabel, Select, MenuItem 
} from "@mui/material";

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

function Dashboard() {
  const navigate = useNavigate();
  const { isConnected } = useAccount();   // RainbowKit/wagmi hook

  // redirect if wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      navigate("/"); // back to App.jsx
    }
  }, [isConnected, navigate]);

  const [showDeployPopup, setShowDeployPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [contractType, setContractType] = useState("fundraising");
  const [contractName, setContractName] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  // inside your Dashboard component state
  const [candidates, setCandidates] = useState([""]); // start with one empty field

  const [contracts, setContracts] = useState(() => {
  const saved = localStorage.getItem("contracts");
  return saved ? JSON.parse(saved) : [
      { address: import.meta.env.VITE_DEPLOYED_AT_FUNDRAISER, type: "fundraising", name: contractName },
      { address: import.meta.env.VITE_DEPLOYED_AT_VOTING, type: "voting", name: contractName },
    ];
  });
  useEffect(() => {
  localStorage.setItem("contracts", JSON.stringify(contracts));
  }, [contracts]);

  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showSnackbar, setShowSnackbar] = useState(false);

  // Suppose user picks "dd/mm/yy" and you parse it into a Date object
  const endDate = new Date(deadline); // careful with month indexing
  const now = Date.now();

  // duration in seconds = (endDate - now) / 1000
  const durationInSeconds = Math.floor((endDate.getTime() - now) / 1000);

  const handleSearch = () => {
    const found = contracts.find(
      (c) => c.address.toLowerCase() === searchQuery.toLowerCase()
    );
    setSearchResult(found || "none");
  };

  const handleContractClick = (contract) => {
    if (contract.type === "fundraising") {
      navigate(`/fundraising/${contract.address}`);
    } else if (contract.type === "voting") {
      navigate(`/voting/${contract.address}`);
    }
  };

  const handleDeploy = async (e) => {
  e.preventDefault();
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    if (contractType === "fundraising") {
      const factory = new ethers.Contract(
        import.meta.env.VITE_DEPLOYED_AT_FUNDRAISER,
        FundraisingArtifact.abi,
        signer
      );

      const durationInSeconds = Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);

      const tx = await factory.createFundraiser(
        ethers.parseEther(goalAmount),
        durationInSeconds
      );
      const receipt = await tx.wait();

      const event = receipt.logs
        .map(log => { try { return factory.interface.parseLog(log); } catch { return null; } })
        .find(e => e && e.name === "FundraiserCreated"); // check exact casing in your Solidity

      const addr = event?.args?.[0];
      setContracts(prev => [...prev, { address: addr, type: "fundraising", name: contractName }]);
      setSnackbarMessage(`Fundraiser deployed at ${addr}`);
      setShowSnackbar(true);
      setShowDeployPopup(false);
    }

    if (contractType === "voting") {
      const votingFactory = new ethers.Contract(
        import.meta.env.VITE_DEPLOYED_AT_VOTING,
        VotingArtifact.abi,
        signer
      );

      const durationInSeconds = Math.floor((new Date(deadline).getTime() - Date.now()) / 1000);

      const tx = await votingFactory.createVoting(candidates, durationInSeconds);
      const receipt = await tx.wait();

      const event = receipt.logs
        .map(log => { try { return votingFactory.interface.parseLog(log); } catch { return null; } })
        .find(e => e && e.name === "votingCreated");

      const addr = event?.args?.[0];
      setContracts(prev => [...prev, { address: addr, type: "voting", name: contractName }]);
      setSnackbarMessage(`Voting deployed at ${addr}`);
      setShowSnackbar(true);
      setShowDeployPopup(false);
    }

  } catch (err) {
    if (err.code === 4001 || err.code === "ACTION_REJECTED") {
    setSnackbarMessage("Transaction declined.");
  } else {
    setSnackbarMessage("Deployment failed: " + err.message);
  }
  setShowSnackbar(true);
  }
};

    // handler to update a candidate name
  const handleCandidateChange = (index, value) => {
    const updated = [...candidates];
    updated[index] = value;
    setCandidates(updated);
  };

  // handler to add another candidate field
  const addCandidateField = () => {
    setCandidates([...candidates, ""]);
  };

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
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom
        sx={{ fontWeight: "bold" }}
      >
        Dashboard
      </Typography>

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

      {/* Deployer Section */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h6">Deployer</Typography>
        <Button onClick={() => setShowDeployPopup(true)}
            sx={{
              background: "rgba(230, 218, 56, 0.62)",
              "&:hover": {
              background: "rgba(253, 242, 93, 0.75)",
              }
            }}
          >Deploy Contract</Button>

        {showDeployPopup && (
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6">Deploy New Contract</Typography>
              <Box component="form" onSubmit={handleDeploy} sx={{ mt: 2 }}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Contract Type</InputLabel>
                  <Select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value)}
                    label="Contract Type"
                    sx={{
                      color: "#000000"
                    }}
                  >
                    <MenuItem value="fundraising">Fundraising</MenuItem>
                    <MenuItem value="voting">Voting</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Contract Name"
                  value={contractName}
                  onChange={(e) => setContractName(e.target.value)}
                  fullWidth
                  margin="normal"
                />

                {contractType === "fundraising" && (
                  <>
                    <TextField
                      label="Goal Amount"
                      type="number"
                      value={goalAmount}
                      onChange={(e) => setGoalAmount(e.target.value)}
                      fullWidth
                      margin="normal"
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      label="Deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      fullWidth
                      margin="normal"
                      sx={{
                        "& label": {
                          transform: "translate(14px, -9px) scale(0.75)", // force shrink position
                          color: "#000",
                        },
                        "& label.Mui-focused": {
                          color: "#000000",
                        },
                        "& input": {
                          color: "#000000",
                        },
                    }}
                    />
                  </>
                )}

                {contractType === "voting" && (
                  <>
                    <TextField
                      label="Deadline"
                      type="date"
                      value={deadline}
                      onChange={(e) => setDeadline(e.target.value)}
                      fullWidth
                      margin="normal"
                      sx={{
                        "& label": {
                          transform: "translate(14px, -9px) scale(0.75)", // force shrink position
                          color: "#000",
                        },
                        "& label.Mui-focused": {
                          color: "#000000",
                        },
                        "& input": {
                          color: "#000000",
                        },
                    }}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2 }}>
                      Candidates
                    </Typography>
                    {candidates.map((name, idx) => (
                      <TextField
                        key={idx}
                        label={`Candidate ${idx + 1}`}
                        value={name}
                        onChange={(e) => handleCandidateChange(idx, e.target.value)}
                        fullWidth
                        margin="normal"
                      />
                    ))}
                    <Button onClick={addCandidateField} 
                    sx={{ mt: 1,
                          background: "rgba(56, 224, 230, 0.62)",
                          "&:hover": {
                          background: "rgba(44, 248, 255, 0.87)",
                          }
                      }}
                    >
                      Add Candidate
                    </Button>
                  </>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button type="submit"
                    sx={{ 
                            background: "rgba(218, 89, 235, 0.65)",
                            "&:hover": {
                            background: "rgba(233, 70, 255, 0.81)",
                          }
                      }}
                  >Deploy</Button>
                  <Button onClick={() => setShowDeployPopup(false)}
                    sx={{ 
                            background: "rgba(243, 55, 55, 0.57)",
                            "&:hover": {
                            background: "rgba(255, 7, 7, 0.8)",
                          }
                      }}
                    >Cancel</Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* User Section */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h6">User</Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Search contract address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            fullWidth
            sx={{
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#ffffff", // shrink/focus color
              },
            }}
          />
          <Button onClick={handleSearch}
            sx={{
                background: "rgba(230, 218, 56, 0.62)",
                "&:hover": {
                background: "rgba(253, 242, 93, 0.75)",
                }
              }}
          >Search</Button>
        </Stack>

        {searchResult === "none" && <Typography sx={{color: "red"}}>No Contracts Found</Typography>}
        {searchResult && searchResult !== "none" && (
          <Box sx={{ mt: 2 }}>
            <Typography>Contract Found: {searchResult.address}</Typography>
            <Button onClick={() => handleContractClick(searchResult)}
              sx={{
                background: "rgba(230, 218, 56, 0.62)",
                "&:hover": {
                background: "rgba(253, 242, 93, 0.75)",
                }
              }}
              >
              Open Contract
            </Button>
          </Box>
        )}
      </Box>

      {/* Show all deployed contracts */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h6">All Deployed Contracts</Typography>
        <ul>
          {contracts.map((c, idx) => (
            <li key={idx}>
              <strong>{c.name || "Unnamed"}</strong> — {c.address} ({c.type})
            </li>
          ))}
        </ul>
      </Box>
    </Box>
    </Box>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Dashboard />
    </ThemeProvider>
  );
}
