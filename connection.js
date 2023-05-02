
const button = document.querySelector('.game-container');
const connection = new Adama.Connection(Adama.Production)
var tree = new AdamaTree();

const gameContainer = document.querySelector(".game-container");
const mainGame = document.querySelector('.main-game');
const startPage = document.querySelector('.start-page');
const loading = document.querySelector('.loading');
let docConnect;
let whiteTurn;
let blackTurn;
let user;
connection.start();
connection.wait_connected().then((result) => {
    console.log(result);
}, (err)=> {
    console.log(err)
})

startPage.querySelector('button').addEventListener('click', ()=> {
    startPage.classList.add('hidden');
    mainGame.classList.remove('hidden');
    user = document.querySelector('input').value;
    connection.DocumentCreate(user,"chess","first",null,{}, {
        success: function(anything) {
            console.log(anything)
            subscribeToTree();
            connectToTree(user);
            
        },
        failure: function(reason) {
            if (reason == 667658 || reason == 130092) {
                subscribeToTree();
                connectToTree(user);
            }
        }
    })

})


const letterMap = ["a","b","c","d","e","f","g","h"]
const gameBoard = []
let selectedPiece = null;
let playerTurn;
let currentPlayer = 'd';
let updateThing = document.querySelector(".lastPos");
let gameState = 'start';

function visualMove (move) {
    if (move == "") {
        return;
    }
    const [fromPos, toPos] = move.split(" ");
    movePiece(fromPos, toPos);
}

function subscribeToTree() {
    tree.subscribe({lastMove: visualMove, playerColor: (color)=>{currentPlayer = color;console.log(color)}, currentPlayer: (player)=>{ 
        playerTurn=player;
        if (whiteTurn == undefined) {
            return;
        } 
        if (playerTurn == 'w') {
            whiteTurn.classList.add('selected');
            blackTurn.classList.remove('selected');
        } else {
            blackTurn.classList.add('selected');
            whiteTurn.classList.remove('selected');
        }

        
    }, gameState: (state)=>{
        if (state == 'waiting') {
            loading.classList.remove('hidden');
        }
        if (state == 'game') {
            loading.classList.add('hidden');
            gameContainer.classList.remove('hidden');
            mainGame.classList.remove('hidden');
            console.log(currentPlayer)
            // resetBoard();
            createBoard();
            initializeGame();
        }
    }})
}


function connectToTree(person) {
    docConnect = connection.ConnectionCreate(person, "chess", "first", {}, {
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




function createBoard() {
    const topTurn = document.querySelectorAll('.turn')[0]
    const bottomTurn = document.querySelectorAll('.turn')[1]
    if (currentPlayer == 'd') {
        whiteTurn = topTurn; 
        blackTurn = bottomTurn;
        

    } else {
        whiteTurn = bottomTurn;
        blackTurn = topTurn;
    }

        whiteTurn.children[0].textContent = 'White';
        blackTurn.children[0].textContent = 'Black';
        whiteTurn.classList.add('white','selected');
        blackTurn.classList.add('black');

    for (let row = 0; row < 8; row++) {
        const rowArr = []
        for (let column = 0; column < 8; column++) {
            const cell = document.createElement('div')
            // For future customization
            console.log(currentPlayer)
            let squareNotation = letterMap[column] + (8 - row)
            if (currentPlayer == 'd') {
                squareNotation = letterMap[7 - column] + (row + 1);
            }
            cell.setAttribute('square', squareNotation)
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
    drawBoard();
    
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


