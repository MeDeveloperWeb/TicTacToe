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

    const removePlayer = (marker) => {
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

    const removeAll = () => {
        players.length = 0;
    }


    return {
        addPlayer,
        removePlayer,
        getPlayerFromMarker,
        getPlayerFromIndex,
        getIndexofPlayer,
        size,
        removeAll,
    }
})();

const ticTacToeGameBoard = (() => {
    let board = [];

    const createGameBoard = (n) => board = new Array(n).fill("").map(() => new Array(n).fill(""));

    const printBoardOnConsole = () => {
        for (let r = 0; r < board.length; ++r) {
            let buffer = "";
            let bottomBuffer = "";
            for (let col = 0; c < board.length; ++c) {
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

    const isMoveValid = (row, col) => row < board.length && row >= 0 && col < board.length && col >= 0 && !board[row][col];

    const makeMove = ({row, col}, marker) => {
        if (!isMoveValid(row, col)) throw new Error("Invalid Move!");

        board[row][col] = marker;
    }

    const getWinningSequence = (marker) => {
        // v => vertical, h => horizontal, d1 => diagonal 00 -> nn, d2 => diagonal 0n -> n0
        let vWin = true, hWin = true, d1Win = true, d2Win = true;

        const vSeq = [], hSeq = [], d1Seq = [], d2Seq = [];

        for (let row = 0; row < board.length; ++row) {

            for (let col = 0; col < board.length; ++col) {
                if (vWin && marker === board[col][row]) vSeq.push({row: col, col: row});
                else vWin = false;

                if (hWin && marker === board[row][col]) hSeq.push({row, col});
                else hWin = false;



                if (d1Win && row === col) {
                    if (board[row][col] === marker) d1Seq.push({row, col}); 
                    else d1Win = false;
                }

                if (d2Win && row === board.length - 1 - col) {
                    if (board[row][col] === marker) d2Seq.push({row, col}); 
                    else d2Win = false;
                }

                if (!(vWin || hWin || d1Win || d2Win)) break;

            }

            if (hWin) 
                return hSeq;
            
            if (vWin) 
                return vSeq;

            hWin = vWin = true;

            hSeq.length = vSeq.length = 0;
        }

        if (d1Win) 
            return d1Seq;

        if (d2Win) 
            return d2Seq; 

        return null;
    }

    const isGameOver = () => {
        for (let r in board) 
                for (let c in board[r])
                    if (!board[r][c]) return false;
        return true;
    }

    return {
        createGameBoard,
        printBoardOnConsole,
        makeMove,
        getWinningSequence,
        isGameOver
    };

})();

const ticTacToeGameDisplay = ((doc) => {
    const createGameBoard = (board, n = 3) => {
        board.replaceChildren();
        board.style.gridTemplateRows = `repeat(${n}, 1fr)`;

        for (let i = 0; i < n; ++i) {
            const row = doc.createElement('div');
            row.setAttribute("class", "row");
            row.style.gridTemplateColumns = `repeat(${n}, 1fr)`
            
            for (let j = 0; j < n; ++j) {
                const col = doc.createElement('div');
                col.setAttribute("data-row", i);
                col.setAttribute("data-col", j);
                col.setAttribute("class", "col");
                row.appendChild(col);
            }
            board.appendChild(row);
        }
    }

    const highlightCurrMovePlayer = (marker) => {
        const activePlayerEl = doc.querySelector('.active');

        doc.querySelector(`[data-marker=${marker}]`).appendChild(activePlayerEl);
    }

    const createPlayerEl = (marker, name = "") => {
        const input = doc.createElement('input');
        input.setAttribute('id', "player"+marker);
        input.setAttribute('required', 'true');
        input.value = name;
        
        const label = doc.createElement('label');
        label.setAttribute('for', "player"+marker);
        label.innerText = 'Player ' + marker;

        const delBtn = doc.createElement('i');
        delBtn.setAttribute('class', 'fa-solid fa-trash removePlayer');

        const player = doc.createElement('div');
        player.setAttribute('class', 'player textInput');
        player.setAttribute('data-marker', marker);


        player.appendChild(delBtn);
        player.appendChild(label);
        player.appendChild(input);

        return player;

    }

    const addPlayer = (container, marker, name = "") => {
        const player = createPlayerEl(marker, name);
        container.appendChild(player);
    }

    const showError = (message) => {
        const errorModal = doc.querySelector(".errors");
        errorModal.querySelector(".msgCont").textContent = message;
        errorModal.showModal();
    }

    const showMove = (el, marker) => el.innerText = marker;

    const highlightCell = ({row, col}) => {
        doc.querySelector(`[data-row="${row}"][data-col="${col}"]`).classList.add("winningCell");
    }

    const highlightWinner = (marker) => {
        const crown = doc.querySelector(".gameWinner");
        crown.style.display = "inherit";
        doc.querySelector(`[data-marker=${marker}]`).appendChild(crown);

    }

    const resetHighlights = () => {
        doc.querySelector(".gameWinner").style.display = "none";
        const activePlayerEl = doc.querySelector('.active');
        doc.body.appendChild(activePlayerEl);
    }

    return {
        createGameBoard,
        highlightCurrMovePlayer,
        addPlayer,
        showError,
        showMove,
        highlightCell,
        highlightWinner,
        resetHighlights
    }

})(document);

const TicTacToeGameController = ((doc) => {

    const playerCont = doc.querySelector(".playerCont");
    const addPlayerFormCont = doc.querySelector(".playerFormCont");

    const boardCont = doc.querySelector(".boardCont");

    let gameBoardSize = 3;
    let gameOngoing = false;
    let moveCount = 0;

    // Initial board creation and player Addition
    ticTacToePlayer.addPlayer('X');
    ticTacToePlayer.addPlayer('O');
    ticTacToeGameDisplay.createGameBoard(boardCont, gameBoardSize);

    /**
     * Show Form for Adding Player
     */
    doc.querySelector(".showPlayerForm").addEventListener('click', () => {
        if (gameOngoing) {
            ticTacToeGameDisplay.showError("Can't Add Player While Game in Progress!");
            return;
        }

        addPlayerFormCont.showModal();
    });

    /**
     * Change Player Name From Input
     */
    doc.querySelector(".playerCont").addEventListener('change', (e) => {
        const input = e.target.closest('input');

        if (!input) return;
        ticTacToePlayer.getPlayerFromMarker(input.parentElement.dataset.marker).name = input.value;

    });

    doc.querySelector(".playerCont").addEventListener('pointerdown', (e) => {
        if (e.target.classList.contains("removePlayer")) {
            if (ticTacToePlayer.size() > 2) {
                doc.querySelector(".playerCont").removeChild(e.target.parentElement);
                ticTacToePlayer.removePlayer(e.target.parentElement.dataset.marker);
                return;
            }
            ticTacToeGameDisplay.showError("Minimum of two Player Required!!");

        }
    });
    /**
     * Close Form for Adding Player
     */
    doc.querySelector(".closePlayerFormBtn").addEventListener('click',  () => addPlayerFormCont.close());

    /**
     * Handle Add Player Form Submission
     */
    addPlayerFormCont.querySelector("form").addEventListener('submit', (e) => {
        e.preventDefault();

        const name = addPlayerFormCont.querySelector("#playerName").value;
        const marker = addPlayerFormCont.querySelector("#playerMarker").value;

        if (marker.length !== 1) {
            ticTacToeGameDisplay.showError("Marker length shouldn't be greater than 1");
            return;
        }

        try {
            ticTacToePlayer.addPlayer(marker, name);
            ticTacToeGameDisplay.addPlayer(playerCont, marker, name);
        }
        catch (err) {
            ticTacToeGameDisplay.showError(err);
        }

        addPlayerFormCont.close();
    });

    /**
     * Handle Grid SIze from Text Input
     */
    doc.querySelector("#tttGridSizeText").addEventListener("change", (e) => {
        if (gameOngoing) {
            ticTacToeGameDisplay.showError("Can't Change Board Size While Game in Progress!");
            e.target.value = gameBoardSize;
            return;
        }

        if (e.target.value < 3) e.target.value = 3;
        else if (e.target.value > 10) e.target.value = 10;

        doc.querySelector("#tttGridSizeSlider").value = e.target.value;
        setBoardSize(e.target.value);

    });

    /**
     * Handle Grid SIze from Slider
     */
    doc.querySelector("#tttGridSizeSlider").addEventListener("change", (e) => {
        if (gameOngoing) {
            ticTacToeGameDisplay.showError("Can't Change Board Size While Game in Progress!");
            e.target.value = gameBoardSize;
            return;
        }

        doc.querySelector("#tttGridSizeText").value = e.target.value;
        setBoardSize(e.target.value);
    });

    /**
     * Start Game
     */
    doc.querySelector(".startGame").addEventListener("click", () => {
        ticTacToeGameBoard.createGameBoard(gameBoardSize);
        players = ticTacToePlayer.players;
        gameOngoing = true;
        ticTacToeGameDisplay.highlightCurrMovePlayer(ticTacToePlayer.getPlayerFromIndex(0).marker);

        toggleGameBtnView(true);
    });

    /**
     * Restart Game & reset all values
     */
    doc.querySelector(".reset").addEventListener("click", () => {
        // Reset values
        moveCount = 0;
        gameOngoing = false;

        //reset board values
        ticTacToeGameDisplay.createGameBoard(boardCont, gameBoardSize);

        toggleGameBtnView(false);

        ticTacToeGameDisplay.resetHighlights();

    });

    boardCont.addEventListener("click", (e) => {
        if (!gameOngoing) return; 

        const index = e.target.dataset;
        const currPlayer = ticTacToePlayer.getPlayerFromIndex(moveCount % ticTacToePlayer.size());

        try {
            ticTacToeGameBoard.makeMove(index, currPlayer.marker);

            ticTacToeGameDisplay.showMove(e.target, currPlayer.marker);
            playSound("move");

            const winningSeq = ticTacToeGameBoard.getWinningSequence(currPlayer.marker);
            if (!winningSeq) {
                if (ticTacToeGameBoard.isGameOver()) {
                    setTimeout(() => playSound("end"), 300);
                    return;
                }
                ++moveCount;
                ticTacToeGameDisplay.highlightCurrMovePlayer(ticTacToePlayer.getPlayerFromIndex(moveCount % ticTacToePlayer.size()).marker);
                return;
            }

            for (let index of winningSeq) ticTacToeGameDisplay.highlightCell(index);
            ticTacToeGameDisplay.highlightWinner(currPlayer.marker);
            setTimeout(() => playSound("win"), 300);


        } catch (error) {
            console.log(error);
        }
    });

    function toggleGameBtnView(set) {
        const setGame = doc.querySelector(".setGame");
        const resetGame = doc.querySelector(".resetGame");
        if (set) {
             // Show reset controls and hide set controls
            setGame.style.visibility = "hidden";
            setGame.style.maxHeight = "0px";
            resetGame.style.maxHeight = "none";
            resetGame.style.visibility = "visible";
            return;                                              

        }
        // Hide reset controls and show set controls
        setGame.style.visibility = "visible";
        setGame.style.maxHeight = "none";
        resetGame.style.maxHeight = "0px";
        resetGame.style.visibility = "hidden";
    }

    function setBoardSize (size) {
        ticTacToeGameDisplay.createGameBoard(boardCont, size);
        gameBoardSize = +size;
    };

    function playSound(e) {
        const sound = new Audio('media/'+e+".mp3");
        sound.play();
    }

    // Manage Error Modal Closing
    const errorModal = doc.querySelector(".errors");

    doc.querySelector(".errors .close").addEventListener("click", () => errorModal.close());

})(document)