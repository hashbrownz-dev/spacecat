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
                                grid[this.y][this.x] = 'empty';
                            }else if(keys > 0 && currentpos.kind == 'door'){
                                //if it is a door and  you got them keys, open dat bitch
                                keys--;
                                grid[this.y][this.x] = 'empty';
                            }else{
                                //Cannot pass through a solid wall.  The player is moved to their last position.
                                this.x = lastpos.x;
                                this.y = lastpos.y;
                            }
                        }else{
                            if(currentpos.kind == 'key'){
                                score+=_pvKey;
                                keys++;
                            }else{
                                lives++;
                            }
                            grid[this.y][this.x] = 'empty';
                        }
                    }
                    if(lastpos.y > this.y)score+=10; //Get 10 points for advancing a floor.
                    if(this.y == goal)console.log('You Win!');
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
    /*draw(){
        drawSprite(_spr_walls, this.x, this.y, 7, 0);
    }*/
}
class Beam extends Concrete{
    constructor(x,y,piece){
        super(x,y);
        this.piece = piece;
    }
    draw(){
        //let xframe = Number(this.piece);
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
const ctx = canvas.getContext('2d');
const gridChars = {'#':'wall','B':'border','D':'drywall','d':'door','k':'key','l':'life','@':'player','G':'goal', '1':'bvert','2':'bhor','3':'bbcl','4':'bbcr','5':'bbtl','6':'bbtr'};
const controller = trackKeys(['ArrowUp','ArrowLeft','ArrowRight','r','R']);
//Game Parameters
const scale = 24;
const speed = 5; //how many frames pass before an actor can update their position.
const actorCap = 10;
const sTime = 300; //super time in frames
const _pvCoin = 50; //Points for picking up a coin
const _pvFloor = 10; //Points for advancing a floor
const _pvKey = 25; //Points for picking up a key
const _pvEnemy = 100; //Points for killing an enemy
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

let input;
let player; // the variable that refers to the current player object
let actors = []; // an array that contains all of the onscreen actors
let keys = 0; // the amount of keys the player has
let lives = 0; // the amount of lives the player has
let score = 0; // the players current score
let grid; // the grid is our display divided by (scale) pixel cells.  It has 24 columns and 25 rows.
let view; // the viewport
let goal; // a numerical value
let clock = 0;
let timer_spawn = 60;
let timer_reset = 150;
let currentfloor = 0;
let currentlevel = 0;

function game(){
    //getInput(['ArrowUp','ArrowLeft','ArrowRight']);
    function update(){
        clock++;
        getInput();
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
                //Handle or winning
            }else{
                if(lives>=0){
                    if(clock >= timer_reset){
                        player.alive = true;
                        player.frame = 0;
                        player.yframe = 0;
                        clock = 0;
                        for(let a of actors){
                            placeActor(a);
                        }
                    }
                }else{
                    //Draw Game Over Screen
                    console.log('Game Over!!!');
                    //For now we'll put a simple R for restart
                    if(controller['r']||controller['R'])restartGame();
                }
            }
        }
        //DRAWING:
        ctx.clearRect(0,0,canvas.width,canvas.height);
        scrollView();
        drawGrid(grid);
        player.draw();
        drawActors();
        drawGUI();
        debug();
        requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
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
            return new Border(x,y);
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
    let hud = document.getElementById('pinput');
    hud.innerHTML = `Lives: ${lives} Keys: ${keys} Score: ${score}`;
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
            score+=_pvEnemy;
            actors.splice(actors.indexOf(actor),1);// remove the enemy from the actor array
        }else{
            //Player Death
            player.alive = false;
            player.frame = 0;
            player.yframe = 0;
            player.spd = 0;
            lives--;
            clock = 0;
            //Remove all of the enemies from the current screen
            actors = removeEnemies();
            if(lives<0){
                //end game
                console.log('game Over LOSER!!!');
            }
        }
    }else{
        //we need code here for handling our super state
        score+=_pvCoin;
        player.super = true;
        player.stime = 0;
        actors.splice(actors.indexOf(actor),1); // remove the coin from the actor array
    }
}
function trackKeys(keys){
    let down = Object.create(null);
    function track(event){
        //console.log(event.key);
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
function restartGame(){
    console.log('RESTARTING...');
    lives = 3;
    keys = 0;
    score = 0;
    actors = [];
    clock = 0;
    grid = buildLevel(testlevel);
    view = setView(grid);
}
function endLevel(){
    player.alive = false; //keep the player from moving / receiving input
    player.win = true; //display a victory animation as opposed to the death animation
}

let testlevel = `
B2222222222222222222222B
G......................B
B############.#####.###B
B......................B
B#.##.##.##.##.##.##.##B
B......................B
B############.#####.###B
B......................B
B#.##.##.##.##.##.##.##B
B......................B
B############.#####.###B
B......................B
B#.##.##.##.##.##.##.##B
B......................B
B#########...##########B
B......................B
B##...#################B
B......................B
B############.#####.###B
B......................B
B#.##.##.##.##.##.##.##B
B......................B
B#########...##########B
B......................B
B#####..#####.#####.###B
B......................B
B#.##.##.##.##.##.##.##B
B..............d.......B
B#########DDD##########B
B......................B
B...k............l.....B
B#####..#####.#####.###B
B......................B
B222222226...5222222222B
B........1...1.........B
B222222224...3222222222B
B......................B
B#####..#####.#####.###B
B.@....................B
B2222222222222222222222B
`;

grid = buildLevel(testlevel);
view = setView(grid);
game();

//DEBUG

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
