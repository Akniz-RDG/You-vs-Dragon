// musica del juego
document.addEventListener("DOMContentLoaded", () => {
  const musica = document.getElementById("musica-fondo");
  const debeSonar = localStorage.getItem("musica-activada") === "true";

  if (musica && debeSonar) {
    musica.volume = 0.5;
    musica.play().catch(() => {
      console.log("El navegador bloqueó el autoplay. Música no reproducida.");
    });
    localStorage.removeItem("musica-activada");
  }
});

// Definimos  las variables iniciales de vida del jugador y del dragón
let playerHP = 100;
let dragonHP = 500;

// const significa que la variable no cambiará su valor una vez asignada
const healthDisplay = document.getElementById('player-health');
const dragonHealthDisplay = document.getElementById('dragon-health');
const timerBar = document.getElementById('timer-bar');

const dragonAnnounce = document.getElementById("dragon-announce");
const playerChoice = document.getElementById("player-choice");
const combatResult = document.getElementById("combat-result");

const blockBtn = document.getElementById('block-btn');
const dodgeBtn = document.getElementById('dodge-btn');
const skinBtn = document.getElementById('skin-btn');

let currentAttack = null;
let playerAction = null;
let isChoosing = false;

const dragonAttacks = [
  {
    name: "🐾 Ráfaga de Garras",
    type: "physical",
    description: "4 golpes de 2 de daño cada 0.5s",
    damageSequence: [2, 2, 2, 2],
  },
  {
    name: "🦴 Coletazo",
    type: "physical",
    description: "1 golpe de 10 de daño",
    damageSequence: [10],
  },
  {
    name: "🔥 Aliento de Fuego",
    type: "fire",
    description: "30 golpes de 1 de daño cada 0.1s",
    damageSequence: Array(30).fill(1),
  }
];

function updateHealth() {
  playerHP = Math.max(0, playerHP);
  healthDisplay.textContent = `${playerHP} / 100`;
  const fill = document.getElementById('player-health-fill');
  fill.style.width = (playerHP / 100) * 100 + "%";
}

function updateDragonHealth() {
  dragonHP = Math.max(0, dragonHP);
  dragonHealthDisplay.textContent = `${dragonHP} / 500`;
  const fill = document.getElementById('dragon-health-fill');
  fill.style.width = (dragonHP / 500) * 100 + "%";
}

function executeAttack(attack) {
  let totalDamage = 0;
  let totalMitigated = 0;

  for (let i = 0; i < attack.damageSequence.length; i++) {
    let dmg = attack.damageSequence[i];

    if (playerAction === 'block' && i < 4) {
      totalMitigated += dmg / 2;
      dmg *= 0.5;
    } else if (playerAction === 'dodge' && i === 0) {
      totalMitigated += dmg;
      dmg = 0;
    } else if (playerAction === 'skin' && attack.type === 'fire') {
      totalMitigated += dmg;
      playerHP = Math.min(playerHP + dmg / 2, 100);
      dmg = 0;
    }

    totalDamage += dmg;
  }

  playerHP -= totalDamage;
  updateHealth();

  const dragonDamage = Math.floor(totalMitigated * 0.5);
  dragonHP -= dragonDamage;
  updateDragonHealth();

  combatResult.textContent = `💥 Recibiste ${Math.round(totalDamage)} de daño. 🐉 Le devolviste ${dragonDamage} al dragón.`;

  timerBar.style.transition = 'none';
  timerBar.style.width = '0%';

  playerAction = null;
  isChoosing = false;

  if (playerHP <= 0) {
    combatResult.textContent = "💀 ¡Has sido derrotado!";
    disableButtons();
    return;
  } else if (dragonHP <= 0) {
    combatResult.textContent = "🎉 ¡Derrotaste al dragón!";
    disableButtons();
    return;
  }

  setTimeout(startAttackSequence, 3000);
}

function disableButtons() {
  blockBtn.disabled = true;
  dodgeBtn.disabled = true;
  skinBtn.disabled = true;
}

function startTimerBar() {
  timerBar.style.transition = 'none';
  timerBar.style.width = '0%';
  setTimeout(() => {
    timerBar.style.transition = 'width 2s linear';
    timerBar.style.width = '100%';
  }, 50);
}

function startAttackSequence() {
  const attack = dragonAttacks[Math.floor(Math.random() * dragonAttacks.length)];
  currentAttack = attack;

  dragonAnnounce.textContent = `🐲 ${attack.name}: ${attack.description}`;
  playerChoice.textContent = `🤺 Aún no has elegido acción`;
  combatResult.textContent = ``;

  isChoosing = true;
  startTimerBar();

  setTimeout(() => {
    if (!playerAction) playerAction = 'none';
    executeAttack(attack);
  }, 2000);
}

blockBtn.onclick = () => {
  if (isChoosing) playerChoice.textContent = `🛡️ Usaste Bloqueo`;
  playerAction = 'block';
};

dodgeBtn.onclick = () => {
  if (isChoosing) playerChoice.textContent = `🤸 Usaste Esquivar`;
  playerAction = 'dodge';
};

skinBtn.onclick = () => {
  if (isChoosing) playerChoice.textContent = `🐉 Usaste Piel de Dragón`;
  playerAction = 'skin';
};

updateHealth();
updateDragonHealth();
startAttackSequence();
