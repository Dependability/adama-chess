(function($){
})(RxHTML);




 if ((iterate _chessBoard where piece.pieceInfo == PieceType::King && piece.color != currentPlayer limit 1)[0] as kingSquare) {
    if ((iterate _chessBoard where piece.pieceInfo != PieceType::None && piece.color == currentPlayer && isMoveValid(rank, file, kingSquare.rank, kingSquare.file) limit 1).size() > 0) {
            if (kingCanMove(kingSquare)) {
                return true;
            }


        

    }
}