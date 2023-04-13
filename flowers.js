//.... Global .....//
let left = false;

//class........................................................................//

class Stem {
    constructor(x, y, len, angle, Segmentparent, Top, flower = false) {
        this.Top = Top; // is this the last seg?
        this.flower = flower; //is this a flower?
        this.parent = Segmentparent;
        this.stroke = 5;

        if (this.parent != null) {
            this.a = createVector(this.parent.b.x, this.parent.b.y);
            this.stroke = this.parent.stroke / 1.5;
            this.G = this.parent.G - 25;
            this.B = this.parent.B + 50;
        } else {
            this.a = createVector(x, y);
        }

        this.angle = angle;
        this.b;
        this.len = len;
        this.selfAngle = angle;
        this.xoff = random(10000);
        
        this.calcB();
        this.setAttributes();

        this.Mouse = 0;


    }

    setAttributes() {
        //color
        this.R = 10;
        this.B = 25;
        this.G = 100 + random(0, 100);
        this.A = 200 - random(0, 10);
        //flower
        if (this.flower == true) {
            this.side = random(-25, 25); //indicates the side the leafs are on.
            this.FR = random(120, 255);
            this.FG = random(0, 60);
            this.FB = random(0, 80);
            this.PS = random(1, 5); //petal size
        }
        if (this.top = true) {
            this.k = random(5, 10);
            this.n = random(1, 5);
            this.d = random(1, 2);
            this.size = random(3, 6);
        }

    }

    draw() {
        stroke(this.R, this.G, this.B, this.A)
        strokeWeight(this.stroke);
        line(this.a.x, this.a.y, this.b.x, this.b.y);
        this.update();
    }

    calcB() {
        let dx = this.len * cos(this.angle);
        let dy = this.len * sin(this.angle);
        this.b = createVector(this.a.x + dx, this.a.y + dy);
    }

    interact() {
        let maxangle = -PI / 2 + 0.01;
        let minangle = -PI / 2 - 0.1;
        // The interact method below will get the direction of the mouse in relation to its distance to individual segment joints
        //and save the distance + the current plant angle to Mouse
        if (mouseY < height && mouseX < width && mouseX > 0) {
            if (dist(this.a.y, this.a.x, mouseY, mouseX) < 70) {
                if (pmouseX - mouseX >= 1.5 || left == true) {
                    this.Mouse = maxangle + dist(this.a.y, this.a.x, mouseY, mouseX) / 80;
                } else if (pmouseX - mouseX <= 2.5) {
                    this.Mouse = -(maxangle + dist(this.a.y, this.a.x, mouseY, mouseX) / 80);  
                }
                //Pollen control
                if(frameCount%2 == 0 && this.flower == true ){
                    Pollen.push(new pollen(this.b.x,this.b.y));
                }
            }
        }
        //Mouse offsets the wiggle angle of the plant, allowing users to "Brush" the grass
        this.selfAngle = map(sin(this.xoff + this.Mouse), 0, 1, maxangle + this.Mouse, minangle + this.Mouse) + map(noise(this.xoff), 0, 1, -0.01, 0.005)
        this.xoff += 0.06;
        
        this.straighten();
        //this.selfAngle = this.selfAngle + 0.01;
    }

    straighten(){
        if(this.Mouse > 0.2 && this.flower == false){
            this.Mouse -= 0.02;
        } else if(this.Mouse <= -0.2 && this.flower == false){
            this.Mouse += 0.02;
        }

        if(this.Mouse > 0.2 && this.flower == true){
            this.Mouse -= 0.01;
        } else if(this.Mouse <= -0.2 && this.flower == true){
            this.Mouse += 0.02;
        }
    }

    update() {

        this.angle = this.selfAngle;
        if (this.parent != null) {
            this.a = this.parent.b;
        }

        this.calcB();
        this.interact();

        if (this.flower == true) {
            this.Petal();
            if (this.Top == true) {
                this.Flower();
            }
        }
    }

    Petal() {
        stroke(0);
        strokeWeight(0.3);

        fill(this.FR, this.FG, this.FB);
        line(this.a.x, this.a.y, this.b.x + this.side, this.b.y * 1.03)
        circle(this.b.x + this.side, this.b.y * 1.03, this.PS);
        this.Flower();

    }
    Flower() {
        let k = this.k; // Controls the number of petals
        let n = this.n; // Controls the tightness of the petals
        let d = this.d; // Controls the number of complete rotations

        beginShape();
        stroke(this.FR/2, this.FR/5, this.FR);
        noFill(255);
        strokeWeight(0.9);
        for (let a = 0; a < TWO_PI * d; a += 0.02) {
            let r = 200 * sin(n * a) / this.size*1.2;
            let x = r * cos(k * a) / 3;
            let y = r * sin(k * a) / 3;
            vertex(this.b.x + this.side + x, this.b.y + y);
        }
        endShape();

    }
}

class pollen{
    constructor(x,y){
        this.pos = createVector(x,y);
        this.velocity = createVector(0,random(0,20));
        this.accel = createVector(-0.02,0);
        this.life = random(10,50);
        this.dead = false;

        this.theta = random(5);
    }

    update(){
        this.lifeSpan();
        this.move();
        this.draw();
    }
    lifeSpan(){
        this.life -=1;
        if(this.life <= 0){
            this.dead = true;
        }
    }
    move(){
        this.theta += 0.002;
        this.accel.x = sin(this.theta);
        this.velocity.add(this.accel);
        this.pos.add(this.velocity);
    }

    draw(){
        fill(255,35,0,200)
        circle(this.pos.x,this.pos.y,3);
    }

}


//Main..........................................................................//

let grass = [];
let Flowers = [];

let grad;

let Pollen = [];

function setup() {
    var canvas = createCanvas(1080, 500);

    grad = loadImage('/./Images/Gradient.png');
    
    canvas.parent('flowerFrame');
    

    for (let i = 0; i < 700; i++) {
        let segment = new Stem(random(0, width), random(height+20,height-20), random(10, 50), radians(-90), null, false);
        let Child = new Stem(0, 0, random(10, 30), radians(-90), segment, false);
        grass.push(segment);
        grass.push(Child);
        grass.push(new Stem(0, 0, random(10, 20), radians(-90), Child, true));
    }
    for (let i = 0; i < 10; i++) {
        let segment = new Stem(random(100, width - 100), height, random(50, 100), radians(-90), null, false);
        let Child = new Stem(0, 0, random(70, 90), radians(-90), segment, false, false);
        let Child2 = new Stem(0, 0, random(30, 70), radians(-90), Child, false, true);
        let Child3 = new Stem(0, 0, random(10, 30), radians(-90), Child2, true, true);//top

       
        Flowers.push(segment);
        Flowers.push(Child);
        Flowers.push(Child2);
        Flowers.push(Child3); // top of the flower

        if(random(0,10) < 7){
            let Child4 = new Stem(0, 0, random(10, 70), radians(-90), Child3, true, true);//top
            Flowers.push(Child4);
            
            if(random(0,10) < 7){
                let Child5 = new Stem(0, 0, random(20, 50), radians(-90), Child4, true, true);//top
                Flowers.push(Child5);
            }
        } 
    }


    
}


//inverse kinimatics with Math roses at the tip.  r = a cos (pdk) see wiki
function draw() {

    

    background('#C8A2C8');

    textSize(49);
    fill(255);
    text('Hydrangers', 10, 60);

    for (let i = 0; i < grass.length; i++) {
        grass[i].draw();
    }
    for (let i = 0; i < Flowers.length; i++) {
        Flowers[i].draw();
    }

    for(let i = 0; i < Pollen.length; i++){
        Pollen[i].update();
        if(Pollen[i].dead == true){
            Pollen.pop();
        }
    }



}

function mouseMoved(){
    
    if(mouseX < pmouseX){
        left = true;
    } else {
        left = false;
    }

}

