let index = 9
let boardHTML = ''
for(let i=0; i<index**2;i++) {
    boardHTML += `<div class='cube c${i}a'></div>`
}
q('board').innerHTML = boardHTML
let grid = Array.from({ length: index }, () => Array(index).fill(''));

let theme = localStorage.getItem('theme');if (theme === 'black') {document.body.classList.add('dark')}


let disabled = false
let lastPlayed = undefined
const check = async e => {
    if (disabled) return
    disabled = true
    if (lastPlayed !== undefined) {
        let [row, col] = lastPlayed
        q(`c${turnToNumberFromArray([row, col])}a`).style.backgroundColor = 'lightblue'
        lastPlayed = undefined
    }
    const classNumber = Number(e.target.className.split(' ')[1].replace('c','').replace('a',''))
    q(`c${classNumber}a`).innerHTML = 'p'
    q(`c${classNumber}a`).style.backgroundColor = 'salmon'
    q(`c${classNumber}a`).removeEventListener('click', check)
    let [row, col] = turnToArrayFromNumber(classNumber)
    grid[row][col] = 'p'
    checkIfGameIsOver()
    moveDownByNumber(classNumber)
}

async function bestMove() {
    checkIfGameIsOver()
    q('turn').innerHTML = 'bot thinking...'
    await new Promise(x => setTimeout(x, 100))
    q('turn').innerHTML = 'Your turn'
    let nums = getLowestPos()
    let move;
    let bestScore = -Infinity
    for (let [row, col] of nums) {
        grid[row][col] = 'b'
        let score = minimax(5, false)
        grid[row][col] = ''
        if (score > bestScore) {
            bestScore = score
            move = {row, col}
        }
    }
    grid[move.row][move.col] = 'b'
    q(`c${turnToNumberFromArray([move.row, move.col])}a`).innerHTML = 'b'
    q(`c${turnToNumberFromArray([move.row, move.col])}a`).style.backgroundColor = 'lightgreen'
    lastPlayed = [move.row, move.col]
    q(`c${turnToNumberFromArray([move.row, move.col])}a`).removeEventListener('click', check)
    checkIfGameIsOver()
    disabled = false
}

function minimax(depth, isMaximizing) {
    if (depth === 0 || detectWinBy('p') || detectWinBy('b') || draw()) {
        return evaluateBoard(depth)
    }

    if (isMaximizing) {
        let nums = getLowestPos()
        let bestScore = -Infinity
        for (let [row, col] of nums) {
            grid[row][col] = 'b'
            let score = minimax(depth-1, false)
            grid[row][col] = ''
            if (score > bestScore) {
                bestScore = score
            }
        }
        return bestScore
    } else {
        let nums = getLowestPos()
        let bestScore = Infinity
        for (let [row, col] of nums) {
            grid[row][col] = 'p'
            let score = minimax(depth-1, true)
            grid[row][col] = ''
            if (score < bestScore) {
                bestScore = score
            }
        }
        return bestScore
    }
}
document.querySelectorAll('.cube').forEach(cube => {
    cube.addEventListener('click', check)
})
function evaluateBoard(depth) {
    let score = 0
    if(detectWinBy('p')) score -= 20000 - depth // other guy winging = bad
    if(detectWinBy('b')) score += 20000 + depth// you win = good

    if (hasXinArow('p', 'p', 'p', '')) score -= 5000 // almost lose = bad
    if (hasXinArow('p', 'p', '', 'p')) score -= 5000 // almost lose = bad
    if (hasXinArow('p', '', 'p', 'p')) score -= 5000 // almost lose = bad
    if (hasXinArow('', 'p', 'p', 'p')) score -= 5000 // almost lose = bad

    if (hasXinArow('b', 'b', 'b', '')) score +=  5000 // almost win = good
    if (hasXinArow('b', 'b', '', 'b')) score +=  5000 // almost win = good
    if (hasXinArow('b', '', 'b', 'b')) score +=  5000 // almost win = good
    if (hasXinArow('', 'b', 'b', 'b')) score +=  5000 // almost win = good

    if (hasXinArow('p', 'p', '', '')) score -= 3000 // almost lose = bad
    if (hasXinArow('', 'p', 'p', '')) score -= 3000 // almost lose = bad
    if (hasXinArow('', '', 'p', 'p')) score -= 3000 // almost lose = bad

    if (hasXinArow('b', 'b', '', '')) score +=  3000 // almost win = good
    if (hasXinArow('', 'b', 'b', '')) score +=  3000 // almost win = good
    if (hasXinArow('', '', 'b', 'b')) score +=  3000 // almost win = good

    if (hasXinArow('p', '', '', 'p')) score -= 500 // somewhat close to lose = bad
    if (hasXinArow('', 'p', '', 'p')) score -= 1000 // somewhat close to lose = bad
    if (hasXinArow('p', '', 'p', '')) score -= 1000 // somewhat close to lose = bad

    if (hasXinArow('b', '', '', 'b')) score +=  500 // somewhat close to win = good
    if (hasXinArow('', 'b', '', 'b')) score +=  1000 // somewhat close to win = good
    if (hasXinArow('b', '', 'b', '')) score +=  1000 // somewhat close to win = good

    if(near('p')) score += 100 // near the player is better cuz you might block him
    score += depth
    return score
}
function hasXinArow(move1 ,move2, move3, move4) {
    for(let row=0;row<index;row++) {for(let col=0;col<index-3;col++) {if(grid[row][col] === move1 && grid[row][col+1] === move2 && grid[row][col+2] === move3 && grid[row][col+3] === move4) {return true}}}
    for(let row=3;row<index;row++) {for(let col=0;col<index;col++) {if(grid[row][col] === move1 && grid[row-1][col] === move2 && grid[row-2][col] === move3 && grid[row-3][col] === move4) {return true}}}
    for(let row=3;row<index;row++) {for(let col=0;col<index-3;col++) {if(grid[row][col] === move1 && grid[row-1][col+1] === move2 && grid[row-2][col+2] === move3 && grid[row-3][col+3] === move4) {return true}}}
    for(let row=0;row<index-3;row++) {for(let col=0;col<index-3;col++) {if(grid[row][col] === move1 && grid[row+1][col+1] === move2 && grid[row+2][col+2] === move3 && grid[row+3][col+3] === move4) {return true}}}
}
function detectWinBy(move) {
    for(let row=0;row<index;row++) {for(let col=0;col<index-3;col++) {if(grid[row][col] === move && grid[row][col+1] === move && grid[row][col+2] === move && grid[row][col+3] === move) {return [[row, col], [row, col+1], [row, col+2], [row, col+3]]}}}
    for(let row=3;row<index;row++) {for(let col=0;col<index;col++) {if(grid[row][col] === move && grid[row-1][col] === move && grid[row-2][col] === move && grid[row-3][col] === move) {return [[row, col], [row-1, col], [row-2, col], [row-3, col]]}}}
    for(let row=3;row<index;row++) {for(let col=0;col<index-3;col++) {if(grid[row][col] === move && grid[row-1][col+1] === move && grid[row-2][col+2] === move && grid[row-3][col+3] === move) {return [[row, col], [row-1, col+1], [row-2, col+2], [row-3, col+3]]}}}
    for(let row=0;row<index-3;row++) {for(let col=0;col<index-3;col++) {if(grid[row][col] === move && grid[row+1][col+1] === move && grid[row+2][col+2] === move && grid[row+3][col+3] === move) {return [[row, col], [row+1, col+1], [row+2, col+2], [row+3, col+3]]}}}
    return false
}
async function moveDownByNumber(classNumber) {
    await new Promise(x => setTimeout(x, 100))
    let [row, col] = turnToArrayFromNumber(classNumber)
    if (row + 1 < index && q(`c${turnToNumberFromArray([row+1, col])}a`).innerHTML === '') {
        q(`c${classNumber}a`).innerHTML = ''
        q(`c${classNumber}a`).style.backgroundColor = 'rgb(160, 160, 160)'
        q(`c${classNumber}a`).addEventListener('click', check)
        grid[row][col] = ''

        row++
        let newNum = turnToNumberFromArray([row, col])
        q(`c${newNum}a`).innerHTML = 'p'
        q(`c${newNum}a`).style.backgroundColor = 'salmon'
        q(`c${newNum}a`).removeEventListener('click', check)
        grid[row][col] = 'p'
        moveDownByNumber(newNum)
    } else {bestMove()}
}
function checkIfGameIsOver() {
    if(detectWinBy('p')) {gameOver('you won!'); return}
    else if(detectWinBy('b')) {gameOver('bot won!'); let spots = detectWinBy('b'); spots.forEach(spot => {let [row, col] = spot; q(`c${turnToNumberFromArray([row, col])}a`).style.backgroundColor = 'lightgreen'})}
    else if(draw()) {gameOver('draw!'); return}
}
function draw() {
    let count = 0
    for(let row = 0; row<index;row++) {for(let col = 0; col<index;col++) {if(grid[row][col] === '') {count++}}}
    if(count === index**2) {return true} else {return false}
}
function near(move) {
    for(let row=1;row<index;row++) {for(let col=0;col<index;col++) {if(grid[row][col] === 'p' && grid[row-1][col] === move) {return true}}}
    for(let row=0;row<index;row++) {for(let col=1;col<index;col++) {if(grid[row][col] === 'p' && grid[row][col-1] === move) {return true}}}
    for(let row=0;row<index;row++) {for(let col=0;col<index-1;col++) {if(grid[row][col] === 'p' && grid[row][col+1] === move) {return true}}}
}
function getLowestPos() {
    let allNums = []
    for(let col=0;col<index;col++) {if (grid[0][col] === '') {let [r, c] = goDownGrid(0, col);allNums.push([r, c])}}
    return allNums
}
function goDownGrid(row, col) {if (row + 1 < index) {if (grid[row + 1][col] === '') {return goDownGrid(row + 1, col)} else {return [row, col]}} else {return [row, col]} }
function q(qury) {return document.querySelector(`.${qury}`)}
function turnToArrayFromNumber(num) {
    let row = Math.floor(num / index)
    let col = num % index
    return [row, col]
}
function turnToNumberFromArray(array) {
    let [row, col] = array
    return sum = (row*index)+col
}
function gameOver(text) {
    q('turn').innerHTML = text
    document.querySelectorAll('.cube').forEach(cube => {
        cube.removeEventListener('click', check)
    })
}