'use strict';
// Selecting elements 
const player0EL= document.querySelector('.player--0')
const player1EL= document.querySelector('.player--1')
const score0El= document.querySelector("#score--0");
const score1El= document.getElementById("score--1");
const current0El = document.getElementById('current--0')
const current1El = document.getElementById('current--1')

const diceEl= document.querySelector('.dice');
const btnNew=document.querySelector('.btn--new')
const btnRoll=document.querySelector('.btn--roll')
const btnHold=document.querySelector('.btn--hold')

// Starting conditions 
score0El.textContent=0;
score1El.textContent=0;
diceEl.classList.add('hidden')

let scores = [0, 0];
let currentScore = 0;
let activePlayer = 0;
let playing = true

const switchPlayer = function(){
    document.getElementById(`current--${activePlayer}`).textContent= 0;
    currentScore=0;
    activePlayer = activePlayer=== 0 ? 1 :0;
    player0EL.classList.toggle('player--active');
    player1EL.classList.toggle('player--active');

}

// Rolling dice functionality
btnRoll.addEventListener('click',function(){
    if(playing){
    // 1.Generating random dice roll
    const dice = Math.trunc(Math.random()*6)+1;
    // 2.Display dice
    diceEl.classList.remove('hidden');
    diceEl.src= `dice-${dice}.png`;
    // 3.Check for rolled if true switch to other player
    if (dice!==1){
        // add dice to current score
        currentScore+=dice;
        document.getElementById(`current--${activePlayer}`).textContent= currentScore
    }else{
        // Switch to next player
        switchPlayer();
        
    }}
})

btnHold.addEventListener('click', function(){
    if(playing){
    console.log(scores[activePlayer]);
    // 1. Add current score to active player 
    scores[activePlayer] += currentScore;
    document.getElementById(`score--${activePlayer}`).textContent=scores[activePlayer];  

    // 2.check if player's score is 100
    if(scores[activePlayer]>=100){
        // finish the game
        playing = false

        diceEl.classList.add('hidden')
        btnHold.classList.add('hidden')
        btnRoll.classList.add('hidden')
        btnNew.classList.add('btn--new-winner')

        document.querySelector(`.player--${activePlayer}`).classList.add('player--winner');
        document.querySelector(`.player--${activePlayer}`).classList.remove('player--active');
        document.getElementById(`name--${activePlayer}`).textContent= 'WINNER';

    }else{  
        // 3.Switch player
        switchPlayer();
    }}
});
btnNew.addEventListener('click',function(){
    diceEl.classList.remove('hidden')
    btnHold.classList.remove('hidden')
    btnRoll.classList.remove('hidden')
    btnNew.classList.remove('btn--new-winner')
    score0El.textContent=0;
    score1El.textContent=0;
    diceEl.classList.add('hidden')
    current0El.textContent=0;
    current1El.textContent=0;
    scores = [0, 0];
    currentScore = 0;
    
    playing = true

    document.getElementById(`name--${activePlayer}`).textContent=`player ${activePlayer+1}` ;
    document.querySelector(`.player--winner`).classList.add('player--active');
    document.querySelector(`.player--${activePlayer}`).classList.remove('player--winner');
    
    // activePlayer = 0;
})