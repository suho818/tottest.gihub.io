let score = 0;
let gameState = 1; // 0 = 게임 정지, 1 = 게임 실행
// --- 커스텀 세팅 ---
let sizeCoefficient = 0.2;

// 📕--- 초기 세팅 ---
const Engine = Matter.Engine,
World = Matter.World,
Bodies = Matter.Bodies;
Body = Matter.Body;
Composites = Matter.Composites;
Common = Matter.Common;
Vertices = Matter.Vertices;
Svg = Matter.Svg;
Composite = Matter.Composite;
Events = Matter.Events;
Render = Matter.Render;
// --- 초기 세팅 ---


// 📕Engine.create() 함수를 사용하여 Matter.js 엔진을 생성한다.
const engine = Engine.create();
// 📕렌더링할 컨테이너 역할 부분의 id를 가져온다.(getElementById)
const container = document.getElementById("container");
const scoreText = document.getElementById("score");
const screen_height = container.offsetHeight;
const screen_width = container.offsetWidth;

// 📕Matter.Render.create() 함수를 사용하여 시각적인 렌더링을 담당하는 객체를 생성한다.
const renderer = Render.create({
element: container, // 렌더러가 그릴 HTML요소를 지정해준다.
engine: engine, // 렌더러에 사용될 Matter.js 엔진을 지정해준다.
options: {
  // 커스텀 옵션들을 설정해준다.
width: screen_width,
height: screen_height,
wireframes: false, //wireframe 여부
background: "#eee7e0",
},
});

// 사탕 만들기
const createCircle = (width, color, x, y) => {
    const rm = Math.floor(Math.random() * 4);
    const Circle = Bodies.circle(x,y, width,{
    ...physics,
    render: {
      sprite: {
        texture: `https://github.com/suho818/tottest.gihub.io/tree/main/image/candy${rm+1}.png`,
        xScale: 1.9*sizeCoefficient,
        yScale: 1.9*sizeCoefficient
      }
    }
  });
  
  return Circle
  }

// 📕경계 벽 생성하는 부분 (순서대로 왼쪽, 오른쪽, 아래이다. isStatic은 바디를 정적으로 만들어 물리 시뮬레이션에 영향을 주지 않도록 한다.)
// 🧐 여기선 왜 위쪽 벽을 설정하지 않았을까? -> 떨어지는 효과를 나타내야하기 때문이다.

const walls = [
    Bodies.rectangle(-5, 0, 10, screen_height * 2, {
      isStatic: true,
    }),
    Bodies.rectangle(
      screen_width+5,
      0,
      10,
      screen_height * 2,
      { isStatic: true }
    ),
    Bodies.rectangle(
        0,
        screen_height+2*115*sizeCoefficient,
        screen_width * 2,
        1,
        { label: 'gameover_detector',
            isStatic: true }
      )
    ];


class Ghost {
    isCandyAttached = false;
    isMissionComplete = false;
    isWallPassed = false;
    isWallTouched = true;
    candy = null;
    randomMoveTimeOut = null;
    image = ['https://github.com/suho818/tottest.gihub.io/tree/main/image/cuteghost-right.png', 'https://github.com/suho818/tottest.gihub.io/tree/main/image/cuteghost.png']
        constructor(x, y, speed) {
            // 유령 이미지 및 물리 객체 설정
            this.body = Bodies.rectangle(x, y, 80, 80, {
                render: {
                    sprite: {
                        texture: this.image[0],
                        xScale: 0.12,
                        yScale: 0.12
                    }
                },
                isStatic: true,  // 물리적으로는 움직이지 않음, 애니메이션만 적용
                collisionFilter: {
                    group: -1,
                    mask: 0
                }
            });
            this.speed = speed;  // 유령의 속도
            this.direction = 1;  // 유령의 방향 (1: 오른쪽, -1: 왼쪽)
    
            // 유령을 월드에 추가
            World.add(engine.world, this.body);
        }
    
        // 유령의 좌우 이동 함수
        move() {
           
            const currentX = this.body.position.x;
            if (currentX <= screen_width - 170 && currentX >= 170)
            {
                this.isWallTouched = false;
            }
            if(this.isMissionComplete){
                clearTimeout(this.randomMoveTimeOut);
                if (currentX >= screen_width + 100 || currentX <= -100){
                    World.remove(engine.world, this.body);
                }
            }
            else if (currentX >= screen_width - 120 || currentX <= 120) {
                if(!this.isWallPassed){
                    if (currentX <= 0) {
                        this.isWallPassed=true;
                        this.direction = 1;
                        this.body.render.sprite.texture = this.image[0.5 - 0.5*this.direction];
                        //this.randomMoveTimeOut = setTimeout(() => this.randomMove(), 2000+Math.random()*5000)
                    }
                    else{
                        this.isWallPassed=true;
                        this.direction = -1;
                        this.body.render.sprite.texture = this.image[0.5 - 0.5*this.direction];
                        //this.randomMoveTimeOut = setTimeout(() => this.randomMove(), 2000+Math.random()*5000)
                    }
                }
                // 벽에 부딪히면 방향 변경
                else if (!this.isWallTouched){
                this.isWallTouched = true;
                clearTimeout(this.randomMoveTimeOut);
                //this.randomMoveTimeOut = setTimeout(() => this.randomMove(), 100+Math.random()*5000);
                this.direction *= -1;
                // 유령이 방향을 바라보도록 반전
                this.body.render.sprite.texture = this.image[0.5 - 0.5*this.direction];
            }
            }

            Body.setPosition(this.body, { x: currentX + this.speed * this.direction, y: this.body.position.y });
            if (this.isCandyAttached){
                Body.setPosition(this.candy, { x: 55*this.direction + currentX + this.speed * this.direction, y: this.body.position.y - 7 });
            }
        }
        
        randomMove() {
            this.direction *= -1;
            this.body.render.sprite.texture = this.image[0.5 - 0.5*this.direction];
            this.randomMoveTimeOut = setTimeout(() => this.randomMove(), 100+Math.random()*5000);
        }

        creatCandy(){
            this.candy = createCircle(115*sizeCoefficient, "#9a3d90", this.body.position.x+55*this.direction, this.body.position.y);
            Body.setAngularVelocity(this.candy, 0.1+Math.random()*0.1);
            World.add(engine.world, this.candy);
            this.#attachCandy(this.candy);
            
        }
        
        #attachCandy(candy){ //#이 붙으면, private method = 클래수 내부에서만 접근 가능
            this.isCandyAttached = true;
            Body.setStatic(candy, true); //candy 객체를 정적(힘이나 중력의 영향X)으로 변환
            setTimeout(() => this.#dettachCandy(candy), 6000);
        }

        #dettachCandy(candy){
            this.isCandyAttached = false;
            Body.setStatic(candy, false);
            Body.applyForce(candy, candy.position, { x: 0.01*this.direction*(sizeCoefficient*10)**2, y: -0.01*(sizeCoefficient*10)**2 });
            candy.label = 'Circle';
            this.isMissionComplete = true;
        }
        
        
    }

// 📕물리적 특성을 설정하는 객체인 physics를 정의한다.
const physics = {
    restitution: 0.1, // 복원력 또는 탄성력 (0~1 사이에 지정해줌. 1에 가까워질 수록 충돌 후 빠르게 원래 형태로 돌아간다.)
    friction: 1, // 마찰 계수 (0~1 사이에 지정해줌. 1에 가까워질 수록 강한 마찰이 발생한다.)
    
    frictionAir:0.03 // 이거는 공기저항이라는데 이것도 구라같음
    };    

        
// 📕World.add()로 물리 엔진 세계에 다양한 물체들을 추가(배열 안에 설정해놓은 변수들을 펼침연산자로 추가한다.)
World.add(engine.world, [...walls]);
// 📕Engine.run()로 Matter.js 엔진을 실행
Engine.run(engine);

// 📕Render.run()호출하여 렌더러 실행
Render.run(renderer);

function ghostAppear(){
    let randomVar = 0;
    if (Math.random()<0.5){
        randomVar = 1;
    }
    else{
        randomVar = -1;
    }
    const ghost = new Ghost(screen_width/2+(100+screen_width/2)*randomVar,100, 2)
    ghost.creatCandy();
    moveInterval = setInterval(() => ghost.move(), 20);
    
}


const marginMax = 0.005;

// Canvas 클릭 이벤트 등록
document.addEventListener('mousedown', function(event) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    // 월드에 있는 모든 객체에 대해 클릭 여부를 확인
    candyIsClicked(mouseX,mouseY);
});


// Canvas 터치 이벤트 등록
document.addEventListener('touchstart', function(event) {
     // 터치 위치를 얻음
     const touch = event.touches[0];
     const touchX = touch.clientX;
     const touchY = touch.clientY;
     candyIsClicked(touchX,touchY);
    
});

function candyIsClicked(X,Y) {
    // 월드에 있는 모든 객체에 대해 클릭 여부를 확인
    if (gameState==1){
    engine.world.bodies.forEach(function(body) {
        
        // 사탕 객체만 확인 (라벨이 'Candy'라고 가정)
        if (body.label === 'Circle') {  // 기본적으로 circle 객체는 'Circle Body' 라벨을 가짐
            // 마우스 클릭 위치가 사탕의 경계 안에 있는지 확인
            if (Matter.Bounds.contains(body.bounds, { x: X, y: Y })) {
                score+=1;
                scoreText.textContent = `score: ${score}`;
                // 사탕에 위로 힘을 가함
                marginX = (body.position.x-X)*0.01;
                if (marginX>marginMax){
                    marginX=marginMax;
                }
                else if(marginX<-marginMax){
                    marginX=-marginMax;
                }
                Body.applyForce(body, body.position, { x: marginX*(sizeCoefficient*10)**2, y: -0.045*(sizeCoefficient*10)**2 });
                Body.setAngularVelocity(body, body.angularVelocity+marginX*80);
            }
        }
        
    });
}
}


// 충돌 감지 이벤트 등록
Matter.Events.on(engine, 'collisionStart', function(event) {
    const pairs = event.pairs;

    // 충돌한 객체들에 대해 라벨을 확인
    pairs.forEach(function(pair) {
        const { bodyA, bodyB } = pair;

        // Circle 라벨을 가진 객체가 gameover_detector 라벨을 가진 객체와 충돌했을 때
        if ((bodyA.label === 'Circle' && bodyB.label === 'gameover_detector') ||
            (bodyA.label === 'gameover_detector' && bodyB.label === 'Circle')) {
            gameOver(); // 게임 오버 함수 실행
        }
    });
});

// gameOver 함수 정의
function gameOver() {
    clearInterval(moveInterval);
    //clearInterval(candyInterval);
    clearInterval(ghostInterval);
    gameState = 0;
    showResultScreen();
}

// 결과창 표시 함수
function showResultScreen() {
    // 결과창 보여주기
    const resultScreen = document.getElementById('result-screen');
    const scoreElement = document.getElementById('score');
    
    scoreElement.textContent = `Score: ${score}`;
    resultScreen.style.display = 'flex'; // 결과창을 보이도록 설정
}

// 점수 공유 버튼 클릭 시 실행되는 함수
function shareScore() {
    const shareText = `I scored ${score} points in this game!`;
    alert(shareText); // 실제로는 공유 링크나 소셜 미디어 공유 기능을 추가할 수 있음
}
ghostAppear();
ghostInterval = setInterval(()=>ghostAppear(),15000);
