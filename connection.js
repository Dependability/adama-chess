
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
let possibleMove = '';
const popup = document.querySelector(".pop-up");
const popupInner = document.querySelector(".pop-up .inner");

connection.start();
connection.wait_connected().then((result) => {
    console.log(result);
}, (err)=> {
    console.log(err)
})

startPage.querySelector('button').addEventListener('click', ()=> {
    startPage.classList.add('hidden');
    loading.classList.remove('hidden');
    user = document.querySelector('input').value;
    connection.DocumentCreate(user,"chess","first",null,{}, {
        success: function() {
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
    const moveList = move.split(" ");
    const fromPos = moveList[0];
    const toPos = moveList[1];
    const special = moveList.length == 3 ?  moveList[2]: "";
    movePiece(fromPos, toPos, special);
}

const pieceMap = {
    "dRook": './assets/rook_d.svg',
    "dKnight": './assets/knight_d.svg',
    "dBishop": './assets/bishop_d.svg',
    "dQueen": './assets/queen_d.svg',
    "dKing": './assets/king_d.svg',
    "dPawn": './assets/pawn_d.svg',
    "wRook": './assets/rook_l.svg',
    "wKnight": './assets/knight_l.svg',
    "wBishop": './assets/bishop_l.svg',
    "wQueen": './assets/queen_l.svg',
    "wKing": './assets/king_l.svg',
    "wPawn": './assets/pawn_l.svg',
}

function subscribeToTree() {
    tree.subscribe({lastMove: visualMove, playerColor: (color)=>{currentPlayer = color;console.log(color)}, currentPlayer: (player)=>{ 
        playerTurn= player == 'w' ? 'w' : 'd';
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
        console.log(state)
        if (state == 'waiting') {
            loading.classList.remove('hidden');
        }
        if (state == 'game') {
            loading.classList.add('hidden');
            mainGame.classList.remove('hidden');
            console.log(currentPlayer)
            // resetBoard();
            createBoard();
            initializeGame();
        }
        if (state == 'win') {
            popupInner.textContent = playerTurn == currentPlayer ? "You win by checkmate!" : "You lost...";  
            setTimeout(()=> {
                popup.classList.remove('hidden');

            }, 500);
        }
        if (state == 'draw') {
            popupInner.textContent = "Stalemate - Draw";
            setTimeout(()=> {
                popup.classList.remove('hidden');

            }, 500);
        }
    },possibleMove: (possible)=> {
        possibleMove = possible;
        console.log(possibleMove)
    }, someString: (strsad)=> {
        console.log(strsad);
    }})
}


function connectToTree(person) {
    docConnect = connection.ConnectionCreate(person, "chess", "first", {}, {
        next: function(payload) {
            if (payload['delta']) {
                let delta = payload.delta
                if ('data' in delta) {
                    let data = delta.data;
                    tree.update(data);
                }
            }
            
        },
        complete: function() {
            console.log("Data complete")
        },
        failure: function(reason) {
            console.log(reason)
            if (reason == 625676) {
                disconnect();
            }
        }
    }) 
}

function disconnect() {
    popup.classList.remove('hidden');
    docConnect.end();
    setTimeout(()=> {
        popup.classList.add('hidden');
        mainGame.classList.add('hidden');
        startPage.classList.remove('hidden');
        //Clear board
        tree.nuke();
        while (gameBoard.length) {
            gameBoard.pop();
        }
        gameContainer.innerHTML = '';
        popup.classList.add('hidden');
    }, 5000)
}



function createBoard() {
    const topTurn = document.querySelectorAll('.turn')[0]
    const bottomTurn = document.querySelectorAll('.turn')[1]
    if (currentPlayer == 'd') {
        whiteTurn = topTurn; 
        blackTurn = bottomTurn;
        blackTurn.classList.add('you');
        

    } else {
        whiteTurn = bottomTurn;
        blackTurn = topTurn;
        whiteTurn.classList.add('you');
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
                
                if (squareInfo[0] == currentPlayer && selectedPiece == null && currentPlayer == playerTurn)  {
                    e.currentTarget.classList.add('selected');
                    selectedPiece = {piece: squareInfo.substring(1), square: [file ,rank], piece:e.currentTarget}
                    console.log(selectedPiece)
                    return
                }

                if (selectedPiece) {
                    selectedPiece.piece.classList.remove('selected');
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
    
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            const square = gameBoard[row][column];
            
            if (square != "None") {
                const pieceDiv = document.createElement('div')
                const image = document.createElement('img');
                image.src = pieceMap[square]
                image.setAttribute('draggable', false);
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

function movePiece(from, to, special="") {
    
    // Implement keeping track of gained pieces
    const fromRank = +from[0]
    const fromFile = +from[1]
    const toRank = +to[0]
    const toFile = +to[1]
    console.log(fromRank)
    
    const fromPiece = gameBoard[fromRank][fromFile]
    const toPiece = gameBoard[toRank][toFile]
    console.log(fromRank, fromFile, toRank, toFile)
    const fromName = String.fromCharCode(fromFile + 97) + Math.abs(8 - fromRank);
    const toName = String.fromCharCode(toFile + 97) + Math.abs(8 - toRank);
    const oldPiece = gameContainer.querySelector(`[square=${fromName}] div`);
    const newPiece = gameContainer.querySelector(`[square=${toName}] div`);
    const fromSquare = gameContainer.querySelector(`[square=${fromName}]`);
    const toSquare = gameContainer.querySelector(`[square=${toName}]`);

    
    if (special == "castle") {
        gameBoard[toRank][toFile] = "None";
        gameBoard[fromRank][fromFile] = "None";
        if (toFile - fromFile > 0) {
            
            gameBoard[fromRank][6] = toPiece;
            gameBoard[fromRank][5] = fromPiece;
            toSquare.innerHTML = '';
            fromSquare.innerHTML = '';
            const kingPlace = "g" + Math.abs(8 - fromRank);
            const castlePlace = "f" + Math.abs(8 - fromRank);
            gameContainer.querySelector(`[square=${kingPlace}]`).appendChild(oldPiece);
            gameContainer.querySelector(`[square=${castlePlace}]`).appendChild(newPiece);
        } else {

            gameBoard[fromRank][2] = toPiece;
            gameBoard[fromRank][3] = fromPiece;
            toSquare.innerHTML = '';
            fromSquare.innerHTML = '';
            const kingPlace = "c" + Math.abs(8 - fromRank);
            const castlePlace = "d" + Math.abs(8 - fromRank);
            gameContainer.querySelector(`[square=${kingPlace}]`).appendChild(oldPiece);
            gameContainer.querySelector(`[square=${castlePlace}]`).appendChild(newPiece)


        }

    } else if (special == "promotion") {
        const newPieceType = fromPiece[0] + "Queen"
        gameBoard[toRank][toFile] = newPieceType;
        gameBoard[fromRank][fromFile] = "None";
        toSquare.innerHTML = '';
        oldPiece.children[0].src = pieceMap[newPieceType];
        toSquare.appendChild(oldPiece);

    } else if (special == "enpassant") {
        gameBoard[toRank][toFile] = fromPiece;
        const multiplier = currentPlayer == 'w' ? 1 : -1;
        const takenPawnName = String.fromCharCode(toFile + 97) + (Math.abs(8 - toRank) -multiplier);
        gameBoard[toRank+multiplier][toFile] = "None";
        gameBoard[fromRank][fromFile] = "None";
        toSquare.innerHTML = '';
        toSquare.appendChild(oldPiece);
        gameContainer.querySelector(`[square=${takenPawnName}]`).innerHTML = '';
    } else  {
        //Move square from old to empty
        gameBoard[toRank][toFile] = fromPiece
        gameBoard[fromRank][fromFile] = "None";
        toSquare.innerHTML = '';
        toSquare.appendChild(oldPiece);
        console.log(oldPiece);
    }
    
}


