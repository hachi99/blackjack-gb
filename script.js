let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = true;
let dealerHidden = true;
let wins = localStorage.getItem("wins") || 0;
let losses = localStorage.getItem("losses") || 0;

const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerScoreEl = document.getElementById("dealer-score");
const playerScoreEl = document.getElementById("player-score");
const resultEl = document.getElementById("result");
const statsEl = document.createElement("p");

document.querySelector(".screen").appendChild(statsEl);
document.getElementById("start").addEventListener("click", startGame);
document.getElementById("hit").addEventListener("click", hit);
document.getElementById("stand").addEventListener("click", stand);

function updateStats() {
  statsEl.textContent = `Wins: ${wins} | Losses: ${losses}`;
}

function createDeck() {
  const suits = ["♠", "♥", "♦", "♣"];
  const values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  deck = [];

  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }

  shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function dealCard(hand) {
  hand.push(deck.pop());
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  for (let card of hand) {
    if (["J", "Q", "K"].includes(card.value)) score += 10;
    else if (card.value === "A") {
      score += 11;
      aces++;
    } else {
      score += parseInt(card.value);
    }
  }

  while (score > 21 && aces > 0) {
    score -= 10;
    aces--;
  }

  return score;
}

function disableButtons() {
  document.getElementById("hit").disabled = true;
  document.getElementById("stand").disabled = true;
  document.getElementById("start").textContent = "REPLAY";
}

function render() {
  if (dealerHidden) {
    dealerCardsEl.textContent =
      dealerHand[0].value + " ?";
    
    dealerScoreEl.textContent =
      "Score: " + calculateScore([dealerHand[0]]);
  } else {
    dealerCardsEl.textContent =
      dealerHand.map(c => c.value).join(" ");
    
    dealerScoreEl.textContent =
      "Score: " + calculateScore(dealerHand);
  }

  playerCardsEl.textContent =
    playerHand.map(c => c.value).join(" ");

  playerScoreEl.textContent =
    "Score: " + calculateScore(playerHand);
}

function dealerPlay() {
  if (calculateScore(dealerHand) < 17) {
    dealCard(dealerHand);
    render();

    setTimeout(dealerPlay, 400);
  } else {
    finishGame();
  }
}


function startGame() {
  createDeck();
  playerHand = [];
  dealerHand = [];
  resultEl.textContent = "";
  gameOver = false;
  dealerHidden = true;

  dealCard(playerHand);
  dealCard(playerHand);
  dealCard(dealerHand);
  dealCard(dealerHand);

  document.getElementById("hit").disabled = false;
  document.getElementById("stand").disabled = false;
  document.getElementById("start").textContent = "START";

  render();

  const playerBJ = isBlackjack(playerHand);
  const dealerBJ = isBlackjack(dealerHand);

  if (playerBJ || dealerBJ) {
    dealerHidden = false;
    finishGame();
  }
}

function hit() {
  if (gameOver) return;

  dealCard(playerHand);
  render();

  if (calculateScore(playerHand) > 21) {
    dealerHidden = false;
    resultEl.textContent = "BUST! Dealer wins.";
    gameOver = true;
    render();
  }
}


function stand() {
  if (gameOver) return;

  dealerHidden = false;
  dealerPlay();

  disableButtons();
}

function finishGame() {

  if (gameOver) return;

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  if (dealerScore > 21 || playerScore > dealerScore) {
    resultEl.textContent = "YOU WIN!";
    wins++;
    localStorage.setItem("wins", wins);
  } else if (dealerScore > playerScore) {
    resultEl.textContent = "DEALER WINS!";
    losses++;
    localStorage.setItem("losses", losses);
  } else {
    resultEl.textContent = "PUSH!";
  }

  updateStats();
  gameOver = true;
  disableButtons();
  render();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js")
      .then(() => console.log("Service Worker Registered"))
      .catch(err => console.log("SW error:", err));
  });
}