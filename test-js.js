// 📕보통 matter.js에서 패스를 지정할 때 쓴다.
const reactangle =
"m.26,274.72c-1.79-20.16,5.77-40.86,22.2-55.17L256.07,16.09c27.25-23.73,68.58-20.88,92.31,6.37,23.73,27.25,20.88,68.58-6.37,92.31l-233.61,203.46c-27.25,23.73-68.58,20.88-92.31-6.37-9.42-10.82-14.66-23.86-15.83-37.14Z";
const curved =
"m341.46,31.89c14.51,28.65,3.05,63.65-25.6,78.16-3.42,1.73-34.78,17.16-83.49,26.15-28.57,5.27-57.68,7.34-86.51,6.14-36.13-1.5-71.89-8.14-106.28-19.74C9.15,112.33-7.2,79.34,3.07,48.9,13.33,18.47,46.33,2.12,76.77,12.39c101.89,34.37,185.72-5.68,186.54-6.1,28.65-14.51,63.65-3.05,78.16,25.6Z";

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
// --- 초기 세팅 ---

// 📕Engine.create() 함수를 사용하여 Matter.js 엔진을 생성한다.
const engine = Engine.create();
// 📕렌더링할 컨테이너 역할 부분의 id를 가져온다.(getElementById)
const container = document.getElementById("container");

// 📕Matter.Render.create() 함수를 사용하여 시각적인 렌더링을 담당하는 객체를 생성한다.
const renderer = Matter.Render.create({
element: container, // 렌더러가 그릴 HTML요소를 지정해준다.
engine: engine, // 렌더러에 사용될 Matter.js 엔진을 지정해준다.
options: {
  // 커스텀 옵션들을 설정해준다.
  width: container.offsetWidth,
  height: container.offsetHeight,
  wireframes: false, //wireframe 여부
  background: "#eee7e0",
},
});

// 📕경계 벽 생성하는 부분 (순서대로 왼쪽, 오른쪽, 아래이다. isStatic은 바디를 정적으로 만들어 물리 시뮬레이션에 영향을 주지 않도록 한다.)
// 🧐 여기선 왜 위쪽 벽을 설정하지 않았을까? -> 떨어지는 효과를 나타내야하기 때문이다.
const walls = [
Bodies.rectangle(0, 0, 1, container.offsetHeight * 2, {
  isStatic: true,
}),
Bodies.rectangle(
  container.offsetWidth,
  0,
  1,
  container.offsetHeight * 2,
  { isStatic: true }
),
Bodies.rectangle(
  0,
  container.offsetHeight,
  container.offsetWidth * 2,
  1,
  { isStatic: true }
),
];

// 기존 코드를 살펴보면 벗어나는 부분을 계산해서 적용시켰다.
// const walls = [
//   Bodies.rectangle(0 - 50, 0 - 50, 1, container.offsetHeight * 2 - 50, {
//     isStatic: true,
//   }),
//   Bodies.rectangle(
//     container.offsetWidth + 50,
//     0 - 50,
//     1,
//     container.offsetHeight * 2 + 50,
//     { isStatic: true }
//   ),
//   Bodies.rectangle(
//     0 - 50,
//     container.offsetHeight + 50,
//     container.offsetWidth * 2 + 50,
//     1,
//     { isStatic: true }
//   ),
// ];

// 📕물리적 특성을 설정하는 객체인 physics를 정의한다.
const physics = {
restitution: 0.7, // 복원력 또는 탄성력 (0~1 사이에 지정해줌. 1에 가까워질 수록 충돌 후 빠르게 원래 형태로 돌아간다.)
friction: 0.4, // 마찰 계수 (0~1 사이에 지정해줌. 1에 가까워질 수록 강한 마찰이 발생한다.)
};

// 도넛모양 생성하는 부분인 듯!
const createCircle = (width, color, x, y) => {
  const Circle = Bodies.circle(x,y, width,{
  ...physics,
  render: {
    sprite: {
      texture: '../image/candy.png',
      xScale: 1.5,
      yScale: 1.5
    }
  }
});
return Circle
}


// 소세지모양 생성하는 부분인듯!
const createSvgElement = (path, color, scale, x, y, angle) => {
pathElement = document.createElementNS(
  "http://www.w3.org/2000/svg",
  "path"
);
pathElement.setAttribute("d", path);
const vertices = Svg.pathToVertices(pathElement, 3);
vertices.forEach((vertical) => {
  const i = vertices.findIndex(
    (v) => v.x === vertical.x && v.y === vertical.y
  );

  if (i !== -1) {
    vertices.splice(i, 1);
  }
});
const body = Bodies.fromVertices(
  x,
  y,
  vertices,
  {
    ...physics,
    render: {
      fillStyle: color,
      strokeStyle: color,
      lineWidth: "1px",
    },
  },
  true
);

Body.scale(body, 1, 1);
Body.setAngle(body, angle);

return body;
};

// 모양 생성하는 함수를 바탕으로 요소들을 생성해주는 부분인듯

const elements = [
createSvgElement(curved, "#583d91", 1, 250, -400, 30),
createSvgElement(reactangle, "#eb5c48", 1, 450, -400, 50),
createCircle(115, "#9a3d90", 500, -400),
createSvgElement(curved, "#583d91", 1, 700, -400, 50),
createCircle(135, "#eb5c48", 1150, -200),
createSvgElement(curved, "#583d91", 1, 1460, -400, 200),

createSvgElement(curved, "#583d91", 1, 1300, -700, 300),
createSvgElement(reactangle, "#fab71a", 1, 1600, -700, 100),

createCircle(115, "#fab71a", 100, -900),
createSvgElement(curved, "#eb5c48", 1, 250, -900, 250),
createCircle(135, "#fab71a", 600, -900),
createSvgElement(curved, "#eb5c48", 1, 1500, -900, 100),
];

// 📕MouseConstraint은 마우스 입력을 기반으로 물리 시뮬레이션에 영향을 주는 제약(Constraint)을 제공한다.
const mouseConstraint = Matter.MouseConstraint.create(engine, {
element: container,
constraint: {
  stiffness: 0.2, // 제어의 강도 또는 강성(stiffness)을 나타내는 값 (낮을수록 유연)
  render: {
    visible: false, // 제어 요소(마우스)의 가시성 여부
  },
},
});

// 📕World.add()로 물리 엔진 세계에 다양한 물체들을 추가(배열 안에 설정해놓은 변수들을 펼침연산자로 추가한다.)
World.add(engine.world, [...walls, mouseConstraint, ...elements]);
// 📕Engine.run()로 Matter.js 엔진을 실행
Engine.run(engine);

// 📕Render.run()호출하여 렌더러 실행
Matter.Render.run(renderer);