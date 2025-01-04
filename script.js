// Transaction History Array (initialized as empty)
let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];

// Function to open full-screen page
function openPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.fullscreen-page').forEach(page => {
    page.style.display = 'none';
  });

  // Reset Add Money Page if it's being opened
  if (pageId === "addMoneyPage") {
    resetAddMoneyPage();
  }

  // Reset Withdrawal Page if it's being opened
  if (pageId === "withdrawalPage") {
    resetWithdrawalPage();
  }

  // Load transactions if opening Transaction Page
  if (pageId === "transactionPage") {
    loadTransactions();
  }

  // Show the clicked page
  document.getElementById(pageId).style.display = 'flex';
}

// Reset Add Money Page content
function resetAddMoneyPage() {
  document.getElementById("selectedAmount").textContent = "";
  document.getElementById("qrCodeSection").style.display = "none";
}

// Select amount and show QR code
function selectAmount(amount) {
  document.getElementById("selectedAmount").textContent = amount;
  document.getElementById("qrCodeSection").style.display = "block";
}

// Submit transaction and save data
function submitTransaction() {
  const selectedAmount = document.getElementById("selectedAmount").textContent;

  if (!selectedAmount) {
    alert("Please select an amount first.");
    return;
  }

  // Save transaction in history
  const transaction = {
    amount: selectedAmount,
    date: new Date().toLocaleString(),
    type: "Deposit", // Adding transaction type
  };
  transactionHistory.push(transaction);

  // Update localStorage
  localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));

  alert(`Transaction submitted for ₹${selectedAmount}`);
  closeFullScreenPage(); // Close Add Money Page
}

// Load transaction history on the Transaction Page
function loadTransactions() {
  const transactionList = document.getElementById("transactionList");
  transactionList.innerHTML = ""; // Clear previous list

  // Retrieve transaction history from localStorage
  let transactionHistory = JSON.parse(localStorage.getItem("transactionHistory")) || [];

  // Populate list with transaction history
  transactionHistory.forEach((transaction) => {
    const listItem = document.createElement("li");

    // Format the transaction list item
    if (transaction.type === "Withdrawal") {
      listItem.textContent = `${transaction.amount} debited, UPI ID: ${transaction.upiID}, Date: ${transaction.date}`;
    } else {
      listItem.textContent = `${transaction.amount} - ${transaction.date}`;
    }

    transactionList.appendChild(listItem);
  });
}

// Close full-screen page
function closeFullScreenPage() {
  document.querySelectorAll('.fullscreen-page').forEach(page => {
    page.style.display = 'none';
  });
}

// Add Money button to open Add Money Page
document.getElementById("addMoneyBtn").addEventListener("click", function () {
  openPage("addMoneyPage");
});

// Withdrawal Process
function processWithdrawal() {
  const userID = document.getElementById("withdrawUserID").value.trim();
  const amount = parseInt(document.getElementById("withdrawAmount").value.trim());
  const upiID = document.getElementById("withdrawUPIID").value.trim();

  // Validate inputs
  if (!userID || isNaN(amount) || !upiID) {
    alert("Please enter valid details.");
    return;
  }

  // Validate UPI ID format (example: abc@upi)
  const upiRegex = /^[a-zA-Z0-9.\-_]+@[a-zA-Z]+$/;
  if (!upiRegex.test(upiID)) {
    alert("Please enter a valid UPI ID.");
    return;
  }

  // Check if the withdrawal amount is less than 500
  if (amount < 500) {
    alert("Minimum withdrawal amount is ₹500.");
    return;
  }

  const walletRef = ref(db, `users/${userID}/wallet`);

  // Fetch the current wallet balance
  get(walletRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        const currentBalance = snapshot.val();

        if (currentBalance >= amount) {
          // Deduct the withdrawal amount
          const updatedBalance = currentBalance - amount;

          // Update the wallet balance in Firebase
          set(walletRef, updatedBalance)
            .then(() => {
              // Save withdrawal transaction in history
              const withdrawalTransaction = {
                amount: amount,
                date: new Date().toLocaleString(),
                type: "Withdrawal",
                upiID: upiID,
              };
              transactionHistory.push(withdrawalTransaction);

              // Update localStorage
              localStorage.setItem("transactionHistory", JSON.stringify(transactionHistory));

              alert(`Withdrawal successful! ₹${amount} has been deducted.`);
              updateWalletBalance(userID); // Refresh wallet balance in the UI
              closeFullScreenPage(); // Close the withdrawal page
            })
            .catch((error) => {
              console.error("Error updating wallet:", error);
              alert("Error during withdrawal. Please try again.");
            });
        } else {
          alert("Insufficient balance!");
        }
      } else {
        alert("User not found.");
      }
    })
    .catch((error) => {
      console.error("Error fetching wallet:", error);
      alert("Error during withdrawal. Please try again.");
    });
}

// Reset Withdrawal Page inputs
function resetWithdrawalPage() {
  document.getElementById("withdrawUserID").value = ""; // Clear User ID field
  document.getElementById("withdrawAmount").value = ""; // Clear Amount field
  document.getElementById("withdrawUPIID").value = ""; // Clear UPI ID field
}

// Menu toggle function (keep this only once)
function toggleMenu() {
  const sideMenu = document.getElementById("sideMenu");
  sideMenu.classList.toggle("active"); // Toggle the 'active' class to show or hide the menu
}

// Logout function
function logout() {
  // Clear localStorage to log out the user
  localStorage.removeItem("loggedIn");
  localStorage.removeItem("username");

  // Hide any previous logout message if present
  const logoutMessage = document.getElementById("logoutMessage");
  if (logoutMessage) {
    logoutMessage.style.display = "none";  // Hide message if any
  }

  // Redirect to the registration page (or show login page)
  document.getElementById("homePage").style.display = "none";
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("registrationPage").style.display = "block";
}

// Function to close the current page
function closePage(pageId) {
  document.getElementById(pageId).style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
  const containers = document.querySelectorAll(".container");

  // Scroll event listener
  window.addEventListener("scroll", () => {
    containers.forEach((container) => {
      const rect = container.getBoundingClientRect();
      // जब कंटेनर स्क्रीन के टॉप से 90px पर हो, और ऊपर स्क्रॉल करें
      if (rect.top <= 90) {
        container.classList.add("hidden");
      } else {
        container.classList.remove("hidden");
      }
    });
  });
});
// Function to Show Popup
function showVipIdPopup() {
  const popup = document.getElementById('vipPopup');
  popup.style.display = 'block';

  // Fetch IP Address and Set VIP ID
  fetch('https://api.ipify.org?format=json')
    .then((response) => response.json())
    .then((data) => {
      const vipId = document.getElementById('vipId');
      vipId.textContent = `VIP ID: ${data.ip.replace(/\./g, '')}`; // Generate a unique VIP ID from IP
    })
    .catch(() => {
      document.getElementById('vipId').textContent = 'Error fetching IP';
    });
}

// Function to Close Popup
function closePopup() {
  const popup = document.getElementById('vipPopup');
  popup.style.display = 'none';
}
// Function to Generate Random Number Between 870 and 29094
function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to Update Live Number Every 5 Seconds
function updateLiveNumber() {
  const liveNumberElement = document.getElementById('liveNumber');
  setInterval(() => {
    const newNumber = generateRandomNumber(870, 29094);
    liveNumberElement.textContent = newNumber;
  }, 5000); // Update every 5000 milliseconds (5 seconds)
}

// Initialize Live Number Updates
updateLiveNumber();
function openTelegramChannel() {
  window.open("https://t.me/+B7Osa75JAr9mNjY1", "_blank"); // Replace "yourTelegramChannel" with your actual Telegram channel link.
}
// Function to open the Result Website
function openResultWebsite() {
  window.open("https://sattakingofficial.com", "_blank"); // Replace with your result website link.
}
// List of first names (common first names)
const firstNames = [
  'Rehan', 'Rohit', 'Manoj', 'Amit', 'Raj', 'Sahil', 'Vikas', 'Ankit', 'Ayaan', 'Aditya',
  'Karan', 'Deepak', 'Ravi', 'Sandeep', 'Arvind', 'Vivek', 'Nikhil', 'Sanjay', 'Sourabh', 'Kunal',
  'Shiv', 'Arun', 'Nashit', 'Aarav', 'Ishaan', 'Yash', 'Harsh', 'Krish', 'Siddharth', 'Gautam',
  'Ansh', 'Anurag', 'Raghav', 'Paras', 'Dinesh', 'Sumit', 'Abhishek', 'Pranav', 'Harshit', 'Manish',
  'Kunal', 'Vikrant', 'Manoj', 'Raghavendra', 'Suraj', 'Saurabh', 'Rohit', 'Sandeep', 'Yogesh', 'Ravi',
  // Add more names as required
  'Rashid', 'Naveen', 'Pradeep', 'Mohit', 'Anil', 'Dinesh', 'Madhur', 'Shubham', 'Sumit', 'Nikhil'
];

// List of surnames (common last names)
const surnames = [
  'Sharma', 'Gupta', 'Singh', 'Kumar', 'Patel', 'Verma', 'Reddy', 'Mehta', 'Iyer', 'Desai',
  'Kapoor', 'Shah', 'Jain', 'Joshi', 'Agarwal', 'Chauhan', 'Yadav', 'Tiwari', 'Mishra', 'Dubey',
  'Rani', 'Nair', 'Bhat', 'Soni', 'Thakur', 'Rao', 'Saxena', 'Rawat', 'Bhagat', 'Bhattacharya',
  'Singh', 'Chaudhary', 'Vyas', 'Bhatt', 'Bansal', 'Patil', 'Bhardwaj', 'Bhagat', 'Nagpal', 'Jha',
  'Rathore', 'Chopra', 'Bedi', 'Malhotra', 'Saxena', 'Khan', 'Nanda', 'Shukla', 'Purohit', 'Saran'
  // Add more surnames as required
];

// Array to store already shown names
const usedNames = [];

// Function to generate a random name with first name and surname
function generateRandomName() {
  let firstName, lastName, fullName;

  // Keep generating a name until we get a unique one
  do {
    firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    lastName = surnames[Math.floor(Math.random() * surnames.length)];
    fullName = firstName + ' ' + lastName;
  } while (usedNames.includes(fullName)); // Check if the name has already been shown

  // Once a new name is found, add it to the usedNames array
  usedNames.push(fullName);

  return fullName; // Return the unique name
}

// Function to generate a random withdrawal amount between 1456 and 26489
function generateRandomAmount() {
  const minAmount = 1456;
  const maxAmount = 26489;
  return Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount;
}

// Function to update the dynamic text with random name and amount
function updateDynamicText() {
  const dynamicText = document.getElementById('dynamicText');
  const randomName = generateRandomName();
  const randomAmount = generateRandomAmount();
  dynamicText.textContent = `${randomName} withdrawal ₹${randomAmount} successfully`;
}

// Function to toggle between the two texts
function toggleText() {
  const movingText1 = document.getElementById('movingText1');
  const movingText2 = document.getElementById('movingText2');

  // Hide the current text and show the other one
  if (movingText2.style.display !== 'none') {
    movingText2.style.display = 'none'; // Hide the second text
    movingText1.style.display = 'block'; // Show the first text
    updateDynamicText(); // Update the dynamic text

    // After 20 seconds, switch back
    setTimeout(() => {
      movingText1.style.display = 'none'; // Hide the first text
      movingText2.style.display = 'block'; // Show the second text
    }, 20000); // Show for 20 seconds
  }
}

// Call the toggleText function every 40 seconds to alternate between the texts
setInterval(toggleText, 40000); // Repeat every 40 seconds

// Initial dynamic text update
updateDynamicText();