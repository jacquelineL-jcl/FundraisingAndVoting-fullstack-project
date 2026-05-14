App.jsx: wallet connection (after wallet connection direct to dashboard)

Dashboard.jsx: 
1. Deployer - show deployed contract (and deploy contract button which show a popup for user to fill in info for deployment)
2. **User - search bar to find deployed contract (similar to etherscan but for this application only). If contract exist, allow user to click on it and redirect to fundraisingUI or VotingUI depending on what the contract is, if none exist show test "No Contracts Found"

FundraisingUI: allow user to make deposit/ refund/ check status (exactly as what the contract does)
- show process bar of funding goal; remaining time

VotingUI: allow user to vote for candidates
- show candidates option (and their index); live vote count; remaining time

=========================FundraisingUI===============================
🔹 State Variables
You’ll need to track both contract data and user input:

contractAddress → from route params

goalAmount → fetched from contract

deadline → fetched from contract

currentFunds → fetched from contract

status → contract state (active, expired, goal reached)

depositAmount → user input for deposit

snackbarMessage → feedback messages

showSnackbar → toggle for feedback

loading → boolean for async actions

🔹 Functions
Each function maps directly to contract actions or UI updates:

fetchContractData()

Call contract methods to get goalAmount, deadline, currentFunds, status.

Update state accordingly.

handleDeposit()

Validate depositAmount (non‑empty, >0).

Call contract’s deposit function with ethers.js.

Update currentFunds after success.

Show snackbar message.

handleRefund()

Call contract’s refund function.

Show snackbar message (success/failure).

checkStatus()

Read contract’s status (goal reached, expired, etc.).

Update status state.

updateRemainingTime()

Calculate time left until deadline.

Display countdown in UI.

🔹 Styling (Material‑UI outline)
Use MUI components for layout and feedback:

Header:

Typography for contract title + address.

Progress Section:

LinearProgress or CircularProgress for funding goal.

Typography for “Raised X / Goal Y”.

Typography for remaining time.

User Actions:

TextField for deposit amount.

Button for “Deposit”.

Button for “Refund”.

Button for “Check Status”.

Feedback:

Snackbar + Alert for transaction messages.

CircularProgress for loading state.