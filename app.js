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

document.querySelector("#buttons").addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON') {
        const mode = event.target.getAttribute('data-mode');
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
            gameWon = {index: index, player: player};
            break;
        }
    }
    return gameWon;
}

function gameOver(gameWon) {
    for (let index of winCombos[gameWon.index]) {
        document.getElementById(index).style.backgroundColor =
        gameWon.player == huPlayer ? "rgb(140, 140, 255)" : "#ff9c9c" ;
    }
    for (var i = 0; i < cells.length; i++) {
        cells[i].removeEventListener('click', turnClick, false);
    }
    declareWinner(gameWon.player == huPlayer ? "Player O wins!" : "Player X wins.");
    updateScore(gameWon.player);
}

function declareWinner(who) {
    document.querySelector(".endgame").style.display = "block";
    document.querySelector(".endgame .text").innerText = who;
}

function emptySquares() {
    return origBoard.filter(s => typeof s == 'number');
}

function bestSpot() {
    if (aiDifficulty === 'easy') {
        return randomSpot();
    } else if (aiDifficulty === 'medium') {
        return Math.random() < 0.5 ? randomSpot() : minimax(origBoard, aiPlayer).index;
    } else {
        return minimax(origBoard, aiPlayer).index;
    }
}

function randomSpot() {
    let availableSpots = emptySquares();
    return availableSpots[Math.floor(Math.random() * availableSpots.length)];
}

function checkTie() {
    if (emptySquares().length == 0) {
        for (var i = 0; i < cells.length; i++) {
            cells[i].style.backgroundColor = "#71ff71";
            cells[i].removeEventListener('click', turnClick, false);
        }
        declareWinner("Tie Game!")
        ties++;
        document.getElementById('ties').innerText = ties;
        return true;
    }
    return false;
}

function updateScore(winner) {
    if (winner === huPlayer) {
        playerOScore++;
        document.getElementById('playerOScore').innerText = playerOScore;
    } else {
        playerXScore++;
        document.getElementById('playerXScore').innerText = playerXScore;
    }
}

function minimax(newBoard, player) {
    var availSpots = emptySquares();

    if (checkWin(newBoard, huPlayer)) {
        return {score: -10};
    } else if (checkWin(newBoard, aiPlayer)) {
        return {score: 10};
    } else if (availSpots.length === 0) {
        return {score: 0};
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
    if(player === aiPlayer) {
        var bestScore = -10000;
        for(var i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        var bestScore = 10000;
        for(var i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }

    return moves[bestMove];
}


