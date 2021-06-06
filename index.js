// let date = new Date();
// let hour = date.getHours();
const gridDimY = 10;
const gridDimX = 10;
const timeDelayClicker = 700;
let timeDelay = 100;
let palettes = null;
let selectedColors = null;
let maxValues = 2;

class Cell {
    constructor() {
        this.value = 0;
    }
    el = null;
    updateEl() {
        if (this.el == null){
            console.log('Element is null');
        } else {
            this.el.innerText = this.getValue();
            if (selectedColors == null){
                if (this.getValue() % 2 == 0){
                    this.el.style.borderColor = "rgb(85, 216, 246)";
                } else {
                    this.el.style.borderColor = "rgb(216, 85, 246)";
                }
            } else {
                console.log()
                this.el.style.borderColor = selectedColors.colors[this.getValue()];
            }
        }
    }

    change() {
        this.value = (this.getValue() + 1 ) % maxValues;
        this.updateEl();
        return;
    }
    changeDelay(x){
        if (x){
            let del = Math.abs(x*timeDelay);
            let cell = this;
            setTimeout(function () {
                cell.change()
            }, del);
        } else {
            this.change();
        }

        return;
    }
    getValue(){
        return this.value;
    }
}

class Grid {
    constructor(y, x) {
        this.y = y;
        this.x = x;
        this.content = new Array(this.x);
        for (let i = 0; i < this.x; i++) {
            this.content[i] = new Array(this.y);
            for (let j=0; j< this.y; j++){
                this.content[i][j] = new Cell();
            }
        }
    };
    dimensions(){
        return "x:" + this.x.toString() + " y:" + this.y.toString();
    }

    touch(x,y) {
        this.rowChange(x, y);
        this.columnChange(x, y);
        return;
    }
    rowChange(x, y){
        for (let i=0; i<this.x; i++){
            let dist = x - i;
            this.content[i][y].changeDelay(dist);
        }
        return;
    }
    columnChange(x, y){
        for (let i=0; i<this.y; i++){
            let dist = y - i;
            this.content[x][i].changeDelay(dist);
        }
        return;
    }

    checkIfAll(){   // Game function
        let val;
        for (let i = 0; i < this.x; i++) {
            for (let j = 0; j < this.y; j++) {
                if (val === undefined){
                    val = this.content[i][j].getValue();    // Get value to compare against
                } else {
                    if (val !== this.content[i][j].getValue()){ // Compare the value
                        return
                    }
                }
            }
        }
        alert("Puzzle solved");
    }
}


class Picker {
    constructor(grid) {
        this.grid = grid;
    }
    delay = timeDelayClicker;

    pickOne(){
        let i = Math.floor((Math.random() * this.grid.x));
        let j = Math.floor((Math.random() * this.grid.y));
        this.grid.touch(i, j);
    }
}



window.onload = () => {
    console.log('Making grid...');
    let grid = new Grid(gridDimY, gridDimX);
    gridToDom(grid);
    let myPicker = new Picker(grid);
    getPalette();
    let interval = setInterval(function (){
        myPicker.pickOne()
    }, myPicker.delay)
    document.getElementById("button_new_settings").addEventListener('click', ()=>{
        clearInterval(interval);
        // Reset
        grid = new Grid(document.getElementById("y_setting").value, document.getElementById("x_setting").value);
        myPicker = new Picker(grid);
        console.log("Making new grid...");
        document.getElementById("gridspace").remove();  // Somehow empty doesn't clear, doing workaround
        // Create again
        let gridspace = document.createElement("div");
        gridspace.id = "gridspace";
        document.body.insertBefore(gridspace, document.getElementById("setting"));
        gridToDom(grid);
        // Update some settings
        selectedColors = palettes[document.getElementById("color_palette").value];
        maxValues = document.getElementById("color_numbers").value;
        timeDelay = document.getElementById("propagation_setting").value;
        myPicker.delay = document.getElementById("clicker_setting").value;
        interval = setInterval(function (){
            myPicker.pickOne();
        }, myPicker.delay);
    });
};



function getPalette() {
    fetch("./palette.json")
        .then(response => {
            return response.json();
        })
        .then(data => {
            palettes = data.palettes;
            let colorSelection = document.getElementById('color_palette');
            data.palettes.forEach((p, i) =>{
                let pal = document.createElement('option');
                pal.appendChild( document.createTextNode(data.palettes[i].name));
                pal.value = i;
                colorSelection.appendChild(pal);
            });
        });
}

function gridToDom(grid) {
    grid.content.forEach((c, i) => {
        let newDiv = document.createElement("div");
        newDiv.id = ("_" + i.toString());
        newDiv.className = 'column';
        c.forEach((r, j) => {
            // Create button
            let newSub = document.createElement("button");
            newSub.innerText = grid.content[i][j].getValue();
            newSub.addEventListener('click', () => {
                grid.touch(i, j);
                console.log(i.toString() + " ", j.toString());
                //grid.checkIfAll();    If want to have it as a game
            });
            newSub.className = "btn" + grid.content[i][j].getValue().toString();
            newSub.id = ("__" + j.toString());
            grid.content[i][j].el = newSub;
            // Add to section.
            newDiv.appendChild(newSub);
        });
        document.getElementById("gridspace").appendChild(newDiv);
    });
}