
var main = document.getElementsByTagName('main')[0]
var viewHighscoreLink = document.getElementById('view_highscore_link')
var timeDisplay = document.getElementById('time_display')
var startQuizButton = document.getElementById('start_quiz_button')
var questionNumbersBox = document.getElementById('question_numbers_box')
var questionDisplay = document.getElementById('question_display')
var answersList = document.getElementById('answer_list')
var answerFeedback = document.getElementById('feedback')
var scoreDisplay = document.getElementById('score_display')
var initialsInput = document.getElementById('initials_input')
var submitInitialsButton = document.getElementById('submit_initials_button')
var highscoreList = document.getElementById('highscore_list')
var goToStartingPageButton = document.getElementById('go_to_starting_page_button')
var clearHighscoresButton = document.getElementById('clear_highscores_button')

// a list of questions to be asked
const questions = [ 
    {
        'question': 'What is Javascript?',
        'answers': ['A coffee brand','A Font','A coding language','Caligraphy'],
        'correct_index': 2
    }, {
        'question': 'Which company develped javascript?',
        'answers': ['Intel','Netscape','Microsoft','IBM'],
        'correct_index': 1
    }, {
        'question': 'Which symbol is used for comments in javascript?',
        'answers': ['//','#','()','+'],
        'correct_index': 0
    }, {
        'question': 'What is a type of pop-up box available in javascript?',
        'answers': ['Pop-up','Display','Sign','Alert'],
        'correct_index': 3
    },
]

// score tracking variables
const startingTime = questions.length * 8 
var remainingTime 
var timer 
var score 


function init() {
    
    startQuizButton.addEventListener('click', event => {
        event.preventDefault()
        displayQuestionPage()
    })
    answersList.addEventListener('click', function(event) {
        event.preventDefault()
        if (event.target.matches('button')) {
            var button = event.target
            if (button.classList.contains('correct')) {
                answerFeedback.textContent = "Correct!"
                questionNumbersBox.children[nextQuestionIndex - 1].classList.add('correct')
                score++
            } else {
                answerFeedback.textContent = "Wrong!"
                questionNumbersBox.children[nextQuestionIndex - 1].classList.add('wrong')
                remainingTime -= timePenalty
            }
            if (remainingTime > 0) displayNextQuestion()
            else displayGetNamePage()
        }
    })
    submitInitialsButton.addEventListener('click', event => {
        event.preventDefault()
        let initials = initialsInput.value.toUpperCase()
        if (initials) {
            let highscores = JSON.parse(localStorage.getItem('highscores')) || []
            
            timestamp = Date.now()
            highscores.push({
                'timestamp': timestamp,
                'score': score,
                'initials': initials,
                'timeRemaining': remainingTime
            })
            
            highscores = highscores.sort((a, b) => {
                if (a.score != b.score) return b.score - a.score
                if (a.timeRemaining != b.timeRemaining) return b.timeRemaining - a.timeRemaining
                if (a.timestamp != b.timestamp) return a.timestamp - b.timestamp
                return 0
            })

            localStorage.setItem('highscores', JSON.stringify(highscores))
            
            displayHighscorePage()
            initialsInput.value = ""
        }
    })
    goToStartingPageButton.addEventListener('click', event => {
        event.preventDefault()
        displayStartingPage()
    })
    clearHighscoresButton.addEventListener('click', event => {
        var confirmed = confirm("You are about to clear all of your highscores. Would you like to continue?")
        if (confirmed) {
            event.preventDefault()
            localStorage.setItem('highscores', "[]")
            displayHighscorePage()
        }
    })
    viewHighscoreLink.addEventListener('click', event => {
        event.preventDefault()
        displayHighscorePage()
    })
    
    // display the starting page
    displayStartingPage()
}

/** Hide all of the pages except for the one with given id.
 * 
 * @param {number} id the id of the page that should be displayed
 */
function displayPage(id) {
    main.querySelectorAll('.page').forEach(page => {
        if (page.id == id) {
            page.classList.remove('hidden')
        } else {
            page.classList.add('hidden')
        }
    })
    return 4
}


function displayStartingPage() {
    displayPage('starting_page')
    
    clearInterval(timer)
    remainingTime = 0
    timeDisplay.textContent = formatSeconds(remainingTime)
}

var nextQuestionIndex 
var randomizedQuestions 

/** Display the questions page. */
function displayQuestionPage() {
    displayPage('question_page')

    
    questionNumbersBox.innerHTML = ""

    for (let i = 0; i < questions.length; i++) {
        const element = questions[i];
        var el = document.createElement('span')
        el.textContent = i + 1
        questionNumbersBox.appendChild(el)
    }

  
    randomizedQuestions = randomizeArray(questions)

    
    nextQuestionIndex = 0
    score = 0

    // start the timer
    startTimer()


    displayNextQuestion()
}


function displayNextQuestion() {
    if (nextQuestionIndex < questions.length) {
        
        const question = randomizedQuestions[nextQuestionIndex].question
        const answers = randomizedQuestions[nextQuestionIndex].answers
        const randomizedAnswers = randomizeArray(answers)
        const correctAnswer = answers[randomizedQuestions[nextQuestionIndex].correct_index]
        
        questionDisplay.textContent = question
        answersList.innerHTML = ""
        answerFeedback.textContent = ""

        for (let i = 0; i < randomizedAnswers.length; i++) {
            let answer = randomizedAnswers[i]
            let button = document.createElement("button")
            button.classList.add('answer')
            if (answer == correctAnswer)
                button.classList.add('correct')
            button.textContent = `${i + 1}. ${answer}`
            answersList.appendChild(button)
        }

        nextQuestionIndex++
    } else {
        clearInterval(timer)
        displayGetNamePage()
    }
}


function displayGetNamePage() {
    displayPage('get_name_page')
    if (remainingTime < 0) remainingTime = 0
    timeDisplay.textContent = formatSeconds(remainingTime)
    scoreDisplay.textContent = score
}


function displayHighscorePage() {
    displayPage('highscore_page')
    questionNumbersBox.innerHTML = ""

    highscoreList.innerHTML = ""

    clearInterval(timer)

    let highscores = JSON.parse(localStorage.getItem('highscores'))
    
    let i = 0
    for (const key in highscores) {
        i++
        let highscore = highscores[key]
        var el = document.createElement('div')
        let initials = highscore.initials.padEnd(3, ' ')
        let playerScore = highscore.score.toString().padStart(3, ' ')
        let timeRemaining = formatSeconds(highscore.timeRemaining)
        el.textContent = `${i}. ${initials} - Score: ${playerScore} - Time: ${timeRemaining}`
        highscoreList.appendChild(el)
    }
}

/** Take any array and return a randomly sorted clone.
 * 
 * @param {array} array the array that will be cloned
 */
function randomizeArray(array) {
    clone = [...array]
    output = []
    
    while (clone.length > 0) {
        let r = Math.floor(Math.random() * clone.length);
        let i = clone.splice(r, 1)[0]
        output.push(i)
    }

    return output
}



function startTimer() {
    remainingTime = startingTime
    timeDisplay.textContent = formatSeconds(remainingTime)
    
    timer = setInterval(function() {
        remainingTime--
    
        if (remainingTime < 0) {
            clearInterval(timer)
            displayGetNamePage()
        } else {
            timeDisplay.textContent = formatSeconds(remainingTime)
        }
    
    }, 1000)
}

/** Convert a given number of seconds to a 'M:SS' format
 * 
 * @param {number} seconds 
 */
function formatSeconds(seconds) {
    let m = Math.floor(seconds / 60).toString().padStart(2, ' ')
    let s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
}

init()