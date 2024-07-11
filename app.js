var origBoard;
const huPlayer = 'O';
const aiPlayer = 'X';
const winCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [6, 4, 2]
];

const cells = document.querySelectorAll('.cell');
let multiplayer = false;
let currentPlayer = huPlayer;
let aiDifficulty = 'hard'; // Default difficulty

let playerOScore = 0;
let playerXScore = 0;
let ties = 0;

// Sound effects
const clickSound = new Audio('sounds/click.mp3');
const winSound = new Audio('sounds/win.mp3');
const loseSound = new Audio('sounds/lose.mp3');
const tieSound = new Audio('sounds/tie.wav');

document.querySelector("#buttons").addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' || event.target.tagName === 'I') {
        const mode = event.target.closest('button').getAttribute('data-mode');
        if (mode === 'computer') {
            openDifficultyModal();
        } else {
            startGame(mode);
        }
    }
});

document.querySelector("#difficultyModal .close").addEventListener('click', closeDifficultyModal);
document.querySelector("#difficultyModal").addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        aiDifficulty = event.target.getAttribute('data-difficulty');
        closeDifficultyModal();
        startGame('computer');
    }
});

function openDifficultyModal() {
    document.getElementById('difficultyModal').style.display = 'block';
}

function closeDifficultyModal() {
    document.getElementById('difficultyModal').style.display = 'none';
}

function startGame(mode) {
    document.querySelector(".endgame").style.display = "none";
    origBoard = Array.from(Array(9).keys());
    currentPlayer = huPlayer;
    multiplayer = (mode === 'multiplayer');
    for (var i = 0; i < cells.length; i++) {
        cells[i].innerText = '';
        cells[i].style.removeProperty('background-color');
        cells[i].addEventListener('click', turnClick, false);
    }
}

function turnClick(square) {
    clickSound.play();
    if (typeof origBoard[square.target.id] == 'number') {
        turn(square.target.id, currentPlayer)
        if (!checkWin(origBoard, currentPlayer) && !checkTie()) {
            if (multiplayer) {
                currentPlayer = currentPlayer == huPlayer ? aiPlayer : huPlayer;
            } else {
                if (!checkWin(origBoard, huPlayer) && !checkTie()) turn(bestSpot(), aiPlayer);
            }
        }
    }
}

function turn(squareId, player) {
    origBoard[squareId] = player;
    document.getElementById(squareId).innerText = player;
    let gameWon = checkWin(origBoard, player)
    if (gameWon) gameOver(gameWon)
}

function checkWin(board, player) {
    let plays = board.reduce((a, e, i) =>
        (e === player) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of winCombos.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, player: player };
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
            gameWon.player == huPlayer ? "rgb(140, 140, 255)" : "#ff9c9c";
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player == huPlayer ? "You win!" : "You lose.");
    updateScore(gameWon.player);
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
    if (who === "You win!") {
        winSound.play();
    } else if (who === "You lose.") {
        loseSound.play();
    } else {
        tieSound.play();
    }
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    switch (aiDifficulty) {
        case 'easy':
            return emptySquares()[Math.floor(Math.random() * emptySquares().length)];
        case 'medium':
            return Math.random() < 0.5 ? minimax(origBoard, aiPlayer).index : emptySquares()[Math.floor(Math.random() * emptySquares().length)];
        case 'hard':
            return minimax(origBoard, aiPlayer).index;
    }
}

function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "#71ff71";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!")
        updateScore('tie');
        return true;
    }
    return false;
}

function minimax(newBoard, player) {
    var availSpots = emptySquares();

    if (checkWin(newBoard, huPlayer)) {
        return { score: -10 };
    } else if (checkWin(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    var moves = [];
    for (var i = 0; i < availSpots.length; i++) {
        var move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == aiPlayer) {
            var result = minimax(newBoard, huPlayer);
            move.score = result.score;
        } else {
            var result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
    }

    var bestMove;
    if (player === aiPlayer) {
        var bestScore = -10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = 10000;
        for (var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}

function updateScore(winner) {
    if (winner === huPlayer) {
        playerOScore++;
        document.getElementById('playerOScore').innerText = playerOScore;
    } else if (winner === aiPlayer) {
        playerXScore++;
        document.getElementById('playerXScore').innerText = playerXScore;
    } else {
        ties++;
        document.getElementById('ties').innerText = ties;
    }
}
