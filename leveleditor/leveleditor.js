//Level Editor

//We can 'draw' onto a table element with our current 'swatch'  then we can use that to export a string

const _canvas = document.getElementById('canvas');
const _palette = document.getElementById('palette');
const _preview = document.getElementById('preview');
const _levelchars = ['#','1','2','3','4','5','6','B','D','d','l','k','.'];
const _cheight = 24;
const _cwidth = 24;

let swatch = '';
let grid = [];

initGrid();
initCanvas();
initPalette();
updatePreview();

function initGrid(){
    for(let y = 0; y < _cheight; y++){
        let row = [];
        for(let x = 0; x < _cwidth; x++){
            row.push('.');
        }
        grid.push(row);
    }
}

function initCanvas(){
    for(let y = 0; y < _cheight; y++){
        let row = document.createElement('tr');
        for(let x = 0; x < _cwidth; x++){
            let cell = document.createElement('td');
            //the first and last block should have a border block.
            if(x==0 || x == _cwidth - 1){
                cell.style.backgroundImage = getImg('B');
                grid[y][x] = 'B';
            }else{
                cell.addEventListener('click', e => {
                    if(swatch){
                        if(e.shiftKey){
                            grid[y][x] = '.';
                            cell.style.backgroundImage = 'none';
                        }else{
                            grid[y][x] = swatch;
                            cell.style.backgroundImage = getImg(swatch);
                        }
                        updatePreview();
                    }
                });
            }
            row.appendChild(cell);
        }
        _canvas.appendChild(row);
    }
}

function initPalette(){
    for(let y = 0; y < _levelchars.length; y++){
        let char = _levelchars[y],
            img = getImg(char);

        let x1 = document.createElement('td'),
            x2 = document.createElement('td'),
            row = document.createElement('tr');
        x1.style.backgroundImage = img;
        x1.className = 'swatch';
        x2.appendChild(document.createTextNode(char));
        row.appendChild(x1);
        row.appendChild(x2);
        _palette.appendChild(row);

        //add event listener
        x1.addEventListener('click', ()=>{
            swatch = char;
            selectSwatch(x1);
        });
    }
}
function getImg(char){
    switch (char){
        case '#':
            return "url('images/wall.png')";
        case '1':
            return "url('images/vert.png')";
        case '2':
            return "url('images/hor.png')";
        case '3':
            return "url('images/bl.png')";
        case '4':
            return "url('images/br.png')";
        case '5':
            return "url('images/tl.png')";
        case '6':
            return "url('images/tr.png')";
        case 'B':
            return "url('images/border.png')";
        case 'D':
            return "url('images/drywall.png')";
        case 'd':
            return "url('images/door.png')";
        case 'l':
            return "url('images/life.png')";
        case 'k':
            return "url('images/key.png')";
        case '.':
            return "none";
    }
    return null;
}
function selectSwatch(selected){
    let swatches = document.querySelectorAll('.swatch');
    for(let s of swatches){
        s.className = 'swatch';
    }
    selected.className += ' selected';
}
function updatePreview(){
    while(_preview.firstChild){
        _preview.removeChild(_preview.firstChild);
    }
    _preview.innerHTML = output();
}
function output(){
    let output = '';
    for(let y = 0; y < _cheight; y++){
        let row = grid[y].join('');
        output += row + '<br>';
    }
    return output;
}