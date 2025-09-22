const games = [{
    name: '4 in a row',
    filename: '4inArow',
},{
    name: 'cookie clicker',
    filename: 'cookieClicker',
},{
    name: 'guess the number',
    filename: 'guessTheNumber',
},{
    name: 'Tic Tac Toe',
    filename: 'tictactoe',
},{
    name: 'cross numbers',
    filename: 'crossSumsv2',
},{
    name: 'AI Tic Tac Toe',
    filename: 'AI-TicTacToe',
},{
    name: 'simon says',
    filename: 'simonSays',
},{
    name: 'ai 4 in a row',
    filename: 'ai4inArow',
}, {
    name: 'checkers<br>not finished',
    filename: 'checkers'
}, {
    name: 'AI chess',
    filename: 'chess'
}, {
    name: 'snake',
    filename: 'snake'
}, {
    name: 'css tools',
    filename: 'tool'
}, {
    name: 'digit Ai',
    filename: 'digitAi-none'
}
]

games.forEach(game => {
    if (game.filename === 'none') {
        document.querySelector('.games').innerHTML += `<div class="game red" onclick='alert("this game is not finished!")'><div class="name red">${game.name}</div><div class="img"><img src="imgs/${game.filename}.png" alt=""></div></div>`
    } else if (game.filename.includes('none')) {
        document.querySelector('.games').innerHTML += `<div class="game red" onclick='window.location.href="games/${game.filename}"'><div class="name red">${game.name}</div><div class="img"><img src="imgs/none.png" alt=""></div></div>` 
    } else if (game.filename === 'tool') {
        document.querySelector('.games').innerHTML += `<div class="game tool tool-frame" onclick='window.location.href="games/${game.filename}"'><div class="name tool-name">${game.name}</div><div class="img tool">⚙️</div></div>`
    } else if (game.filename.includes('AREA')) {
        document.querySelector('.games').innerHTML += `<div class="game AREA" onclick='window.location.href="${game.filename}"'><div class="name">${game.name}</div><div class="img center-div"><div class="circle center-div">→</div></div></div>`
    } else {
        document.querySelector('.games').innerHTML += `<div class="game" onclick='window.location.href="games/${game.filename}"'><div class="name">${game.name}</div><div class="img" style="background-image: url(imgs/${game.filename}-dark.png);"><img class="real-img" src="imgs/${game.filename}.png" alt=""></div></div>`
    }
})
