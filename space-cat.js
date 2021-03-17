//Class declarations
class Player{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.alive = true;
        this.super = false;
        this.win = false;
        this.spd = 0;
        this.stime = 0;
        this.frame = 0;
        this.yframe = 0;
    }
    update(){
        //check super state
        if(this.super){
            this.stime++;
            if(this.stime > sTime)this.super = false;
        }
        this.spd++;
        if(this.alive){
            if(air<=0){
                _sfx_death.play();
                player.alive = false;
                player.frame = 0;
                player.yframe = 0;
                player.spd = 0;
                lives--;
                if(lives>=0)drawLives();
                clock = 0;
                //Remove all of the enemies from the current screen
                actors = removeEnemies();
            }
            if(this.spd >= speed){
                if(input){
                    this.frame++;
                    if(this.frame>1)this.frame=0;
                    let lastpos = {x:this.x , y:this.y};
                    switch(input){
                        case 'ArrowUp':
                            this.y--;
                            this.yframe = 2;
                            break;
                        case 'ArrowLeft':
                            this.x--;
                            this.yframe = 1;
                            break;
                        case 'ArrowRight':
                            this.x++;
                            this.yframe = 0;
                            break;
                        default:
                            console.log('YOU SUCK');
                            break;
                    }
                    //Wall Check
                    let currentpos = grid[this.y][this.x];
                    if(currentpos!='empty'){
                        if(currentpos.category == 'wall'){
                            if((this.super && currentpos.solid==false) || currentpos.kind == 'soft'){
                                //break thru the wall
                                _sfx_wall.currentTime = 0;
                                _sfx_wall.play();
                                grid[this.y][this.x] = 'empty';
                            }else if(keys > 0 && currentpos.kind == 'door'){
                                //if it is a door and  you got them keys, open dat bitch
                                _sfx_door.play();
                                keys--;
                                drawKeys();
                                grid[this.y][this.x] = 'empty';
                            }else{
                                //Cannot pass through a solid wall.  The player is moved to their last position.
                                _sfx_stuck.currentTime = 0;
                                _sfx_stuck.play();
                                this.x = lastpos.x;
                                this.y = lastpos.y;
                            }
                        }else{
                            if(currentpos.kind == 'key'){
                                //Pick up a key
                                _sfx_key.play();
                                updateScore(_pvKey);
                                keys++;
                                if(keys>_maxitem){
                                    keys = _maxitem;
                                    updateScore(_pvKey*5);
                                }
                                drawKeys();
                            }else{
                                _sfx_life.play();
                                lives++;
                                if(lives>_maxitem){
                                    lives = _maxitem;
                                    updateScore(_pvKey*5);
                                }
                                drawLives();
                            }
                            grid[this.y][this.x] = 'empty';
                        }
                    }
                    if(lastpos.y > this.y){
                        updateFloor();
                        updateScore(_pvFloor); //Get 10 points for advancing a floor.
                    }
                    if(this.y == goal){
                        this.alive = false;
                        this.win = true;
                        //play sound change context menu
                        _sfx_win.play();
                        context.innerHTML = 'Level Complete <br> BONUS 1000';
                        updateScore(1000);
                    }
                    this.spd = 0;
                }
            }
        }else{
            //if the player isn't alive, he either won the level or lost it
            if(this.win){
                //display victory animation
            }else{
                //display death animation
                if(this.spd >= speed*2){
                    this.spd = 0;
                    this.frame++;
                    if(this.frame>8)this.frame=8;
                }
            }
        }
    }
    draw(){
        let spr;
        if(this.super){
            spr = _spr_super;
        }else if(!this.alive){
            spr = _spr_dead;
        }else{
            spr = _spr_player;
        }
        //drawRect(this.x,this.y);
        drawSprite(spr,this.x,this.y,this.frame,this.yframe);
    }
}
class Wall{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.category = 'wall';
        this.solid = false;
        this.kind = 'wall';
    }
    draw(){
        drawSprite(_spr_walls, this.x, this.y, 0, 0);
    }
}
class Concrete{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.category = 'wall';
        this.solid = true;
        this.kind = 'concrete';
    }
}
class Beam extends Concrete{
    constructor(x,y,piece){
        super(x,y);
        this.piece = piece;
    }
    draw(){
        drawSprite(_spr_walls, this.x, this.y, this.piece, 0);
    }
}
class Border extends Concrete{
    constructor(x,y){
        super(x,y);
    }
    draw(){
        drawSprite(_spr_walls, this.x, this.y, 7, 0);
    }
}
class Goal extends Concrete{
    constructor(x,y){
        super(x,y);
    }
    draw(){
        drawSprite(_spr_goal, this.x, this.y, 0, 0);
        let gline = ((this.y - view.y) * scale) + scale;
        ctx.strokeStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(scale,gline);
        ctx.lineTo(canvas.width-scale,gline);
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}
class Drywall{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.category = 'wall';
        this.solid = false;
        this.kind = 'soft';
    }
    draw(){
        drawSprite(_spr_walls, this.x, this.y, 8, 0);
    }
}
class Door{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.category = 'wall';
        this.solid = false;
        this.kind = 'door';
    }
    draw(){
        drawSprite(_spr_walls, this.x, this.y, 9, 0);
    }
}
class Actor{
    constructor(x,y,dir){
        this.x = x;
        this.y = y;
        this.spd = 0;
        this.dir = dir;
        this.lastdir = this.dir;
    }
    update(){
        this.spd++;
        if(this.spd >= speed){
            this.spd = 0;
            this.frame++;
            if(this.y > view.bottom){
                if(actors.length >= actorCap){
                    replaceActor(this);
                }else{
                    placeActor(this);
                }
            }
            if(grid[this.y+1][this.x] == 'empty'){
                if(this.dir != 'down')this.lastdir = this.dir;
                this.dir = 'down';
            }
            switch (this.dir){
                case 'down':
                    this.y++;
                    if(this.col){
                        this.y--;
                        this.dir = this.lastdir;
                    }
                    break;
                case 'left':
                    this.x--;
                    if(this.col){
                        this.x++;
                        this.dir = 'right';
                        this.lastdir = this.dir;
                    }
                    break;
                case 'right':
                    this.x++;
                    if(this.col){
                        this.x--;
                        this.dir = 'left';
                        this.lastdir = this.dir;
                    }
                    break;
            }
        }
    }
    get col(){
        //Check for walls
        if(grid[this.y][this.x]!='empty')return true;
        //Check for actors
        for(let actor of actors){
            if(this != actor){
                if(this.x == actor.x && this.y == actor.y)return true;
            }
        }
        return false;
    }
    get subpix(){
        return scale/speed*this.spd;
    }
}
class Enemy extends Actor{
    constructor(x,y,dir){
        super(x,y,dir);
        this.kind = 'enemy';
        this.frame = 0;
    }
    draw(){
        //ctx.fillStyle = 'red';
        //drawRect(this.x,this.y);
        if(this.frame > 1)this.frame = 0;
        let yframe = 0;
        if(this.dir == 'right') yframe = 1;
        if(this.dir == 'down') yframe = 2;
        drawSprite(_spr_ogre,this.x,this.y,this.frame,yframe);
        
    }
}
class Coin extends Actor{
    constructor(x,y,dir){
        super(x,y,dir);
        this.kind = 'coin';
        this.frame = 0;
    }
    draw(){
        if(this.frame > 7)this.frame = 0;
        drawSprite(_spr_coin,this.x,this.y,this.frame);
    }
}
class Key{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.category = 'item';
        this.kind = 'key';
    }
    draw(){
        drawSprite(_spr_key,this.x,this.y);
    }
}
class Life{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.category = 'item';
        this.kind = 'life';
    }
    draw(){
        drawSprite(_spr_life,this.x,this.y);
    }
}
class View{
    constructor(y){
        this.y = y;
        this.height = 25;
        this.bottom = this.y + this.height;
    }
    update(){
        this.bottom = this.y + this.height;
    }
}

//Initialization
const canvas = document.getElementById('display');
const context = document.getElementById('context');
const help = document.getElementById('help');
const ctx = canvas.getContext('2d');
const gridChars = {'#':'wall','B':'border','D':'drywall','d':'door','k':'key','l':'life','@':'player','G':'goal', '1':'bvert','2':'bhor','3':'bbcl','4':'bbcr','5':'bbtl','6':'bbtr'};
const controller = trackKeys(['ArrowUp','ArrowLeft','ArrowRight','r','R',' ','Spacebar','h','H','y','Y','n','N']);
//Game Parameters
const scale = 24;
const speed = 7; //how many frames pass before an actor can update their position.
const actorCap = 10;
const sTime = 300; //super time in frames
const _pvCoin = 50; //Points for picking up a coin
const _pvFloor = 10; //Points for advancing a floor
const _pvKey = 25; //Points for picking up a key
const _pvEnemy = 100; //Points for killing an enemy
const _second = 60;
const _maxair = 90;
const _maxitem = 5;

//Sprites
const _spr_player = document.createElement('img');
_spr_player.src = 'images/Cat.png';
const _spr_super = document.createElement('img');
_spr_super.src = 'images/Super-Cat.png';
const _spr_dead = document.createElement('img');
_spr_dead.src = 'images/Dead-Cat.png';
const _spr_ogre = document.createElement('img');
_spr_ogre.src = 'images/OgreSimple.png';
const _spr_walls = document.createElement('img');
_spr_walls.src = 'images/Walls.png';
const _spr_coin = document.createElement('img');
_spr_coin.src = 'images/Coin.png';
const _spr_key = document.createElement('img');
_spr_key.src = 'images/Key.png';
const _spr_life = document.createElement('img');
_spr_life.src = 'images/Life.png';
const _spr_goal = document.createElement('img');
_spr_goal.src = 'images/Goal.png';

//SFX
const _sfx_death = new Audio('sounds/sfx_cat-die.wav'); //Death
const _sfx_gameover = new Audio('sounds/sfx_cat-lose.wav'); //Game Over
const _sfx_win = new Audio('sounds/sfx_cat-win.wav'); //Level Complete
const _sfx_coin_get = new Audio('sounds/sfx_coin-get.wav'); //Grab Coin
const _sfx_coin_spawn = new Audio('sounds/sfx_coin-spawn.wav'); //Spawn Coin
const _sfx_door = new Audio('sounds/sfx_door.wav'); //Open Door
const _sfx_floor = new Audio('sounds/sfx_floor.wav'); //Floor Transition
const _sfx_key = new Audio('sounds/sfx_key.wav'); //Grab Key
const _sfx_life = new Audio('sounds/sfx_life.wav'); //Grab Life
const _sfx_ogre = new Audio('sounds/sfx_ogre.wav'); //Kill Ogre
const _sfx_walk = new Audio('sounds/sfx_walk.wav'); //Cat Walk
const _sfx_wall = new Audio('sounds/sfx_wall.wav'); //Break Wall
const _sfx_stuck = new Audio('sounds/sfx_cat-stuck.wav'); //Cat Stuck

let input;
let player; // the variable that refers to the current player object
let actors = []; // an array that contains all of the onscreen actors
let keys = 1; // the amount of keys the player has
let lives = 1; // the amount of lives the player has
let score = 0; // the players current score
let grid; // the grid is our display divided by (scale) pixel cells.  It has 24 columns and 25 rows.
let view; // the viewport
let goal; // a numerical value
let clock = 0;
let timer_spawn = 60;
let timer_reset = 150;
let currentfloor = 0;
let currentlevel = 0;
let currentloop = 0;
let air = _maxair;
let timer_air = 0;


loadTitle();
game();

function game(){
    function update(){
        if(player){
            clock++;
            getInput();
            //timer
            if(player.alive){
                timer_air++;
                if(timer_air >= _second){
                    timer_air = 0;
                    air--;
                    updateTimer();
                }
            }
            //update and redraw all sprites
            player.update();
            if(player.alive){
                //Spawn Enemy
                if(clock >= timer_spawn)spawnActor();
                for(let actor of actors){
                    actor.update();
                }
                //Check for Collisions:
                for(let actor of actors){
                    if(overlap(player,actor))touchActor(actor);
                }
            }else{
                if(player.win){
                    //Handle for winning
                    if(clock >= timer_reset){
                        currentlevel++;
                        if(currentlevel >= _levels.length){
                            currentlevel = 1;
                            currentloop++;
                        }
                        player.alive = true;
                        context.innerHTML = '';
                        loadLevel();
                    }
                }else{
                    if(lives>=0){
                        if(clock >= timer_reset){
                            player.alive = true;
                            player.frame = 0;
                            player.yframe = 0;
                            clock = 0;
                            timer_air = 0;
                            air = _maxair;
                            updateTimer();
                            for(let a of actors){
                                placeActor(a);
                            }
                        }
                    }else{
                        //Draw Game Over Screen
                        context.innerHTML = "GAME OVER <BR> Play Again?<BR> <em>Y</em> / <em>N</em>";
                        if(controller['y']||controller['Y'])startGame();
                        if(controller['n']||controller['N']){
                            player = undefined;
                            currentlevel = 0;
                            currentloop = 0;
                            loadTitle();
                        }
                    }
                }
            }
        }else{
            if(controller['h']||controller['H']) help.style.display = 'block'; 
            if(controller[' ']||controller['Spacebar']){
                help.style.display = 'none';
                startGame();
            }
        }
        //DRAWING:
        ctx.clearRect(0,0,canvas.width,canvas.height);
        if(player){
            scrollView();
            player.draw();
        }
        drawGrid(grid);
        drawActors();
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}
function concatLevel(...tiles){
    let level = _goal;
    for(let tile of tiles){
        level += _tiles[tile];
    }
    level += _start;
    return level;
}
function buildLevel(level){
    let rows = level.trim().split('\n').map(l => [...l]);
    let grid = [];
    for(let y = 0; y < rows.length; y++){
        let row = [];
        for(let x = 0; x < rows[0].length; x++){
            let char = rows[y][x];
            row.push(populate(char,x,y));
        }
        grid.push(row);
    }
    return grid;
}
//populate works with buildLevel to populate our grid with the appropriate objects
function populate(char,x,y){
    let type = gridChars.hasOwnProperty(char) ? gridChars[char] : 'empty';
    if(type=='player'){
        player = new Player(x,y);
        return 'empty';
    }
    switch(type){
        case 'wall':
            return new Wall(x,y);
        case 'border':
            return new Border(x,y);
        case 'drywall':
            return new Drywall(x,y);
        case 'door':
            return new Door(x,y);
        case 'key':
            return new Key(x,y);
        case 'life':
            return new Life(x,y);
        case 'goal':
            goal = y;
            return new Goal(x,y);
        case 'bvert':
            return new Beam(x,y,1);
        case 'bhor':
            return new Beam(x,y,2);
        case 'bbcl':
            return new Beam(x,y,3);
        case 'bbcr':
            return new Beam(x,y,4);
        case 'bbtl':
            return new Beam(x,y,5);
        case 'bbtr':
            return new Beam(x,y,6);
        default:
            return 'empty';
    }
}
function drawGrid(grid){
    for(let y = view.y; y < view.bottom; y++){
        for(let x = 0; x < grid[0].length; x++){
            if(grid[y][x] != 'empty'){
                grid[y][x].draw();
            }
        }
    }
}
function drawActors(){
    for(let actor of actors){
        actor.draw();
    }
}
function drawGUI(){
    //let hud = document.getElementById('pinput');
    //hud.innerHTML = `Lives: ${lives} Keys: ${keys} Score: ${score}`;

}
function drawRect(ox,oy){
    let x = ox * scale;
    let y = (oy - view.y) * scale;
    ctx.fillRect(x,y,scale,scale);
}
function drawSprite(src,ox,oy,xframe = 0,yframe = 0){
    let x = ox * scale;
    let y = (oy - view.y) * scale;
    let sx = xframe*scale;
    let sy = yframe*scale;
    //cframe * scale, cframe * scale, cframe * scale + scale
    ctx.drawImage(src,sx,sy,scale,scale,x,y,scale,scale);
}
function overlap(obj1,obj2){
    //check if two items have the same x and y;
    if(obj1.x==obj2.x && obj1.y==obj2.y){
        return true;
    }else{
        return false;
    }
}
function touchActor(actor){
    //do something
    if(actor.kind == 'enemy'){
        if(player.super){
            //Kill Enemy
            _sfx_ogre.currentTime = 0;
            _sfx_ogre.play();
            updateScore(_pvEnemy);
            actors.splice(actors.indexOf(actor),1);// remove the enemy from the actor array
        }else{
            //Player Death
            _sfx_death.play();
            player.alive = false;
            player.frame = 0;
            player.yframe = 0;
            player.spd = 0;
            lives--;
            if(lives>=0)drawLives();
            clock = 0;
            //Remove all of the enemies from the current screen
            actors = removeEnemies();
        }
    }else{
        //Grab Coin
        _sfx_coin_get.play();
        updateScore(_pvCoin);
        player.super = true;
        player.stime = 0;
        actors.splice(actors.indexOf(actor),1); // remove the coin from the actor array
    }
}
function trackKeys(keys){
    let down = Object.create(null);
    function track(event){
        event.preventDefault();
        if(keys.includes(event.key)) {
            down[event.key] = event.type == 'keydown';
        }
    }
    window.addEventListener('keydown', track);
    window.addEventListener('keyup', track);
    return down;
}
function getInput(){
    input=undefined;
    if(controller['ArrowRight'])input ='ArrowRight';
    if(controller['ArrowLeft'])input = 'ArrowLeft';
    if(controller['ArrowUp'])input = 'ArrowUp';
}
function setView(grid){
    //modify this to take an origin point
    let v = new View(grid.length-25);
    return v;
}
function scrollView(){
    //get the player's relative position.
    let playerY = player.y - view.y;
    //if the player's relative height is higher than halfawy, scroll the screen.
    if(playerY <= Math.ceil(view.height/2))view.y--;
    if(view.y < 0)view.y = 0;
    view.update();
}
function spawnActor(){
    if(actors.length < actorCap){
        //coin flip for direction
        let dir='right';
        if(Math.floor((Math.random()*100)+1)%2)dir='left';
        //1 in 10 shot of spawning a coin instead of an enemy
        let n = Math.floor((Math.random()*10)+1);
        if(n==10){
            let actor = new Coin(0,0,dir);
            actors.push(actor);
            placeActor(actor);
            _sfx_coin_spawn.currentTime = 0;
            _sfx_coin_spawn.play();
        }else{
            let actor = new Enemy(0,0,dir);
            actors.push(actor);
            placeActor(actor);
        }
    }
    clock = 0;
}
function placeActor(actor){
    //the 'valid'spawn point needs to be at least 1 grid spot above the y
    let targetY = view.y-1;
    let targetX = Math.floor((Math.random()*(grid[0].length-2))+1);
    if(targetY < 1)targetY = 1;
    if(grid[targetY][targetX]=='empty'){
        actor.x = targetX;
        actor.y = targetY;
    }else{
        placeActor(actor);
    }
}
function replaceActor(actor){
    actors.splice(actors.indexOf(actor),1);
    spawnActor();
}
function removeEnemies(){
    let output = [];
    for(let actor of actors){
        if(actor.kind != 'enemy')output.push(actor);
    }
    return output;
}
function startGame(){
    //clear context message
    context.innerHTML = '';
    //reinitialize values
    currentlevel = 1;
    lives = 3;
    keys = 1;
    score = 0;
    air = _maxair;
    actors = [];
    clock = 0;
    updateScore(0);
    updateTimer();
    drawKeys();
    drawLives();
    loadLevel();
}
function endLevel(){
    player.alive = false; //keep the player from moving / receiving input
    player.win = true; //display a victory animation as opposed to the death animation
}
function updateFloor(){
    currentfloor = grid.length - player.y - 4;
    document.getElementById('floor').innerHTML = currentfloor.toString();
}
function updateScore(points){
    let s = document.getElementById('score');
    score += points;
    s.innerHTML = score.toString().padStart(7,'0');
}
function updateTimer(){
    let p = Math.floor((air / _maxair) * 100);
    let timer = document.querySelector('#shell > div');
    timer.style.height = `${p}%`;
}
function drawKeys(){
    const k = document.getElementById('keys');
    while (k.firstChild){
        k.removeChild(k.firstChild);
    }
    for(let i = 0; i < keys; i++){
        let ki = document.createElement('img');
        ki.src = 'images/Key.png';
        ki.className = 'icon';
        k.appendChild(ki);
    }
}
function drawLives(){
    const l = document.getElementById('lives');
    while (l.firstChild){
        l.removeChild(l.firstChild);
    }
    for(let i = 0; i < lives; i++){
        let li = document.createElement('img');
        li.src = 'images/Life.png';
        li.className = 'icon';
        l.appendChild(li);
    }
}
function loadLevel(){
    //Update Scene
    const s = document.getElementById('scene');
    s.innerHTML = (currentlevel+((_levels.length-1)*currentloop)).toString().padStart(2,'0');
    //Reset Clock and Air Timer
    clock = 0;
    timer_air = 0;
    air = _maxair;
    //Reset Actors
    actors = [];
    grid = buildLevel(concatLevel(..._levels[currentlevel]));
    view = setView(grid);
    updateFloor();
    updateTimer();
}
function loadTitle(){
    context.innerHTML = "Press <em>'SPACEBAR'</em> to Begin <br> Press <em>'H'</em> for Help";
    grid = buildLevel(_levels[currentlevel]);
    view = setView(grid);
    drawGrid(grid);
}

//DEBUG
/*
let pinput = document.getElementById('pinput');
let dbg = document.createElement('p');
document.body.appendChild(dbg);
function debug(){
    //debug enemies
    let a = actors[0];
    let output = `clock: ${clock}<br>viewY: ${view.y} viewTop: ${view.top} viewBottom: ${view.bottom}<br>`;
    for(let actor of actors){
        print(actor);
    }
    dbg.innerHTML = output;
    function print(a){
        output += `x: ${a.x} y: ${a.y} dir: ${a.dir} lastdir: ${a.lastdir} speed: ${a.spd} kind: ${a.kind}<br>`;
    }
   //debug player
   //dbg.innerHTML = `Player.spd ${player.spd} input: ${input} Controller Up: ${controller['ArrowUp']} Left: ${controller['ArrowLeft']} Right: ${controller['ArrowRight']}`;
}
*/