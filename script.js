// JavaScript code
var questions = JSON.parse(localStorage.getItem('questions')) || [];
var students = JSON.parse(localStorage.getItem('students')) || [];
var completedExams = JSON.parse(localStorage.getItem('completedExams')) || {};
var timer; // Timer variable
var currentQuestionIndex = 0;
var totalScore = 0;
var wrongQuestions = []; // Array to store wrong questions
var editingQuestionIndex = -1; // Index of the question being edited
var studentName = "";
var studentRegNo = "";

function studentLogin() {
    studentName = document.getElementById("studentName").value.trim();
    studentRegNo = document.getElementById("studentRegNo").value.trim();

    if (studentName && studentRegNo) {
        if (completedExams[studentRegNo]) {
            document.getElementById("studentErrorMessage").textContent = "You have already completed the exam.";
            document.getElementById("studentErrorMessage").style.display = "block";
            return;
        }

        showStudentInterface(studentName, studentRegNo);
    } else {
        document.getElementById("studentErrorMessage").textContent = "Name and Registration number cannot be empty.";
        document.getElementById("studentErrorMessage").style.display = "block";
    }
}

function examinerLogin() {
    var name = document.getElementById("examinerName").value.trim();
    var password = document.getElementById("examinerPassword").value.trim();

    if (name && password) {
        // Example password validation (use a proper method in production)
        if (password === "examiner123") {
            showExaminerInterface();
        } else {
            document.getElementById("examinerErrorMessage").textContent = "Incorrect password.";
            document.getElementById("examinerErrorMessage").style.display = "block";
        }
    } else {
        document.getElementById("examinerErrorMessage").textContent = "Name and Password cannot be empty.";
        document.getElementById("examinerErrorMessage").style.display = "block";
    }
}

function showStudentInterface(name, regNo) {
    hideAllInterfaces();
    var studentInterface = document.getElementById("studentInterface");
    studentInterface.style.display = "block";
    studentInterface.innerHTML = "<h3>Welcome, " + name + " (" + regNo + ")</h3>";
    displayNextQuestion();
}

function showExaminerInterface() {
    hideAllInterfaces();
    var examinerInterface = document.getElementById("examinerInterface");
    examinerInterface.style.display = "block";
    displayQuestionsForExaminer();
    displayStudentScores();
}

function hideAllInterfaces() {
    document.getElementById("loginForm").style.display = "none";
    document.getElementById("studentInterface").style.display = "none";
    document.getElementById("examinerInterface").style.display = "none";
}

function addQuestion() {
    var question = document.getElementById("question").value.trim();
    var option1 = document.getElementById("option1").value.trim();
    var option2 = document.getElementById("option2").value.trim();
    var option3 = document.getElementById("option3").value.trim();
    var option4 = document.getElementById("option4").value.trim();
    var answer = document.getElementById("answer").value.trim().toUpperCase();

    if (question && option1 && option2 && option3 && option4 && ["A", "B", "C", "D"].includes(answer)) {
        questions.push({
            question: question,
            options: [option1, option2, option3, option4],
            answer: answer.charCodeAt(0) - 65
        });
        localStorage.setItem('questions', JSON.stringify(questions));
        clearQuestionForm();
        displayQuestionsForExaminer();
    } else {
        alert("Please fill in all fields and provide a valid answer (A, B, C, or D).");
    }
}

function displayQuestionsForExaminer() {
    var questionsList = document.getElementById("questionsList");
    questionsList.innerHTML = "";
    questions.forEach((q, index) => {
        var li = document.createElement("li");
        li.textContent = q.question;
        var editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.onclick = () => editQuestion(index);
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteQuestion(index);
        li.appendChild(editButton);
        li.appendChild(deleteButton);
        questionsList.appendChild(li);
    });
    document.getElementById("examinerQuestions").style.display = questions.length ? "block" : "none";
}

function clearQuestionForm() {
    document.getElementById("question").value = "";
    document.getElementById("option1").value = "";
    document.getElementById("option2").value = "";
    document.getElementById("option3").value = "";
    document.getElementById("option4").value = "";
    document.getElementById("answer").value = "";
    document.getElementById("addQuestionButton").style.display = "inline-block";
    document.getElementById("updateButton").style.display = "none";
    editingQuestionIndex = -1;
}

function editQuestion(index) {
    var question = questions[index];
    document.getElementById("question").value = question.question;
    document.getElementById("option1").value = question.options[0];
    document.getElementById("option2").value = question.options[1];
    document.getElementById("option3").value = question.options[2];
    document.getElementById("option4").value = question.options[3];
    document.getElementById("answer").value = String.fromCharCode(65 + question.answer);
    document.getElementById("addQuestionButton").style.display = "none";
    document.getElementById("updateButton").style.display = "inline-block";
    editingQuestionIndex = index;
}

function updateQuestion() {
    if (editingQuestionIndex === -1) return;

    var question = document.getElementById("question").value.trim();
    var option1 = document.getElementById("option1").value.trim();
    var option2 = document.getElementById("option2").value.trim();
    var option3 = document.getElementById("option3").value.trim();
    var option4 = document.getElementById("option4").value.trim();
    var answer = document.getElementById("answer").value.trim().toUpperCase();

    if (question && option1 && option2 && option3 && option4 && ["A", "B", "C", "D"].includes(answer)) {
        questions[editingQuestionIndex] = {
            question: question,
            options: [option1, option2, option3, option4],
            answer: answer.charCodeAt(0) - 65
        };
        localStorage.setItem('questions', JSON.stringify(questions));
        clearQuestionForm();
        displayQuestionsForExaminer();
    } else {
        alert("Please fill in all fields and provide a valid answer (A, B, C, or D).");
    }
}

function deleteQuestion(index) {
    questions.splice(index, 1);
    localStorage.setItem('questions', JSON.stringify(questions));
    displayQuestionsForExaminer();
}

function displayNextQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endExam();
        return;
    }
    var questionData = questions[currentQuestionIndex];
    var studentInterface = document.getElementById("studentInterface");
    studentInterface.innerHTML = `
        <h3>Question ${currentQuestionIndex + 1} of ${questions.length}</h3>
        <p>${questionData.question}</p>
        <ul>
            <li><input type="radio" name="option" value="0">${questionData.options[0]}</li>
            <li><input type="radio" name="option" value="1">${questionData.options[1]}</li>
            <li><input type="radio" name="option" value="2">${questionData.options[2]}</li>
            <li><input type="radio" name="option" value="3">${questionData.options[3]}</li>
        </ul>
        <button onclick="submitAnswer()">Submit Answer</button>
    `;
}

function submitAnswer() {
    var selectedOption = document.querySelector('input[name="option"]:checked');
    if (!selectedOption) {
        alert("Please select an option.");
        return;
    }
    var answerIndex = parseInt(selectedOption.value);
    var questionData = questions[currentQuestionIndex];

    if (answerIndex === questionData.answer) {
        totalScore++;
    } else {
        wrongQuestions.push(questionData.question);
    }

    currentQuestionIndex++;
    displayNextQuestion();
}

function endExam() {
    var studentInterface = document.getElementById("studentInterface");
    studentInterface.innerHTML = `
        <h3>Exam Completed</h3>
        <p>Your Score: ${totalScore} out of ${questions.length}</p>
        <p>Wrong Questions:</p>
        <ul>${wrongQuestions.map(q => `<li>${q}</li>`).join('')}</ul>
    `;
    completedExams[studentRegNo] = true;
    localStorage.setItem('completedExams', JSON.stringify(completedExams));
    students.push({ name: studentName, regNo: studentRegNo, score: totalScore });
    localStorage.setItem('students', JSON.stringify(students));
    displayStudentScores();
}

function displayStudentScores() {
    var studentScoresContainer = document.getElementById("studentScoresContainer");
    var studentScores = document.getElementById("studentScores");
    studentScores.innerHTML = "";
    students.forEach(student => {
        var li = document.createElement("li");
        li.textContent = `${student.name} (${student.regNo}): ${student.score}`;
        studentScores.appendChild(li);
    });
    studentScoresContainer.style.display = students.length ? "block" : "none";
}

function clearStudentScores() {
    students = [];
    localStorage.setItem('students', JSON.stringify(students));
    displayStudentScores();
}

function exportStudentScores() {
    var csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Registration Number,Score\n";
    students.forEach(student => {
        csvContent += `${student.name},${student.regNo},${student.score}\n`;
    });

    var encodedUri = encodeURI(csvContent);
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_scores.csv");
    document.body.appendChild(link);

    link.click();
    document.body.removeChild(link);
}
