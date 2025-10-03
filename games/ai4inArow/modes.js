document.querySelector('.ezMode').addEventListener('click', () => {
    window.location.href = 'ez mode/'
})
document.querySelector('.mediumMode').addEventListener('click', () => {
    window.location.href = 'medium mode/'
})
document.querySelector('.hardMode').addEventListener('click', () => {
    window.location.href = 'hard mode/'
})
document.querySelector('.minimaxMode').addEventListener('click', () => {
    window.location.href = 'minimax mode'
})
document.querySelector('.impossible').addEventListener('click', () => {
    window.location.href = 'impossible mode'
})
let theme = localStorage.getItem('theme');if (theme === 'black') {document.body.classList.add('dark')}
