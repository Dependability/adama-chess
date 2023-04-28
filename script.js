const gameContainer = document.querySelector(".game-container")
const letterMap = ["a","b","c","d","e","f","g","h"]
const gameBoard = []
let selectedPiece = null;
let currentPlayer = 'w';
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
                    if (squareInfo == "None") {
                        console.log(currentPlayer, "wants the",selectedPiece.piece, "on", selectedPiece.square, "to move to", cellPos)
                    } else {
                        console.log(currentPlayer, "wants the",selectedPiece.piece, "on", selectedPiece.square, "to take the", squareInfo.substring(1), 'on', cellPos)
                    }
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

initializeGame()