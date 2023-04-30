
const button = document.querySelector('.game-container');
const connection = new Adama.Connection(Adama.Production)
var tree = new AdamaTree();



function visualMove (move) {
    if (move == "") {
        return;
    }
    const [fromPos, toPos] = move.split(" ");
    movePiece(fromPos, toPos);
    console.log(move)
}

function subscribeToTree() {
    tree.subscribe({lastMove: visualMove})
}
let docConnect;
connection.start();
connection.wait_connected().then((result) => {
    console.log(result);
    connection.DocumentCreate("anonymous:alice","chess","first",null,{}, {
        success: function() {
            console.log("Document!")
            subscribeToTree();
            connectToTree();
            
        },
        failure: function(reason, more) {
            console.log(reason)
            if (reason == 667658 || reason == 130092) {
                subscribeToTree();
                connectToTree(true);
            }
        }
    })

    
}, (err)=> {
    console.log(err)
})

function connectToTree(person = false) {
    docConnect = connection.ConnectionCreate(person ? "anonymous:seyi" : "anonymous:alice", "chess", "first", {}, {
        next: function(payload) {
            console.log(payload)
            if (payload['delta']) {
                const delta = payload.delta
                if ('data' in delta) {
                    tree.update(delta.data);
                }
            }
            
        },
        complete: function() {
            console.log("Data complete")
        },
        failure: function(reason) {
            console.log(reason)
        }
    }) 
}



const gameContainer = document.querySelector(".game-container")
const letterMap = ["a","b","c","d","e","f","g","h"]
const gameBoard = []
let selectedPiece = null;
let currentPlayer = 'w';
let gameState = 'start';

for (let row = 0; row < 8; row++) {
    const rowArr = []
    for (let column = 0; column < 8; column++) {
        const cell = document.createElement('div')
        cell.setAttribute('square', letterMap[column] + (8 - row))
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
            const rank = 8 -    +cellPos[1]
            const squareInfo = gameBoard[rank][file] 
            
            if (squareInfo[0] == currentPlayer && selectedPiece == null)  {
                selectedPiece = {piece: squareInfo.substring(1), square: [file ,rank]}
                console.log(selectedPiece)
                return
            }

            if (selectedPiece) {
                console.log(selectedPiece.square)
                console.log([file, rank])
                docConnect.send('movePiece', {fromFile: selectedPiece.square[0], fromRank: +selectedPiece.square[1], toFile: file, toRank: rank}, {
                    success: function() {},
                    failure: function(why) {console.log(why)}
                })
                selectedPiece = null;
            }

            
        });

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
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const square = gameBoard[row][column];
            
            if (square != "None") {
                const pieceDiv = document.createElement('div')
                const image = document.createElement('img');
                image.src = pieceMap[square]
                pieceDiv.appendChild(image)
                console.log(`[square=${letterMap[column]}${8 - row}]`)
                gameContainer.querySelector(`[square=${letterMap[column]}${8 - row}]`).appendChild(pieceDiv)
            }

        }
    }
}

function sendMoveToServer() {
    docConnect.send('movePiece', {fromRank, fromFile, toRank, toFile}, {
        success: function() {},
        failure: function(why) {console.log(why)}
    })
}

function movePiece(from, to, castle=false) {
    
    // Implement keeping track of gained pieces
    const fromRank = +from[0]
    const fromFile = +from[1]
    const toRank = +to[0]
    const toFile = +to[1]
    console.log(fromRank)
    
    const fromPiece = gameBoard[fromRank][fromFile]
    const toPiece = gameBoard[toRank][toFile]
    console.log(fromRank, fromFile, toRank, toFile)

    //Move square from old to empty
    gameBoard[toRank][toFile] = fromPiece
    gameBoard[fromRank][fromFile] = "None"
    const fromName = String.fromCharCode(fromFile + 97) + Math.abs(8 - fromRank);
    const toName = String.fromCharCode(toFile + 97) + Math.abs(8 - toRank);
    const oldPiece = gameContainer.querySelector(`[square=${fromName}] div`)
    gameContainer.querySelector(`[square=${toName}]`).innerHTML = ''
    gameContainer.querySelector(`[square=${toName}]`).appendChild(oldPiece)
    
}

function switchTurn() {
    //check if player won, draw, or resign
    // if so change game state

    currentPlayer = currentPlayer == 'd' ? 'w' : 'd';
    // switch timer
    


}
initializeGame()

