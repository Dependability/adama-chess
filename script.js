/*
    May need to change code to reflect the following:
        The user should join and either make a new game, or join an existing game.
        When the player makes a move, check with the server to see if it is valid,
        if it is, then do the move and switch ON SERVER
        Only enable movement if it is the user's turn

*/

const gameContainer = document.querySelector(".game-container")
const letterMap = ["a","b","c","d","e","f","g","h"]
const gameBoard = []
let selectedPiece = null;
let currentPlayer = 'w';
let gameState = 'start';

for (let row = 8; row >= 1; row--) {
    const rowArr = []
    for (let column = 0; column < 8; column++) {
        const cell = document.createElement('div')
        cell.setAttribute('square', letterMap[column] + row)
        cell.classList.add('cell')
        if (row % 2 == 0) {
            if (column % 2 == 1) {
                cell.classList.add('black')
            }
        } else {
            if (column % 2 == 0) {
                cell.classList.add('black')
            }
        }
        rowArr.push("None")
        cell.addEventListener('click', (e)=> {
            const cellPos = e.currentTarget.getAttribute('square')
            const file = cellPos.charCodeAt(0) - 97
            const rank = 8 - +cellPos[1]
            const squareInfo = gameBoard[rank][file] 
            
            if (squareInfo[0] == currentPlayer && selectedPiece == null)  {
                selectedPiece = {piece: squareInfo.substring(1), square: cellPos}
                console.log(selectedPiece)
                return
            }
            if (selectedPiece) {
                // If square chosen has  piece
                // validate move if square is not player's square (Unless castle*)
                if (squareInfo[0] !== currentPlayer ) {
                    //start game if this is first move
                    if (gameState == 'start') {
                        gameState = 'play'
                        timerStart = setInterval(()=> {
                            if (whiteTimer <= 0 || blackTimer <= 0) {
                                gameState = 'end'
                                clearInterval(timerStart)
                                return;
                            }
                            whiteVisualTimer.textContent = formatSeconds(whiteTimer);
                            blackVisualTimer.textContent = formatSeconds(blackTimer);
                    
                            if (currentPlayer == 'w') {
                                whiteTimer -= .1
                            } else {
                                blackTimer -= .1
                            }
                    
                        },100)
                    }
                    movePiece(selectedPiece.square, cellPos)
                    switchTurn()
                    // if (squareInfo == "None") {
                    //     console.log(currentPlayer, "wants the",selectedPiece.piece, "on", selectedPiece.square, "to move to", cellPos)
                    //     movePiece(selectedPiece.square, cellPos)
                    // } else {
                    //     console.log(currentPlayer, "wants the",selectedPiece.piece, "on", selectedPiece.square, "to take the", squareInfo.substring(1), 'on', cellPos)
                    //     movePiece(selectedPiece.square, cellPos)
                    // }
                }  else {
                    console.log("That is your piece!")
                }
                
                selectedPiece = null
                

            }
        })
        gameContainer.appendChild(cell)
    }
    gameBoard.push(rowArr)
}

function initializeGame(){
    const topRow = ["dRook", "dKnight","dBishop","dQueen","dKing","dBishop","dKnight","dRook"]
    const bottomRow = ["wRook", "wKnight","wBishop","wQueen","wKing","wBishop","wKnight","wRook"]
    const blackPawnRow = ["dPawn","dPawn","dPawn","dPawn","dPawn","dPawn","dPawn","dPawn"]
    const whitePawnRow = ["wPawn", "wPawn", "wPawn", "wPawn", "wPawn", "wPawn", "wPawn", "wPawn"]
    gameBoard[0] = topRow
    gameBoard[1] = blackPawnRow
    gameBoard[6] = whitePawnRow
    gameBoard[7] = bottomRow
    drawBoard()
    console.log(gameBoard)
    
}

function drawBoard() {
    const pieceMap = {
        "dRook": './assets/rook_d.png',
        "dKnight": './assets/knight_d.png',
        "dBishop": './assets/bishop_d.png',
        "dQueen": './assets/queen_d.png',
        "dKing": './assets/king_d.png',
        "dPawn": './assets/pawn_d.png',
        "wRook": './assets/rook_l.png',
        "wKnight": './assets/knight_l.png',
        "wBishop": './assets/bishop_l.png',
        "wQueen": './assets/queen_l.png',
        "wKing": './assets/king_l.png',
        "wPawn": './assets/pawn_l.png',
    }
    const letterMap = ["h","g","f","e","d","c","b","a"]
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const square = gameBoard[row][column];
            
            if (square != "None") {
                const pieceDiv = document.createElement('div')
                const image = document.createElement('img');
                image.src = pieceMap[square]
                pieceDiv.appendChild(image)
                gameContainer.querySelector(`[square=${letterMap[column]}${8 - row}]`).appendChild(pieceDiv)
            }

        }
    }
}

function movePiece(from, to, castle=false) {
    
    // Implement keeping track of gained pieces

    const fromRank = 8 - +from[1]
    const fromFile = from.charCodeAt(0) - 97
    const toRank = 8 - +to[1]
    const toFile = to.charCodeAt(0) - 97
    const fromPiece = gameBoard[fromRank][fromFile]
    const toPiece = gameBoard[toRank][toFile]

    //Move square from old to empty
    gameBoard[toRank][toFile] = fromPiece
    gameBoard[fromRank][fromFile] = "None"
    const oldPiece = gameContainer.querySelector(`[square=${from}] div`)
    gameContainer.querySelector(`[square=${to}]`).innerHTML = ''
    gameContainer.querySelector(`[square=${to}]`).appendChild(oldPiece)
}

function switchTurn() {
    //check if player won, draw, or resign
    // if so change game state

    currentPlayer = currentPlayer == 'd' ? 'w' : 'd';
    // switch timer
    


}
initializeGame()

