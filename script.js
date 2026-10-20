
"use strict";


// ========================================
// 2. GET HTML ELEMENTS
// ========================================

const questionScreen = document.getElementById("questionScreen");
const successScreen = document.getElementById("successScreen");

const noButton = document.getElementById("noButton");
const yesButton = document.getElementById("yesButton");
const reaction = document.getElementById("reaction");

let noAttempts = 0;
let lastDodgeTime = 0;

const funnyReactions = [
  "Ah-ah! You wan abandon me like this? 😭",
  "SAPA is watching you click NO. 👀",
  "Even my bank app is begging you! 😂",
  "No be so we agree na, my love! 🥹",
  "Your finger cannot catch this NO button o! 🏃",
  "God abeg, touch YES! My balance is crying! 💸",
  "You want me to trek to work? 😭😂",
  "This NO button has resigned from your service! 💀",
  "You sef pity the NO button na! 😭"
];

// ========================================
// 3. MAKE THE NO BUTTON DODGE
// ========================================

function dodgeNoButton(cursorX, cursorY) {
  const now = Date.now();

  if (now - lastDodgeTime < 100) return;
  lastDodgeTime = now;

  noAttempts++;

  reaction.textContent =
    funnyReactions[(noAttempts - 1) % funnyReactions.length];

  const rect = noButton.getBoundingClientRect();

 

  // Move NO to a fixed position while preserving its original space.
  if (getComputedStyle(noButton).position !== "fixed") {
    const placeholder = document.createElement("span");

    placeholder.style.display = "inline-block";
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;
    placeholder.style.flexShrink = "0";

    noButton.parentNode.insertBefore(placeholder, noButton);

    noButton.style.position = "fixed";
    noButton.style.left = `${rect.left}px`;
    noButton.style.top = `${rect.top}px`;
    noButton.style.margin = "0";
    noButton.style.width = `${rect.width}px`;
    noButton.style.height = `${rect.height}px`;
    noButton.style.zIndex = "9999";
  }



  const padding = 16;
  const maxX = Math.max(padding, window.innerWidth - rect.width - padding);
  const maxY = Math.max(padding, window.innerHeight - rect.height - padding);

  let newX = padding;
  let newY = padding;
  let foundSafeSpot = false;

  // Look for a position away from the cursor.
  for (let i = 0; i < 60; i++) {
    const candidateX = padding + Math.random() * (maxX - padding);
    const candidateY = padding + Math.random() * (maxY - padding);

    const centerX = candidateX + rect.width / 2;
    const centerY = candidateY + rect.height / 2;

    const distance = Math.hypot(
      centerX - cursorX,
      centerY - cursorY
    );

    if (distance > 180) {
      newX = candidateX;
      newY = candidateY;
      foundSafeSpot = true;
      break;
    }
  }

  // Fallback for very small screens.
  if (!foundSafeSpot) {
    newX = Math.min(maxX, Math.max(padding, cursorX < window.innerWidth / 2 ? maxX : padding));
    newY = Math.min(maxY, Math.max(padding, cursorY < window.innerHeight / 2 ? maxY : padding));
  }

  noButton.style.left = `${newX}px`;
  noButton.style.top = `${newY}px`;
}

// Dodge when the pointer gets close to the NO button.
document.addEventListener("pointermove", (event) => {
  if (successScreen.hidden) {
    const rect = noButton.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distance = Math.hypot(
      event.clientX - centerX,
      event.clientY - centerY
    );

    if (distance < 115) {
      dodgeNoButton(event.clientX, event.clientY);
    }
  }
});

// Also dodge on touchscreens when someone tries to tap NO.
noButton.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  dodgeNoButton(event.clientX, event.clientY);
});

noButton.addEventListener("click", (event) => {
  event.preventDefault();
  dodgeNoButton(event.clientX, event.clientY);
});

// ========================================
// 4. CONFETTI CELEBRATION
// ========================================

function launchConfetti() {
  const colors = ["#ff4f91", "#ffc857", "#8b5cf6", "#34d399", "#ff8fab"];

  for (let i = 0; i < 90; i++) {
    const piece = document.createElement("span");

    piece.textContent = Math.random() > 0.5 ? "💗" : "✨";
    piece.style.position = "fixed";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = "-30px";
    piece.style.fontSize = `${14 + Math.random() * 14}px`;
    piece.style.pointerEvents = "none";
    piece.style.zIndex = "10000";
    piece.style.animation = `confettiFall ${2 + Math.random() * 3}s linear forwards`;
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];

    document.body.appendChild(piece);

    piece.addEventListener("animationend", () => piece.remove());
  }

  // Add the falling animation once.
  if (!document.getElementById("confettiStyles")) {
    const style = document.createElement("style");
    style.id = "confettiStyles";
    style.textContent = `
      @keyframes confettiFall {
        from { transform: translateY(0) rotate(0deg); opacity: 1; }
        to { transform: translateY(110vh) rotate(720deg); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }
}


 // ========================================
 // 5. YES BUTTON: SHOW THE RESCUE FUND
 // ========================================

yesButton.addEventListener("click", () => {
  questionScreen.hidden = true;
  successScreen.hidden = false;

  window.scrollTo({ top: 0, behavior: "smooth" });
  launchConfetti();
});


/* ========================================
   COPY INDIVIDUAL BANK ACCOUNT NUMBERS
======================================== */

document.querySelectorAll(".copy-account-button").forEach((button) => {
  button.addEventListener("click", async () => {
    const accountNumber = button.dataset.accountNumber;
    const originalText = button.textContent;

    try {
      await navigator.clipboard.writeText(accountNumber);
    } catch (error) {
      // Fallback for browsers that block clipboard access.
      const temporaryInput = document.createElement("textarea");
      temporaryInput.value = accountNumber;
      temporaryInput.style.position = "fixed";
      temporaryInput.style.opacity = "0";

      document.body.appendChild(temporaryInput);
      temporaryInput.select();

      const copied = document.execCommand("copy");
      temporaryInput.remove();

      if (!copied) {
        alert("Please copy this account number manually: " + accountNumber);
        return;
      }
    }

    button.textContent = "✓";
    button.setAttribute("aria-label", "Account number copied");

    window.setTimeout(() => {
      button.textContent = originalText;
      button.setAttribute("aria-label", "Copy account number");
    }, 2000);
  });
});
