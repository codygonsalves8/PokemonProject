const allPokemon = [
  ...gen1.map(p => ({ ...p, generation: 1 })),
  ...gen2.map(p => ({ ...p, generation: 2 })),
  ...gen3.map(p => ({ ...p, generation: 3 })),
  ...gen4.map(p => ({ ...p, generation: 4 })),
  ...gen5.map(p => ({ ...p, generation: 5 })),
  ...gen6.map(p => ({ ...p, generation: 6 })),
  ...gen7.map(p => ({ ...p, generation: 7 })),
  ...gen8.map(p => ({ ...p, generation: 8 })),
  ...gen9.map(p => ({ ...p, generation: 9 }))
];

/* Creates the starting values for each game mode */
function createModeState() {
  return {
    streak: 0,
    currentPokemon: null,
    roundAnswered: false,
    streakBrokenThisRound: false,
    hardTry: 1,
    resultText: "",
    resultClass: "result",
    nextEnabled: false,
    genHintVisible: false,
    typeHintVisible: false,
    easyChoices: [],
    easySelectedName: null,
    easyCorrectName: null
  };
}

/* Stores the current mode and the saved state for easy and hard mode */
const state = {
  mode: "easy",
  modes: {
    easy: createModeState(),
    hard: createModeState()
  }
};

/* Stores all the HTML elements */
const el = {
  homeScreen: document.getElementById("homeScreen"),
  gameScreen: document.getElementById("gameScreen"),
  rateScreen: document.getElementById("rateScreen"),
  contactScreen: document.getElementById("contactScreen"),

  homeNav: document.getElementById("homeNav"),
  easyNav: document.getElementById("easyNav"),
  hardNav: document.getElementById("hardNav"),
  rateNav: document.getElementById("rateNav"),
  contactNav: document.getElementById("contactNav"),

  homeEasyBtn: document.getElementById("homeEasyBtn"),
  homeHardBtn: document.getElementById("homeHardBtn"),
  currentModeLabel: document.getElementById("currentModeLabel"),
  streak: document.getElementById("streak"),
  statsGrid: document.getElementById("statsGrid"),
  choicesContainer: document.getElementById("choicesContainer"),
  easyModeArea: document.getElementById("easyModeArea"),
  hardModeArea: document.getElementById("hardModeArea"),
  genHintPill: document.getElementById("genHintPill"),
  typeHintPill: document.getElementById("typeHintPill"),
  guessInput: document.getElementById("guessInput"),
  pokemonSuggestions: document.getElementById("pokemonSuggestions"),
  submitGuessBtn: document.getElementById("submitGuessBtn"),
  resultText: document.getElementById("resultText"),
  nextBtn: document.getElementById("nextBtn"),

  rateForm: document.getElementById("rateForm"),
  rateResult: document.getElementById("rateResult")
};

/* Sets the colors used for stat boxes based on stat value */
const statColors = [
  { value: 20, color: { r: 214, g: 69, b: 65 } },
  { value: 70, color: { r: 235, g: 208, b: 74 } },
  { value: 120, color: { r: 84, g: 189, b: 98 } },
  { value: 180, color: { r: 77, g: 201, b: 255 } }
];

/* Gets the saved state for the current mode */
function currentModeState() {
  return state.modes[state.mode];
}

/* Shows the home screen and hides the other screens */
function showHomeScreen() {
  el.homeScreen.classList.remove("hidden");
  el.gameScreen.classList.add("hidden");
  el.rateScreen.classList.add("hidden");
  el.contactScreen.classList.add("hidden");
}

/* Shows the game screen and hides the other screens */
function showGameScreen() {
  el.homeScreen.classList.add("hidden");
  el.gameScreen.classList.remove("hidden");
  el.rateScreen.classList.add("hidden");
  el.contactScreen.classList.add("hidden");
}

/* Shows the rate screen and hides the other screens */
function showRateScreen() {
  el.homeScreen.classList.add("hidden");
  el.gameScreen.classList.add("hidden");
  el.rateScreen.classList.remove("hidden");
  el.contactScreen.classList.add("hidden");
}

/* Shows the contact screen and hides the other screens */
function showContactScreen() {
  el.homeScreen.classList.add("hidden");
  el.gameScreen.classList.add("hidden");
  el.rateScreen.classList.add("hidden");
  el.contactScreen.classList.remove("hidden");
}

/* Updates the mode label and streak number at the top */
function updateTopBar() {
  el.currentModeLabel.textContent = state.mode === "easy" ? "Easy" : "Hard";
  el.streak.textContent = currentModeState().streak;
}

/* Builds the autocomplete list for hard mode guesses */
function buildSuggestionList() {
  el.pokemonSuggestions.innerHTML = allPokemon
    .map(pokemon => `<option value="${pokemon.name}"></option>`)
    .join("");
}

/* Randomly shuffles the order of items in an array */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/* Keeps a value between a minimum and maximum */
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

/* Blends between two color numbers */
function mix(a, b, amount) {
  return Math.round(a + (b - a) * amount);
}

/* Finds the correct stat box color based on the stat value */
function getStatColor(value) {
  if (value <= statColors[0].value) {
    const c = statColors[0].color;
    return `rgb(${c.r}, ${c.g}, ${c.b})`;
  }

  if (value >= statColors[statColors.length - 1].value) {
    const c = statColors[statColors.length - 1].color;
    return `rgb(${c.r}, ${c.g}, ${c.b})`;
  }

  for (let i = 0; i < statColors.length - 1; i++) {
    const current = statColors[i];
    const next = statColors[i + 1];

    if (value >= current.value && value <= next.value) {
      const amount = clamp((value - current.value) / (next.value - current.value), 0, 1);
      const r = mix(current.color.r, next.color.r, amount);
      const g = mix(current.color.g, next.color.g, amount);
      const b = mix(current.color.b, next.color.b, amount);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  return "rgb(217, 221, 232)";
}

/* Shows the current Pokemon's stats on the screen */
function renderStats(pokemon) {
  const stats = [
    ["HP", pokemon.hp],
    ["Attack", pokemon.attack],
    ["Defense", pokemon.defense],
    ["Sp. Atk", pokemon.spAttack],
    ["Sp. Def", pokemon.spDefense],
    ["Speed", pokemon.speed]
  ];

  el.statsGrid.innerHTML = stats
    .map(([label, value]) =>
      `<div class="stat-box" style="background-color:${getStatColor(value)};">${label}: ${value}</div>`
    )
    .join("");
}

/* Picks a random Pokemon from the full list */
function randomPokemon() {
  return allPokemon[Math.floor(Math.random() * allPokemon.length)];
}

/* Gets the wrong answer choices for easy mode */
function wrongChoices(correctName, count) {
  return shuffle(allPokemon.filter(p => p.name !== correctName)).slice(0, count);
}

/* Simplifies names so guesses can still match even with punctuation differences */
function normalizeName(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/* Saves and displays the result message */
function setResult(text, className) {
  const modeState = currentModeState();
  modeState.resultText = text;
  modeState.resultClass = className;
  el.resultText.textContent = text;
  el.resultText.className = className;
}

/* Enables or disables the next Pokemon button */
function setNextEnabled(enabled) {
  currentModeState().nextEnabled = enabled;
  el.nextBtn.disabled = !enabled;
}

/* Creates a brand new round for the chosen mode */
function createNewRoundForMode(mode) {
  const modeState = state.modes[mode];
  modeState.currentPokemon = randomPokemon();
  modeState.roundAnswered = false;
  modeState.streakBrokenThisRound = false;
  modeState.hardTry = 1;
  modeState.resultText = "";
  modeState.resultClass = "result";
  modeState.nextEnabled = false;
  modeState.genHintVisible = false;
  modeState.typeHintVisible = false;
  modeState.easyChoices = [];
  modeState.easySelectedName = null;
  modeState.easyCorrectName = null;

  if (mode === "easy") {
    modeState.easyChoices = shuffle([
      ...wrongChoices(modeState.currentPokemon.name, 3),
      modeState.currentPokemon
    ]).map(p => p.name);
  }
}

/* Makes sure the current mode already has a Pokemon round ready */
function ensureRoundExists(mode) {
  if (!state.modes[mode].currentPokemon) {
    createNewRoundForMode(mode);
  }
}

/* Shows the easy mode answer buttons */
function renderEasyChoices() {
  const modeState = currentModeState();
  el.easyModeArea.classList.remove("hidden");
  el.hardModeArea.classList.add("hidden");
  el.choicesContainer.innerHTML = "";

  modeState.easyChoices.forEach(name => {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.textContent = name;
    button.dataset.name = name;

    if (modeState.roundAnswered) {
      button.disabled = true;

      if (name !== modeState.easySelectedName) {
        button.classList.add("dimmed");
      }

      if (name === modeState.easySelectedName && name === modeState.easyCorrectName) {
        button.classList.add("correct-choice");
      }

      if (name === modeState.easySelectedName && name !== modeState.easyCorrectName) {
        button.classList.add("wrong-choice");
      }

      if (name === modeState.easyCorrectName) {
        button.classList.add("correct-choice");
      }
    } else {
      button.addEventListener("click", () => handleEasyGuess(name));
    }

    el.choicesContainer.appendChild(button);
  });
}

/* Shows the hard mode input box and hints */
function renderHardMode() {
  const modeState = currentModeState();
  el.easyModeArea.classList.add("hidden");
  el.hardModeArea.classList.remove("hidden");

  el.genHintPill.textContent = `Generation Hint: Gen ${modeState.currentPokemon.generation}`;
  el.typeHintPill.textContent = `Type Hint: ${modeState.currentPokemon.types.join(" / ")}`;

  el.genHintPill.classList.toggle("hidden", !modeState.genHintVisible);
  el.typeHintPill.classList.toggle("hidden", !modeState.typeHintVisible);

  el.guessInput.value = "";
  el.guessInput.disabled = modeState.roundAnswered;
  el.submitGuessBtn.disabled = modeState.roundAnswered;
}

/* Refreshes everything that should appear for the current mode */
function renderCurrentMode() {
  const modeState = currentModeState();
  updateTopBar();
  renderStats(modeState.currentPokemon);
  setResult(modeState.resultText, modeState.resultClass);
  setNextEnabled(modeState.nextEnabled);

  if (state.mode === "easy") {
    renderEasyChoices();
  } else {
    renderHardMode();
  }
}

/* Switches the game into easy mode or hard mode */
function enterMode(mode) {
  state.mode = mode;
  ensureRoundExists(mode);
  showGameScreen();
  renderCurrentMode();
}

/* Ends the round as correct and updates the streak */
function finishCorrectRound() {
  const modeState = currentModeState();
  modeState.roundAnswered = true;
  modeState.streak += 1;
  setNextEnabled(true);
  setResult(`Correct! The answer was ${modeState.currentPokemon.name}.`, "result correct");

  if (state.mode === "hard") {
    el.guessInput.disabled = true;
    el.submitGuessBtn.disabled = true;
  }

  updateTopBar();
}

/* Ends the round as wrong and shows the correct answer */
function finishWrongRound() {
  const modeState = currentModeState();
  modeState.roundAnswered = true;
  modeState.streakBrokenThisRound = true;
  setNextEnabled(true);
  setResult(
    `Wrong. The correct answer was ${modeState.currentPokemon.name}.`,
    "result wrong"
  );

  if (state.mode === "hard") {
    el.guessInput.disabled = true;
    el.submitGuessBtn.disabled = true;
  }
}

/* Checks the selected answer in easy mode */
function handleEasyGuess(selectedName) {
  const modeState = currentModeState();
  if (modeState.roundAnswered) return;

  modeState.easySelectedName = selectedName;
  modeState.easyCorrectName = modeState.currentPokemon.name;

  if (selectedName === modeState.currentPokemon.name) {
    finishCorrectRound();
  } else {
    finishWrongRound();
  }

  renderEasyChoices();
}

/* Checks the typed answer in hard mode and unlocks hints after misses */
function handleHardGuess() {
  const modeState = currentModeState();
  if (modeState.roundAnswered) return;

  const guess = el.guessInput.value.trim();

  if (!guess) {
    setResult("Please type a Pokemon name first.", "result wrong");
    return;
  }

  if (normalizeName(guess) === normalizeName(modeState.currentPokemon.name)) {
    finishCorrectRound();
    return;
  }

  if (modeState.hardTry === 1) {
    modeState.hardTry = 2;
    modeState.genHintVisible = true;
    setResult("Wrong. Try again. Generation hint unlocked.", "result wrong");
    el.guessInput.value = "";
    renderHardMode();
    return;
  }

  if (modeState.hardTry === 2) {
    modeState.hardTry = 3;
    modeState.typeHintVisible = true;
    setResult("Wrong again. Last try. Type hint unlocked.", "result wrong");
    el.guessInput.value = "";
    renderHardMode();
    return;
  }

  finishWrongRound();
}

/* Moves to the next round and resets the streak if the last round was missed */
function nextRound() {
  const modeState = currentModeState();
  if (!modeState.roundAnswered) return;

  if (modeState.streakBrokenThisRound) {
    modeState.streak = 0;
  }

  createNewRoundForMode(state.mode);
  renderCurrentMode();
}

/* Easy mode button click */
el.homeEasyBtn.addEventListener("click", () => enterMode("easy"));

/* Hard mode button click */
el.homeHardBtn.addEventListener("click", () => enterMode("hard"));

/* Home navigation click */
el.homeNav.addEventListener("click", event => {
  event.preventDefault();
  showHomeScreen();
});

/* Easy ribbon navigation click */
el.easyNav.addEventListener("click", event => {
  event.preventDefault();
  enterMode("easy");
});

/* Hard ribbon navigation click */
el.hardNav.addEventListener("click", event => {
  event.preventDefault();
  enterMode("hard");
});

/* Rate the Game navigation click */
el.rateNav.addEventListener("click", event => {
  event.preventDefault();
  showRateScreen();
});

/* Contact navigation click */
el.contactNav.addEventListener("click", event => {
  event.preventDefault();
  showContactScreen();
});

/* Submit guess button click */
el.submitGuessBtn.addEventListener("click", handleHardGuess);

/* Next Pokemon button click */
el.nextBtn.addEventListener("click", nextRound);

/* Lets Enter key submit a hard mode guess */
el.guessInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    handleHardGuess();
  }
});

/* Rate form submit */
el.rateForm.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("rateNameInput").value;
  const rating = document.getElementById("ratingInput").value;

  el.rateResult.textContent = `Thank you, ${name}. You rated the game ${rating}/5.`;
  el.rateResult.className = "result correct";

  el.rateForm.reset();
});

buildSuggestionList();
showHomeScreen();