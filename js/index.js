/**
 * Variables to keep track of state
 */
let resultInputDisplay = 0; // display
let tape = []; // tape
let calcInput = '0'; // input numbers
let calcOps = ['','']; // input operators [tape, math]
let equalsBtnFlag = 0; // if last clicked, set to 1
let numBtnFlag = 0; // if last clicked, set to 1
let opsBtnFlag = 0; // if last clicked, set to 1
let percentFlag = 0; // if last clicked, set to 1

/**
 * Query all calculator parts in the DOM.
 */
const parts = {
    acce: document.querySelector('#ac-ce'),
    plusminus: document.querySelector('#plusminus'),
    percent: document.querySelector('#percent'),
    calcOpsBtn: document.querySelectorAll('.calc-ops-btn'),
    calcNumBtns : document.querySelectorAll('.calc-num-btn'),
    dot: document.querySelector('#dot'),
    equals: document.querySelector('#equals'),
    tape: document.querySelector('#tape'),
    tapeContainer: document.querySelector('#calc-tape'),
    display: document.querySelector('#display'),
};

/**
 * Methods on the parts object
 */
/**
 * Arithmetic Operations helper functions
 * Receive 2 numbers and return the calculated result
 */
parts.multiplication = function(a,b) { return +a * +b; };
parts.division = function(a,b) { return +a / +b; };
parts.addition = function(a,b) { return +a + +b; };
parts.subtraction = function(a,b) { return +a - +b; };

/**
 * Arithmetic Operations eventlistener
 */
parts.calcOpsBtn.forEach((opsBtn) => {
    opsBtn.addEventListener('click', function(){
        if(equalsBtnFlag) { // equals flag was set calcinput and ops should be set to zero
            calcInput = '0';
            calcOps = ['',''];
        }
        if(calcOps[1] && +calcInput) { // do math
            resultInputDisplay = parts[calcOps[1]](resultInputDisplay, calcInput);
            tape.push(` = ${resultInputDisplay} `);
        } else if(calcOps[1] && !+calcInput) { // exchange operator
            tape.pop();
        } else if(!resultInputDisplay && !equalsBtnFlag){ // add operator
            resultInputDisplay = +calcInput;
        }
        tape.push([this.value, this.id]);
        parts.proccess(resultInputDisplay, {ci:'0',co:[this.value, this.id],acce:'ce',numf:0,eqf:0,perf:0,opsf:1});
    });
});

/**
 * Numbers eventlistener
 */
parts.calcNumBtns.forEach((numBtn) => {
    numBtn.addEventListener('click', function() {
        if(equalsBtnFlag || percentFlag) { // equals || percent flag was set, new calc should be started
            resultInputDisplay = 0;
            calcInput = '0';
            calcOps = ['',''];
        }
        if(calcInput !== '0') {
            calcInput += this.value;
        } else {
            calcInput = this.value;
        }
        if(numBtnFlag) {
            tape[tape.length-1] += this.value;
        } else {
            tape.push(this.value);
        }
        parts.proccess(calcInput, {acce:'ce',numf:1,eqf:0,perf:0,opsf:0});
    });
});

/**
 * Dot eventlistener
 */
parts.dot.onclick = function() {
    if(tape.length-1 != this.value ) {
        calcInput += this.value;
        tape.push(this.value);
        parts.proccess(calcInput);
    }
};

/**
 * Percentages eventlistener 
 */
parts.percent.onclick = function() {
    if(resultInputDisplay == 0 && numBtnFlag ) { // there is only an input number to work with
        tape.pop();
        calcInput = +calcInput/100;
        tape.push(calcInput);
    }
    if(resultInputDisplay != 0 && numBtnFlag) { // there are some numbers to do math with
        tape.pop();
        calcInput = resultInputDisplay/100 * +calcInput;
        tape.push(calcInput);
    }
    if(resultInputDisplay != 0 && opsBtnFlag) { // current result precentage of current result (if result=120; 120% of 120 = 144)
        tape.splice(-2,2);
        calcInput = resultInputDisplay/100 * resultInputDisplay;
        tape.push(['*','multiplication'], calcInput);
    }
    if(resultInputDisplay != 0 && equalsBtnFlag) { // equalsflag is set, get 1% of current result
        tape.pop();
        resultInputDisplay = resultInputDisplay/100;
        calcInput = resultInputDisplay;
        tape.push(` = ${calcInput}<br>`);
    }
    parts.proccess(calcInput, {perf:1});
};

/**
 * Plus Minus sign eventlistener
 */
parts.plusminus.onclick = function() {
    if(!numBtnFlag)  {
        resultInputDisplay = (resultInputDisplay > 0) ? -Math.abs(resultInputDisplay) : +Math.abs(resultInputDisplay);
        tape.push(` = ${resultInputDisplay}<br>`);
        parts.proccess(resultInputDisplay);
    } else { //numBtnFlag
        tape.pop();
        calcInput = (+calcInput > 0) ? -Math.abs(+calcInput) : +Math.abs(+calcInput);
        tape.push(calcInput);
        parts.proccess(calcInput);
    }
};

/**
 * Equals eventlistener
 */
parts.equals.onclick = function() {
    if(calcOps[1] && equalsBtnFlag == 0 && !+calcInput) {
        tape.pop();
        calcInput = tape[tape.length-2];
    } else if(calcOps[1] && equalsBtnFlag == 0) { // do the maths
        resultInputDisplay = parts[calcOps[1]](resultInputDisplay, calcInput);
        tape.push(` = ${resultInputDisplay}<br>`);
    } else if(resultInputDisplay && +calcInput && equalsBtnFlag && (calcOps[1] || tape[tape.length-3])) {  // repeat the math
        resultInputDisplay = parts[calcOps[1]](resultInputDisplay, calcInput);
        tape.push(calcOps, calcInput, ` = ${resultInputDisplay}<br>`);
    } else {
        resultInputDisplay = +calcInput;
    }
    parts.proccess(resultInputDisplay, {numf:0,eqf:1,perf:0,opsf:0});
};

/**
 * Reset Calculator eventlistener
 * If the value of the reset button is AC set every thing to 0.
 * If it is CE undo the last action
 */
parts.acce.onclick = function() {
    if(this.value == 'ac') { // It's AC set everything to 0
        parts.proccess(0, {dis:0,tape:[],ci:'0',co:['',''],acce:'ac',numf:0,eqf:0,perf:0,opsf:0});
    } else { // it's 'ce'
        if(percentFlag) { // only keep the tape and the result is now the calculated calcInput value
            parts.proccess(calcInput, {dis:calcInput,ci:'0',co:['',''],acce:'ac',numf:0,eqf:0,perf:0,opsf:0});
        } else if(opsBtnFlag) {
            tape.pop();  // remove the operator from the tape
            parts.proccess(resultInputDisplay, {co:['',''],acce:'ac',numf:0,eqf:0,perf:0,opsf:0}); // keep result, inputCalc, tape
        } else if(numBtnFlag) {
            tape.pop(); // remove the last inputCalc from the tape
            parts.proccess(resultInputDisplay, {ci:'0',acce:'ac',numf:0,eqf:0,perf:0,opsf:0}); // keep result, tape
        } else if (equalsBtnFlag) {
            parts.proccess(0, {acce:'ac',numf:0,eqf:0,perf:0,opsf:0}); // keep result, tape, inputCalc
        }
    }
};

/**
 * proccess the result of the eventlisteners
 * @param {Number} print 
 * @param {*} state Default = {}
 */
parts.proccess = function(print, state = {}) {
    parts.print(print); // print tape and display
    parts.setPropsAndFlags(state); // set flags and props
    debugState();
};

/**
 * Set Properties and Flags helper function
 * @param {*} state - object with state 
 * properties state will only be set if it exists in the state object.
 * debugState is printed everytime to keep track of the state on the front-end
 */
parts.setPropsAndFlags = function(state) {
    if(state.hasOwnProperty('dis')) { resultInputDisplay = state.dis; }
    if(state.hasOwnProperty('tape')) { tape = state.tape; }
    if(state.hasOwnProperty('ci')) { calcInput = state.ci; }
    if(state.hasOwnProperty('co')) { calcOps = state.co; }
    if(state.hasOwnProperty('acce')) {
        parts.acce.value = state.acce;
        parts.acce.textContent = state.acce.toUpperCase();
    }
    if(state.hasOwnProperty('numf')) { numBtnFlag = state.numf; }
    if(state.hasOwnProperty('eqf')) { equalsBtnFlag = state.eqf;  }
    if(state.hasOwnProperty('perf')) { percentFlag = state.perf; }
    if(state.hasOwnProperty('opsf')) { opsBtnFlag = state.opsf; }
};

/**
 * Print tape and result to the page
 * Tape is an array that is looped over to print.
 * If item in the tape array is an array it is an operater.
 * @param {Number} display
 */
parts.print = function(print) {
    parts.tape.innerHTML = '';
    tape.forEach((t) => {
        if(Array.isArray(t)) {
            t = ` ${t[0]} `;
        }
        parts.tape.innerHTML += t;
    });
    parts.tapeContainer.scrollTop = parts.tapeContainer.scrollHeight;
    parts.display.textContent = print;
};

/**
 * DEBUG
 * Display is set to none on the first line of the css
 */
const debugState = function() {
    document.querySelector('#resultInputDisplay span').textContent = resultInputDisplay;
    document.querySelector('#calcInput span').textContent = calcInput;
    document.querySelector('#calcOps span').textContent = calcOps;
    document.querySelector('#equalsBtnFlag span').textContent = equalsBtnFlag;
    document.querySelector('#numBtnFlag span').textContent = numBtnFlag;
    document.querySelector('#opsBtnFlag span').textContent = opsBtnFlag;
    document.querySelector('#percentBtnFlag span').textContent = percentFlag;
};