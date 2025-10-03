let index = 10;
document.querySelector('.board').innerHTML  = Array(index**2).fill(null).map((_, i) => `<div class='c${i} cube'></div>`).join(" ")
document.querySelectorAll('.cube').forEach(cube => {
    cube.addEventListener('click', handleClick)
})
let grid = Array(index**2).fill(0)
document.querySelector('.board').style.gridTemplateColumns = `repeat(${index}, 1fr)`

const blueColor = 'lightblue'
const rgbBlue = 'rgb(173, 216, 230)'
const grennishColor = 'lightgreen'
const defaultColor = 'rgb(160, 160, 160)'
const redColor = 'salmon'
const rgbRed = 'rgb(250, 128, 114)'
const greenColor = 'lightgreen'
const rgbGreen = 'rgb(144, 238, 144)'

let disableBot = false
let disabledClick = false
function handleClick(e) {
    if (getComputedStyle(e.target).backgroundColor !== defaultColor) return
    if (disabledClick) return
    disabledClick = true
    const classNum = Number(e.target.classList[0].match(/\d+/g)[0])
    document.querySelector(`.c${classNum}`).style.backgroundColor = redColor
    grid[classNum] = 1
    document.querySelector(`.c${classNum}`).style.cursor = 'default'
    lower(classNum)
}

let lastPlayed = false
async function botTurn() {
    if (disableBot) return
    if (lastPlayed !== false) {document.querySelector(`.c${lastPlayed}`).style.backgroundColor = blueColor}
    let board = grid
    checkIfGameIsOver(grid)
    document.querySelector('.tr').innerHTML = 'Bot thinking...'
    await new Promise(x => setTimeout(x, 10))
    const legalMoves = getLegalMoves(board).sort((a,b) => {return Math.abs((a % index) - Math.floor(index/2)) - Math.abs((b % index) - Math.floor(index/2))})
    let bestMove;
    let bestScore = -Infinity
    for(let i=0;i<legalMoves.length;i++) {
        const move = legalMoves[i]
        board[move] = -1
        const score = minimax(7, false, board, -Infinity, Infinity)
        board[move] = 0
        if (score > bestScore) {
            bestScore = score
            bestMove = move
        }
    }
    document.querySelector(`.c${bestMove}`).style.backgroundColor = greenColor
    grid[bestMove] = -1
    if(checkIfGameIsOver(grid)) return
    document.querySelector('.tr').innerHTML = 'Your turn'
    lastPlayed = bestMove
    disabledClick = false
}

function checkIfGameIsOver(board) {
    const botWon = detect(-1,-1,-1,-1, board)
    const humanWon = detect(1,1,1,1,board)
    if (botWon) {
        document.querySelector('.tr').innerHTML = 'Bot won!'
        disabledClick = true
        disableBot = true
        botWon.forEach(v => document.querySelector(`.c${v}`).style.backgroundColor = greenColor)
        return true
    } else if (humanWon) {
        document.querySelector('.tr').innerHTML = 'You won!'
        disabledClick = true
        disableBot = true
        humanWon.forEach(v => document.querySelector(`.c${v}`).style.backgroundColor = 'black')
        return true
    }
    return false
}

function minimax(depth, isMaximizing, board, alpha, beta) {
    const botWin = detect(-1,-1,-1,-1, board)
    const humanWin = detect(1,1,1,1, board)
    if (botWin) return 500 + depth
    if (humanWin) return -1000 - depth
    if (depth === 0 || botWin || humanWin) return evaluateBoard(depth, board)

    const mid = (index-1) / 2
    const legalMoves = getLegalMoves(board).sort((a,b) => {return Math.abs((a % index) - mid) - Math.abs((b % index) - mid)})
    let bestScore = isMaximizing ? -Infinity : Infinity
    for(let i=0;i<legalMoves.length;i++) {
        const move = legalMoves[i]
        board[move] = isMaximizing ? -1 : 1
        const score = minimax(depth-1, isMaximizing ? false : true, board, alpha, beta)
        board[move] = 0
        if (isMaximizing) {
            bestScore = Math.max(score, bestScore)
            alpha = Math.max(alpha, bestScore)
            if (beta <= alpha) break;
        } else {
            bestScore = Math.min(score, bestScore)
            beta = Math.min(beta, score)
            if (beta <= alpha) break;
        }
    }
    return bestScore
}

function evaluateBoard(depth, board) {
    let score = 0
    let botThreats = 0
    let humanThreats = 0

    if (detect(-1,-1,-1,-1,board)) return 10000 + depth
    if (detect(1,1,1,1,board)) return -20000 - depth

    for (let i=0;i<board.length;i++) {
        const v = board[i];
        if (v === 0) continue;
        const r = (i / index) | 0, col= i -r * index
        if (col<=index-4) {
            const pat = [v, board[i+1], board[i+2], board[i+3]]
            const s = scorePattern(pat)
            score += s
            if (s === threatPlus) botThreats++
            if (s === threatMinus) humanThreats++
        }
        if (r<=index-4) {
            const pat = [v, board[i + index], board[i+index*2], board[i+index*3]]
            const s = scorePattern(pat)
            score += s
            if (s === threatPlus) botThreats++
            if (s === threatMinus) humanThreats++
        }
        if (r <=index-4 && col<=index-4) {
            const pat = [v, board[i+index+1], board[i+index*2+2], board[i+index*3+3]]
            const s = scorePattern(pat)
            score += s
            if (s === threatPlus) botThreats++
            if (s === threatMinus) humanThreats++
        }
        if (r >=3 && col<=index-4) {
            const pat = [v, board[i-index+1], board[i-2*index+2], board[i-3*index+3]]
            const s = scorePattern(pat)
            score += s
            if (s === threatPlus) botThreats++
            if (s === threatMinus) humanThreats++
        }
    }
    if (botThreats >= 2) score += botThreats * 400
    if (humanThreats >= 2) score -= humanThreats * 800
    score += getLegalMoves(board).length * 0.1
    return score + depth/30
}

const threatPlus = 14
const threatMinus = -50
function scorePattern(pat) {
    let bot = 0, human = 0
    for (let x of pat) {
        if (x === -1) bot++
        else if (x === 1) human++
    }
    if (bot === 4) return 100
    if (human === 4) return -500
    if (bot === 3 && human === 0) return threatPlus
    if (human === 3 && bot === 0) return threatMinus
    if (bot === 2 && human === 0) return 12
    if (human === 2 && bot === 0) return -24
    if (bot === 1 && human === 0) return 3
    if (human === 1 && bot === 0) return -6
    return 0
}

function detect(a, b, c, d, board) {
    for (let i=0;i<board.length;i++) {
        const v = board[i];
        if (v !== a) continue;
        const r = (i / index) | 0, col= i -r * index
        if (col<=index-4 && board[i+1] === b && board[i+2] === c && board[i+3] === d) return [i, i+1, i+2, i+3]
        if (r<=index-4) {
            const i1 = i + index, i2 = i1+index, i3 = i2+index
            if (board[i1] === b && board[i2] === c && board[i3] === d) return [i, i + index, i+index*2, i+index*3]
        }
        if (r <=index-4 && col<=index-4) {
            const i1 = i+index+1, i2 = i1 + index+1, i3 = i2 + index +1
            if (board[i1] === b && board[i2] === c && board[i3] === d) return [i, i+index+1, i+index*2+2, i+index*3+3]
        }
        if (r >=3 && col<=index-4) {
            const i1=i-index+1, i2 = i1 - index +1, i3 = i2-index+1
            if (board[i1] === b && board[i2] === c && board[i3] === d) return [i, i-index+1, i-2*index+2, i-3*index+3]
        }
    }
    return false
}


function getLegalMoves(board) {
    let moves = []
    for(let i= index**2-index; i < index**2; i ++) {
        if (board[i] === 0) {
            moves.push(i);
            continue
        }
        const pos = getHighestPos(i-index, board)
        if (pos !== false) moves.push(pos)
    }
    return moves
}

function getHighestPos(classNum, board) {
    if (classNum < 0) return false
    if (board[classNum] === 0) return classNum
    return getHighestPos(classNum-index, board)
}

async function lower(classNum) {
    await new Promise(x => setTimeout(x, 100))
    if (classNum+index >= index**2) {botTurn(); return}
    if (getComputedStyle(document.querySelector(`.c${classNum+index}`)).backgroundColor !== defaultColor) {botTurn(); return}
    document.querySelector(`.c${classNum}`).style.backgroundColor = defaultColor
    document.querySelector(`.c${classNum}`).style.cursor = 'pointer'
    grid[classNum] = 0
    document.querySelector(`.c${classNum+index}`).style.backgroundColor = redColor
    document.querySelector(`.c${classNum+index}`).style.cursor = 'default'
    grid[classNum+index] = 1
    lower(classNum+index)
}