// 교수님 꼭 클릭 한번씩해주시고
// 다크모드도 꼭 봐주셨으면 합니다!! ㅎㅎ
// 노래에 맞게 반응하는 요소들이 있습니다. [배경의 깜빡거림, 파동의 흔들거림, 정말 작은점요소의 흔들거림]

// 음파 파동(wave) 효과들을 담을 배열
let waves = [];

// 배경에 떠다니는 입자들을 위한 배열
let particles = [];

// 마우스를 누를 때 표시되는 단어 리스트
let textPhrases = ["本質", "余白", "静けさ", "素材", "空気", "無名"];

// 떠다니는 텍스트를 담을 변수
let fadeText = null;

// 다크모드 여부를 저장하는 변수
let isDarkMode = false;

// 다크모드 변경 버튼
let toggleBtn;

// 사운드 관련 변수
let sound;       // 배경 음악
let amp;         // p5.Amplitude 객체 (음량 측정용)
let level = 0;   // 현재 음량 레벨
let isSoundPlaying = false; // 사운드 재생 상태 추적 변수 (추가됨)

// 사운드 파일을 미리 로딩
function preload() {
  soundFormats('mp3', 'wav');    // 사용할 사운드 형식
  // GitHub Pages에 올릴 때 파일 경로를 정확히 확인하세요.
  // muji.mp3 파일이 index.html과 같은 레벨에 있다면 'muji.mp3'
  // assets 폴더 안에 있다면 'assets/muji.mp3' 로 변경해야 합니다.
  sound = loadSound('muji.mp3'); // mp3 파일 불러오기
}

function setup() {
  createCanvas(windowWidth, windowHeight);   // 전체 화면 캔버스 생성
  noFill();                                  // 도형 내부 채우지 않기
  textFont("Georgia");                       // 폰트 설정
  textAlign(CENTER, CENTER);                 // 텍스트 정중앙 정렬

  amp = new p5.Amplitude(); // 사운드 레벨 측정용
  sound.setVolume(0.7);     // 볼륨 조절

  // 입자 100개 생성
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }

  // 🌙 모드 토글 버튼 생성
  toggleBtn = createButton("🌙 모드 변경");
  toggleBtn.position(windowWidth - 140, windowHeight - 40);
  toggleBtn.style("background", "transparent");
  toggleBtn.style("border", "none");
  toggleBtn.style("color", "#5c3b30");
  toggleBtn.style("font-size", "14px");
  toggleBtn.style("font-family", "Georgia");
  toggleBtn.style("cursor", "pointer");

  // 마우스 올렸을 때와 뗐을 때 색 변경
  toggleBtn.mouseOver(() => toggleBtn.style("color", "#8a5e45"));
  toggleBtn.mouseOut(() => toggleBtn.style("color", "#5c3b30"));

  // 버튼 클릭 시 다크모드 on/off
  toggleBtn.mousePressed(() => {
    isDarkMode = !isDarkMode;
    toggleBtn.html(isDarkMode ? "🌞 모드 변경" : "🌙 모드 변경");
    updateButtonColor(); // 버튼 색상 업데이트 함수 호출
  });

  // 초기 버튼 색상 설정
  updateButtonColor();
}

// 버튼 색상 다크모드에 맞게 변경
function updateButtonColor() {
  toggleBtn.style("color", isDarkMode ? "#dddddd" : "#5c3b30");
  toggleBtn.mouseOver(() => toggleBtn.style("color", isDarkMode ? "#ffffff" : "#8a5e45"));
  toggleBtn.mouseOut(() => toggleBtn.style("color", isDarkMode ? "#dddddd" : "#5c3b30"));
}

function draw() {
  level = amp.getLevel(); // 현재 사운드 볼륨 측정

  // 배경 밝기 조정 (음량에 따라 밝기 변화)
  let baseBrightness = isDarkMode ? 20 : 245;
  // 음량에 따라 배경 밝기를 조절. 다크 모드일 땐 어두운 배경에서 더 어두워지게,
  // 라이트 모드일 땐 밝은 배경에서 어두워지게 합니다.
  let bgAdjust = map(level, 0, 0.3, 0, 40); 
  let bgColor = isDarkMode ? color(max(0, baseBrightness - bgAdjust)) : color(max(0, baseBrightness - bgAdjust));

  // 다크모드에 따라 색상 설정
  let waveColor = isDarkMode ? color(220) : color(157, 19, 38);
  let textColor = isDarkMode ? color(220) : color(72, 50, 40);

  background(bgColor); // 배경 그리기

  // 입자 애니메이션 업데이트 및 그리기
  for (let p of particles) {
    p.update(level); // 사운드 레벨 반영
    p.display(isDarkMode);
  }

  // 상단 텍스트 (영감 텍스트)
  fill(waveColor);
  noStroke();
  textSize(16);
  text("Designed for Quiet Living", width / 2, 60);

  // 중앙 타이틀 텍스트
  textStyle(BOLD);
  textSize(24);
  text("無印良品", width / 2, height / 2);

  textStyle(NORMAL);
  textSize(14);
  text("덜어냄으로써 완성된다", width / 2, height / 2 + 40);

  textSize(48);
  text("MUJI", width / 2, height / 2 - 40);

  // 교수님께 보여드릴 초기 화면에 사운드 시작 메시지 추가
  if (!isSoundPlaying) {
    fill(isDarkMode ? 220 : 72, 50, 40); // 텍스트 색상은 다크모드에 맞게
    noStroke();
    textSize(20);
    text("Click anywhere to start", width / 2, height / 2 + 80); // 중앙 타이틀 아래에 배치
    text("and enable sound", width / 2, height / 2 + 110);
  } else {
    // 사운드 재생 중일 때, 마우스 클릭 시 주기적으로 wave와 텍스트 생성
    if (mouseIsPressed && frameCount % 15 === 0) {
      waves.push(new Wave(mouseX, mouseY));
      let word = random(textPhrases);
      fadeText = new FloatingText(word, mouseX, mouseY - 20);
    }
  }

  // 파동(wave) 배열 업데이트 및 그리기
  for (let i = waves.length - 1; i >= 0; i--) {
    waves[i].update(level);
    waves[i].display(waveColor);
    if (waves[i].isFinished()) waves.splice(i, 1); // 완료된 파동 제거
  }

  // 떠다니는 텍스트 표시
  if (fadeText) {
    fadeText.update();
    fadeText.display(waveColor);
    if (fadeText.alpha <= 0) fadeText = null;
  }
}

// 마우스 클릭 시 사운드 시작 및 파동과 텍스트 생성
function mousePressed() {
  // 사운드가 아직 재생되지 않았다면, 첫 클릭 시 사운드를 시작합니다.
  if (!isSoundPlaying) {
    userStartAudio(); // 오디오 컨텍스트를 시작/재개합니다.
    sound.loop();      // 사운드 반복 재생 시작
    isSoundPlaying = true; // 사운드 재생 상태 업데이트
  }

  // 사운드 재생 여부와 관계없이 마우스 클릭 시 파동과 텍스트 생성
  waves.push(new Wave(mouseX, mouseY));
  let word = random(textPhrases);
  fadeText = new FloatingText(word, mouseX, mouseY - 20);
}


// ────── Wave 클래스 ──────
// 여러 겹의 Ripple을 만들어 하나의 Wave로 표현
class Wave {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.ripples = [];
    for (let i = 0; i < 4; i++) {
      this.ripples.push(new Ripple(x, y, i * 8)); // 시간차를 둔 ripple
    }
  }

  update(vol) {
    for (let r of this.ripples) r.update(vol);
  }

  display(col) {
    for (let r of this.ripples) r.display(col);
  }

  isFinished() {
    return this.ripples.every(r => r.alpha <= 0);
  }
}

// ────── Ripple 클래스 ──────
// 실제 원형 파동 하나를 나타냄
class Ripple {
  constructor(x, y, delay) {
    this.x = x;
    this.y = y;
    this.radius = 0;
    this.maxRadius = random(60, 160); // 파동 최대 크기
    this.alpha = 255;
    this.strokeW = map(this.maxRadius, 60, 160, 0.6, 1.6);
    this.noiseSeed = random(1000);
    this.delay = delay;
  }

  update(vol) {
    if (this.delay > 0) {
      this.delay--;
      return;
    }

    // 사운드에 따라 반응하도록 boost를 반영
    let boost = map(vol, 0, 0.3, 0, 70);
    this.radius = lerp(this.radius, this.maxRadius + boost, 0.05);
    this.alpha = map(this.radius, 0, this.maxRadius + boost, 255, 0);
  }

  display(col) {
    if (this.delay > 0) return;

    stroke(col.levels[0], col.levels[1], col.levels[2], this.alpha);
    strokeWeight(this.strokeW);
    noFill();

    // 노이즈를 활용한 유기적 파형 만들기
    beginShape();
    for (let angle = 0; angle < TWO_PI; angle += 0.08) {
      let offset = noise(this.noiseSeed + cos(angle), this.noiseSeed + sin(angle));
      let r = this.radius + offset * 6;
      let x = this.x + cos(angle) * r;
      let y = this.y + sin(angle) * r;
      vertex(x, y);
    }
    endShape(CLOSE);
  }
}

// ────── FloatingText 클래스 ──────
// 사라지는 텍스트 효과
class FloatingText {
  constructor(word, x, y) {
    this.word = word;
    this.x = x;
    this.y = y;
    this.alpha = 255;
    this.offset = random(-1, 1);
  }

  update() {
    this.alpha -= 1;
  }

  display(col) {
    fill(col.levels[0], col.levels[1], col.levels[2], this.alpha);
    textSize(22);
    text(this.word, this.x + sin(frameCount * 0.02 + this.offset) * 1.5, this.y);
  }
}

// ────── Particle 클래스 ──────
// 배경에 흐르는 입자 애니메이션
class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = random(width);
    this.y = random(height);
    this.r = random(0.6, 1.4); // 입자 크기
    this.alpha = random(40, 90);
    this.offset = random(TWO_PI);
    this.baseDrift = random(-0.2, 0.2);     // 좌우 흔들림
    this.baseSpeedY = random(-0.05, 0.05); // 위아래 이동 속도
  }

  update(vol) {
    // 음량에 따라 흔들림 강도 증가
    let jitter = map(vol, 0, 0.3, 0, 1.2);
    this.y += this.baseSpeedY + random(-jitter, jitter);
    this.x += sin(frameCount * 0.01 + this.offset) * (this.baseDrift + random(-jitter, jitter));

    // 화면 밖으로 나가면 다시 초기화
    if (this.y < -10 || this.y > height + 10) {
      this.reset();
      this.y = this.baseSpeedY > 0 ? -5 : height + 5;
    }
  }

  display(darkMode) {
    noStroke();
    fill(darkMode ? 240 : 30, this.alpha);
    ellipse(this.x, this.y, this.r * 2);
  }
}