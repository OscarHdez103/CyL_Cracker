const ALLOWED_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 25, 50, 75, 100];
const INPUT_COUNT = 6;
const MIN_OBJECTIVE = 100;
const MAX_OBJECTIVE = 999;

class Action {
  constructor(a, op, b, result) {
    this.a = a;
    this.op = op;
    this.b = b;
    this.result = result;
  }

  toString() {
    return `${this.a} ${displayOperation(this.op)} ${this.b} = ${this.result}`;
  }
}

const state = {
  playInputs: [],
  crackInputs: [],
  game: null,
  selectedA: null,
  selectedB: null,
  selectedOperation: null
};

function $(id) {
  return document.getElementById(id);
}

function displayOperation(op) {
  return op === "*" ? "×" : op === "/" ? "÷" : op;
}

function randomChoice(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function randomObjective() {
  return Math.floor(Math.random() * (MAX_OBJECTIVE - MIN_OBJECTIVE + 1)) + MIN_OBJECTIVE;
}

function randomInputs() {
  return Array.from({ length: INPUT_COUNT }, () => randomChoice(ALLOWED_NUMBERS));
}

function validObjective(value) {
  const number = Number(value);
  return Number.isInteger(number) && number >= MIN_OBJECTIVE && number <= MAX_OBJECTIVE;
}

function setMessage(element, text = "", type = "") {
  element.textContent = text;
  element.className = `message${type ? ` ${type}` : ""}`;
}

function renderPicker(containerId, onPick) {
  const container = $(containerId);
  container.innerHTML = "";

  ALLOWED_NUMBERS.forEach((number) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "number-key";
    button.textContent = number;
    button.addEventListener("click", () => onPick(number));
    container.appendChild(button);
  });
}

function renderSlots(containerId, values, countId, onRemove) {
  const container = $(containerId);
  container.innerHTML = "";
  $(countId).textContent = `${values.length} / ${INPUT_COUNT}`;

  for (let index = 0; index < INPUT_COUNT; index += 1) {
    const slot = document.createElement(index < values.length ? "button" : "div");
    slot.className = `number-slot${index < values.length ? " filled" : ""}`;

    if (index < values.length) {
      slot.type = "button";
      slot.textContent = values[index];
      slot.title = "Pulsa para quitar este número";
      slot.addEventListener("click", () => onRemove(index));
    } else {
      slot.textContent = "—";
    }

    container.appendChild(slot);
  }
}

function addInput(mode, number) {
  const key = mode === "play" ? "playInputs" : "crackInputs";
  if (state[key].length >= INPUT_COUNT) return;
  state[key].push(number);
  renderInputArea(mode);
}

function removeInput(mode, index) {
  const key = mode === "play" ? "playInputs" : "crackInputs";
  state[key].splice(index, 1);
  renderInputArea(mode);
}

function clearInputs(mode) {
  const key = mode === "play" ? "playInputs" : "crackInputs";
  state[key] = [];
  renderInputArea(mode);
}

function renderInputArea(mode) {
  const values = mode === "play" ? state.playInputs : state.crackInputs;
  renderSlots(`${mode}-slots`, values, `${mode}-count`, (index) => removeInput(mode, index));

  const picker = $(`${mode}-picker`);
  [...picker.children].forEach((button) => {
    button.disabled = values.length >= INPUT_COUNT;
  });
}

function fillRandom(mode) {
  const key = mode === "play" ? "playInputs" : "crackInputs";
  state[key] = randomInputs();
  $(`${mode}-objective`).value = randomObjective();
  renderInputArea(mode);
  setMessage($(`${mode}-${mode === "play" ? "setup-message" : "message"}`), "");
}

function performOperation(a, op, b) {
  if (op === "+") return a + b;
  if (op === "-") return a >= b ? a - b : null;
  if (op === "*") return a * b;
  if (op === "/") return b !== 0 && a % b === 0 ? a / b : null;
  return null;
}

function startGame() {
  const objective = Number($("play-objective").value);

  if (!validObjective(objective)) {
    setMessage($("play-setup-message"), "El objetivo debe ser un número entero entre 100 y 999.", "error");
    return;
  }

  if (state.playInputs.length !== INPUT_COUNT) {
    setMessage($("play-setup-message"), "Debes elegir exactamente 6 números.", "error");
    return;
  }

  state.game = {
    objective,
    originalInputs: [...state.playInputs],
    numbers: state.playInputs.map((value, index) => ({ id: index + 1, value })),
    nextId: INPUT_COUNT + 1,
    history: [],
    ended: false
  };

  clearSelection();
  setMessage($("play-setup-message"), "Partida iniciada.", "success");
  renderGame();
}

function restartGame() {
  if (!state.game) return;

  state.game.numbers = state.game.originalInputs.map((value, index) => ({ id: index + 1, value }));
  state.game.nextId = INPUT_COUNT + 1;
  state.game.history = [];
  state.game.ended = false;
  clearSelection();
  setMessage($("game-message"), "Partida reiniciada.", "success");
  renderGame();
}

function clearSelection() {
  state.selectedA = null;
  state.selectedB = null;
  state.selectedOperation = null;
}

function selectGameNumber(id) {
  if (!state.game || state.game.ended) return;

  if (state.selectedA === id) {
    state.selectedA = null;
  } else if (state.selectedB === id) {
    state.selectedB = null;
  } else if (state.selectedA === null) {
    state.selectedA = id;
  } else if (state.selectedB === null) {
    state.selectedB = id;
  } else {
    state.selectedB = id;
  }

  renderGame();
}

function selectOperation(op) {
  if (!state.game || state.game.ended) return;
  state.selectedOperation = state.selectedOperation === op ? null : op;
  renderGame();
}

function selectedNumberValue(id) {
  return state.game?.numbers.find((item) => item.id === id)?.value ?? null;
}

function calculateGameAction() {
  if (!state.game || state.game.ended) return;

  const a = selectedNumberValue(state.selectedA);
  const b = selectedNumberValue(state.selectedB);
  const op = state.selectedOperation;

  if (a === null || b === null || !op) {
    setMessage($("game-message"), "Selecciona dos números y una operación.", "error");
    return;
  }

  const result = performOperation(a, op, b);
  if (result === null) {
    setMessage($("game-message"), "Operación no válida: la resta no puede ser negativa y la división debe ser exacta.", "error");
    return;
  }

  const action = new Action(a, op, b, result);
  state.game.history.push(action);
  state.game.numbers = state.game.numbers.filter(
    (item) => item.id !== state.selectedA && item.id !== state.selectedB
  );
  state.game.numbers.push({ id: state.game.nextId, value: result });
  state.game.nextId += 1;

  clearSelection();

  if (result === state.game.objective) {
    state.game.ended = true;
    setMessage($("game-message"), "¡Enhorabuena! Has alcanzado el objetivo.", "success");
  } else if (state.game.numbers.length < 2) {
    state.game.ended = true;
    setMessage($("game-message"), "No quedan suficientes números. Fin de la partida.", "error");
  } else {
    setMessage($("game-message"), `Resultado: ${result}`, "success");
  }

  renderGame();
}

function renderGame() {
  const game = state.game;
  const hasGame = Boolean(game);

  $("game-restart").disabled = !hasGame;
  $("game-title").textContent = hasGame ? (game.ended ? "Partida terminada" : "Partida en curso") : "Aún no iniciada";
  $("game-objective").textContent = hasGame ? game.objective : "—";

  const numbersContainer = $("game-numbers");
  numbersContainer.innerHTML = "";
  numbersContainer.className = "game-numbers";

  if (!hasGame) {
    numbersContainer.classList.add("empty-state");
    numbersContainer.textContent = "Empieza una partida para jugar.";
  } else {
    game.numbers.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "game-number";
      button.textContent = item.value;
      button.disabled = game.ended;
      if (state.selectedA === item.id || state.selectedB === item.id) button.classList.add("selected");
      button.addEventListener("click", () => selectGameNumber(item.id));
      numbersContainer.appendChild(button);
    });
  }

  const a = hasGame ? selectedNumberValue(state.selectedA) : null;
  const b = hasGame ? selectedNumberValue(state.selectedB) : null;
  $("operand-a").textContent = a ?? "Primer número";
  $("operand-b").textContent = b ?? "Segundo número";
  $("operand-a").classList.toggle("has-value", a !== null);
  $("operand-b").classList.toggle("has-value", b !== null);
  $("operand-a").disabled = true;
  $("operand-b").disabled = true;

  document.querySelectorAll(".operation-button").forEach((button) => {
    button.disabled = !hasGame || game.ended;
    button.classList.toggle("selected", button.dataset.operation === state.selectedOperation);
  });

  $("calculate-action").disabled = !hasGame || game.ended;

  const history = $("game-history");
  history.innerHTML = "";
  $("game-steps").textContent = hasGame ? game.history.length : 0;

  if (hasGame && game.history.length > 0) {
    game.history.forEach((action) => {
      const item = document.createElement("li");
      item.textContent = action.toString();
      history.appendChild(item);
    });
  }
}

function possiblePairActions(a, b) {
  const actions = [];
  const seen = new Set();

  const add = (left, op, right, result) => {
    if (result === null) return;
    const key = `${op}:${result}`;
    if (seen.has(key)) return;
    seen.add(key);
    actions.push(new Action(left, op, right, result));
  };

  add(a, "+", b, a + b);
  add(a, "*", b, a * b);
  if (a >= b) add(a, "-", b, a - b);
  if (b >= a) add(b, "-", a, b - a);
  if (b !== 0 && a % b === 0) add(a, "/", b, a / b);
  if (a !== 0 && b % a === 0) add(b, "/", a, b / a);

  return actions;
}

function isBetterSolution(candidate, best) {
  if (candidate.difference < best.difference) {
    return true;
  }

  if (
      candidate.difference === best.difference &&
      candidate.actions.length < best.actions.length
  ) {
    return true;
  }

  return false;
}

function crackNumbers(inputs, objective) {
  let best = {
    result: inputs[0],
    difference: Math.abs(objective - inputs[0]),
    actions: []
  };

  // Comprobar también todos los números iniciales
  inputs.forEach((value) => {
    const candidate = {
      result: value,
      difference: Math.abs(objective - value),
      actions: []
    };

    if (isBetterSolution(candidate, best)) {
      best = candidate;
    }
  });

  // Si el objetivo ya está entre los números,
  // 0 pasos es imposible de mejorar.
  if (best.difference === 0) {
    return best;
  }

  const visited = new Set();

  function search(numbers, actions) {
    const stateKey = [...numbers]
        .sort((a, b) => a - b)
        .join(",");

    if (visited.has(stateKey)) {
      return;
    }

    visited.add(stateKey);

    for (let i = 0; i < numbers.length; i += 1) {
      for (let j = i + 1; j < numbers.length; j += 1) {
        const a = numbers[i];
        const b = numbers[j];

        const remaining = numbers.filter(
            (_, index) => index !== i && index !== j
        );

        for (const action of possiblePairActions(a, b)) {
          const nextActions = [...actions, action];

          const candidate = {
            result: action.result,
            difference: Math.abs(objective - action.result),
            actions: nextActions
          };

          if (isBetterSolution(candidate, best)) {
            best = candidate;
          }

          // Ya tenemos una solución exacta con N pasos.
          // Una rama que ya tenga N pasos no puede producir
          // otra solución exacta con menos pasos.
          if (
              best.difference === 0 &&
              nextActions.length >= best.actions.length
          ) {
            continue;
          }

          if (remaining.length > 0) {
            search(
                [...remaining, action.result],
                nextActions
            );
          }
        }
      }
    }
  }

  search([...inputs], []);

  return best;
}

function runCracker() {
  const objective = Number($("crack-objective").value);

  if (!validObjective(objective)) {
    setMessage($("crack-message"), "El objetivo debe ser un número entero entre 100 y 999.", "error");
    return;
  }

  if (state.crackInputs.length !== INPUT_COUNT) {
    setMessage($("crack-message"), "Debes elegir exactamente 6 números.", "error");
    return;
  }

  setMessage($("crack-message"), "Buscando la mejor solución…");
  $("crack-start").disabled = true;
  $("crack-start").textContent = "Calculando…";

  requestAnimationFrame(() => {
    setTimeout(() => {
      const result = crackNumbers(state.crackInputs, objective);
      renderCrackResult(result, objective);
      $("crack-start").disabled = false;
      $("crack-start").textContent = "Buscar solución";
      setMessage($("crack-message"), result.difference === 0 ? "Solución exacta encontrada." : "No hay solución exacta; se muestra la más cercana.", result.difference === 0 ? "success" : "");
    }, 0);
  });
}

function renderCrackResult(result, objective) {
  const exact = result.difference === 0;
  $("crack-title").textContent = exact ? "Objetivo alcanzado" : "Mejor aproximación";
  $("crack-result").textContent = result.result;
  $("crack-difference").textContent = exact ? "0" : `${objective - result.result > 0 ? "+" : ""}${objective - result.result}`;
  $("crack-steps").textContent = result.actions.length;

  const badge = $("crack-badge");
  badge.textContent = exact ? "Exacta" : "Cercana";
  badge.className = `status-badge ${exact ? "exact" : "close"}`;

  const history = $("crack-history");
  history.innerHTML = "";

  if (result.actions.length === 0) {
    const item = document.createElement("li");
    item.textContent = `El mejor resultado ya estaba entre los números iniciales: ${result.result}.`;
    history.appendChild(item);
    return;
  }

  result.actions.forEach((action) => {
    const item = document.createElement("li");
    item.textContent = action.toString();
    history.appendChild(item);
  });
}

function activateTab(tabName) {
  document.querySelectorAll(".tab-button").forEach((item) => {
    item.classList.toggle("active", item.dataset.tab === tabName);
  });
  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("active", panel.id === tabName);
  });
}

function setupTabs() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => activateTab(button.dataset.tab));
  });
}

function setCrackInputs(objective, inputs) {
  state.crackInputs = [...inputs];
  $("crack-objective").value = objective;
  renderInputArea("crack");
}

function solveGame() {
  const objective = Number($("play-objective").value);

  if (!validObjective(objective)) {
    setMessage($("play-setup-message"), "El objetivo debe ser un número entero entre 100 y 999.", "error");
    return;
  }

  if (state.playInputs.length !== INPUT_COUNT) {
    setMessage($("play-setup-message"), "Debes elegir exactamente 6 números.", "error");
    return;
  }

  setCrackInputs(objective, state.playInputs);
  activateTab("crack");
  // runCracker();
}

function init() {
  setupTabs();
  renderPicker("play-picker", (number) => addInput("play", number));
  renderPicker("crack-picker", (number) => addInput("crack", number));
  renderInputArea("play");
  renderInputArea("crack");
  renderGame();

  $("play-clear").addEventListener("click", () => clearInputs("play"));
  $("crack-clear").addEventListener("click", () => clearInputs("crack"));
  $("play-random").addEventListener("click", () => fillRandom("play"));
  $("crack-random").addEventListener("click", () => fillRandom("crack"));
  $("play-solve").addEventListener("click", solveGame);
  $("play-start").addEventListener("click", startGame);
  $("game-restart").addEventListener("click", restartGame);
  $("calculate-action").addEventListener("click", calculateGameAction);
  $("crack-start").addEventListener("click", runCracker);

  document.querySelectorAll(".operation-button").forEach((button) => {
    button.addEventListener("click", () => selectOperation(button.dataset.operation));
  });

  fillRandom("play");
  state.crackInputs = [...state.playInputs];
  $("crack-objective").value = $("play-objective").value;
  renderInputArea("crack");
}

init();
