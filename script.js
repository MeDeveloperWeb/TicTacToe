const ticTacToePlayer = (() => {
    const players = [];

    const player = (playerMarker, playerName = "") => {
        let name = playerName ? playerName : `Player ${playerMarker}`;
        const marker = playerMarker;
        
        return {
            name,
            marker,
        }
    };

    const addPlayer = (marker, name = "") => {
        try {
            getIndexofPlayer(marker);
        } catch (error) {
            players.push(player(marker, name));
            return;
        }
        throw new Error(`Player with marker ${marker} already exists !!`);
    }

    const removePlayer= (marker) => {
        const i = getIndexofPlayer(marker);
        const [player] = players.splice(i, 1);
        return `Removed ${player.name} from players list!`;
    }

    const getPlayerFromMarker = (marker) => players[getIndexofPlayer(marker)];

    const getPlayerFromIndex = (i) => players[i];

    const getIndexofPlayer = (marker) => {
        for (let i in players) 
            if (players[i].marker === marker) return i;

        throw new Error(`Player with marker ${marker} doesn't exist !!`);
    }

    const size = () => players.length;

    const setPlayers = () => {
        if (size() === 0) addPlayer('X'), addPlayer('O');

        else {
            try {
                addPlayer('X');
            }
            catch (error) {
                addPlayer('O');
            }
        }
    }

    const removeAll = () => {
        players.length = 0;
    }

    return {
        addPlayer,
        removePlayer,
        getPlayerFromMarker,
        getPlayerFromIndex,
        getIndexofPlayer,
        setPlayers,
        size,
        removeAll
    }
    
})();

const ticTacToeGameController = (() => {
    let board = [];

    let moveCtr = 0;

    

    const resetBoard = () => {
        board.length = 0;
        ticTacToePlayer.removeAll();
        moveCtr = 0;
        ongoing = false;
    }

    const createGameBoard = (n) => new Array(n).fill("").map(() => new Array(n).fill(""));

    const start = (n = 3) => {
        resetBoard();

        if (n < 3) throw new Error("Invalid Size");

        board = createGameBoard(n);

        // If no players are added
        if (ticTacToePlayer.size() < 2) ticTacToePlayer.setPlayers();

        ongoing = true;

        return board;
    };

    const printBoard = () => {
        for (let r = 0; r < board.length; ++r) {
            let buffer = "";
            let bottomBuffer = "";
            for (let c = 0; c < board.length; ++c) {
                buffer += board[r][c];
                
                if (r !== board.length - 1) bottomBuffer += "___"
                
                if (c === board.length - 1) {
                    console.log(buffer);
                    console.log(bottomBuffer);
                }
                else buffer += " | ";
            }
        }
    }

    const getCurrMovePlayer = () => ticTacToePlayer.getPlayerFromIndex(moveCtr % ticTacToePlayer.size());

    const isMoveValid = (row, col) => row < board.length && row >= 0 && col < board.length && col >= 0 && !board[row][col];

    const makeMove = (row, col) => {
        if (gameOver().bool) throw new Error("Game Already Over!")
        if (!isMoveValid(row, col)) throw new Error("Invalid Move!");

        board[row][col] = getCurrMovePlayer().marker;
        moveCtr++;

        return board[row][col];
    }

    const getWinner = () => {
        // v => vertical, h => horizontal, d1 => diagonal 00 -> nn, d2 => diagonal 0n -> n0
        let vWin = true, hWin = true, d1Win = true, d2Win = true;

        // Centre Symbol in Matrix is the symbol to compare for diagonal win
        const dMove = board[Math.floor(board.length/2)][Math.floor(board.length/2)];

        for (let r = 0; r < board.length; ++r) {
            const vMove = board[0][r];
            const hMove = board[r][0];

            for (let c = 0; c < board.length; ++c) {
                if (vWin && !(vMove === board[c][r])) vWin = false;

                if (hWin && !(hMove === board[r][c])) hWin = false;

                if (d1Win && r === c && !(board[r][c] === dMove)) d1Win = false;

                if (d2Win && r === board.length - 1 - c && !(board[r][c] === dMove)) d2Win = false;

                if (!(vWin || hWin || d1Win || d2Win)) break;

            }

            if (hWin && hMove) 
                return ticTacToePlayer.getPlayerFromMarker(hMove).name;
            
            if (vWin && vMove) 
                return ticTacToePlayer.getPlayerFromMarker(vMove).name;

            hWin = vWin = true;
        }

        if (dMove && (d1Win || d2Win)) 
            return ticTacToePlayer.getPlayerFromMarker(dMove).name;


        throw new Error("No winner!")
    }

    const gameOver = () => {
        try {
            return {bool: true, winner: getWinner()};
        } catch (error) {
            for (let r in board) 
                for (let c in board[r])
                    if (!board[r][c]) return {bool: false, winner: null};
                    

            return {bool: true, winner: null};
        }
    }

    return {
        resetBoard,
        start,
        printBoard,
        getCurrMovePlayer,
        makeMove,
        getWinner,
        gameOver
    };

})();

const DOMFunctions = ((doc) => {
    const createGameBoard = (board, n = 3) => {
        board.replaceChildren();

        for (let i = 0; i < n; ++i) {
            const row = doc.createElement('div');
            row.setAttribute("id", "row" + i);
            row.setAttribute("class", "row");
            
            for (let j = 0; j < n; ++j) {
                const col = doc.createElement('div');
                col.setAttribute("id", "col"+ j);
                col.setAttribute("class", "col");
                row.appendChild(col);
            }
            board.appendChild(row);
        }
    }

    const highlightCurrMovePlayer = () => {
        const players = doc.querySelectorAll(".player");

        const activePlayerEl = doc.querySelector('.active');

        const currPlayer = ticTacToeGameController.getCurrMovePlayer();
        const currPlayerIndex = ticTacToePlayer.getIndexofPlayer(currPlayer.marker);

        players[currPlayerIndex].appendChild(activePlayerEl);
    }

    const createPlayerEl = () => {
        
    }

    const addPlayer = (container) => {
        const player = doc.createElement('div');
        player.appendChild('input')
    }

    return {
        createGameBoard,
        highlightCurrMovePlayer
    }

})(document);

const DOMEvents = ((doc) => {
    const boardCont = doc.querySelector(".boardCont");

    boardCont.onclick = (e) => {
        try {
            // Make Move
            const move = ticTacToeGameController.makeMove(+e.target.parentElement.id.substring(3), +e.target.id.substring(3));
            // Reflect Move
            e.target.innerText = move;
            
            // Store Result
            const result = ticTacToeGameController.gameOver();
            if (result.bool) {
                if (result.winner) alert(`Game Over. ${result.winner} wins!`);
                else alert("Game Over. It's a Tie!");
                return;
            }

            DOMFunctions.highlightCurrMovePlayer();
            
        }

        catch (error) {
            console.log(error);
            alert(error);
        }
    }

    DOMFunctions.createGameBoard(boardCont);
    ticTacToeGameController.start();

})(document);