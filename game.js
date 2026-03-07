document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("table");
  const p1 = document.getElementById("paddle1");
  const p2 = document.getElementById("paddle2");

  const p1ScoreText = document.getElementById("p1Score");
  const p2ScoreText = document.getElementById("p2Score");

  const restartBtn = document.getElementById("restartBtn");
  const singleBtn = document.getElementById("singleBtn");
  const twoBtn = document.getElementById("twoBtn");

  const paddleHeight = 90;
  const WIN_SCORE = 10;

  let p1Y = 180;
  let p2Y = 180;

  let p1Score = 0;
  let p2Score = 0;

  let twoPlayer = false;
  let paused = false;

  let baseSpeed = 5;

  const keys = {};

  const hitSound = new Audio("sounds/hit.wav");
  const wallSound = new Audio("sounds/wall.wav");
  const scoreSound = new Audio("sounds/score.wav");

  let balls = [];

  function createBall(x = 440, y = 210, dx = baseSpeed, dy = baseSpeed) {
    const ballEl = document.createElement("div");
    ballEl.classList.add("ball");

    table.appendChild(ballEl);

    balls.push({
      x,
      y,
      dx,
      dy,
      spin: 0,
      el: ballEl,
    });
  }

  createBall();

  document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === "p") paused = !paused;
  });

  document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
  });

  function resetBall() {
    balls.forEach((b) => b.el.remove());
    balls = [];

    createBall();
  }

  function movePaddles() {
    if (keys["w"] && p1Y > 0) p1Y -= 6;
    if (keys["s"] && p1Y < table.offsetHeight - paddleHeight) p1Y += 6;

    if (twoPlayer) {
      if (keys["ArrowUp"] && p2Y > 0) p2Y -= 6;
      if (keys["ArrowDown"] && p2Y < table.offsetHeight - paddleHeight)
        p2Y += 6;
    } else {
      if (p2Y + paddleHeight / 2 < balls[0].y) p2Y += 4;
      else p2Y -= 4;
    }

    p1.style.top = p1Y + "px";
    p2.style.top = p2Y + "px";
  }

  function glow(paddle) {
    paddle.classList.add("hitGlow");

    setTimeout(() => {
      paddle.classList.remove("hitGlow");
    }, 200);
  }

  function createParticles(x, y) {
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("div");
      p.className = "particle";

      p.style.left = x + "px";
      p.style.top = y + "px";

      table.appendChild(p);

      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4;

      let vx = Math.cos(angle) * speed;
      let vy = Math.sin(angle) * speed;

      let life = 30;

      function animate() {
        if (life <= 0) {
          p.remove();
          return;
        }

        life--;

        let px = parseFloat(p.style.left);
        let py = parseFloat(p.style.top);

        p.style.left = px + vx + "px";
        p.style.top = py + vy + "px";

        requestAnimationFrame(animate);
      }

      animate();
    }
  }

  function createTrail(x, y) {
    const trail = document.createElement("div");

    trail.classList.add("trail");

    trail.style.left = x + "px";
    trail.style.top = y + "px";

    table.appendChild(trail);

    setTimeout(() => trail.remove(), 300);
  }

  function collision(ball) {
    if (ball.y <= 0 || ball.y >= table.offsetHeight - 20) {
      ball.dy *= -1;

      wallSound.currentTime = 0;
      wallSound.play();
    }

    if (ball.x <= 25 && ball.y + 20 >= p1Y && ball.y <= p1Y + paddleHeight) {
      ball.dx *= -1;

      let hitPoint = (ball.y - (p1Y + paddleHeight / 2)) / 30;

      ball.dy += hitPoint;

      hitSound.currentTime = 0;
      hitSound.play();

      glow(p1);
      createParticles(ball.x, ball.y);
    }

    if (
      ball.x >= table.offsetWidth - 35 &&
      ball.y + 20 >= p2Y &&
      ball.y <= p2Y + paddleHeight
    ) {
      ball.dx *= -1;

      hitSound.currentTime = 0;
      hitSound.play();

      glow(p2);
      createParticles(ball.x, ball.y);
    }
  }

  function score(ball) {
    if (ball.x < 0) {
      p2Score++;
      p2ScoreText.textContent = p2Score;

      scoreSound.play();

      checkGameOver();

      resetBall();
    }

    if (ball.x > table.offsetWidth) {
      p1Score++;
      p1ScoreText.textContent = p1Score;

      scoreSound.play();

      checkGameOver();

      resetBall();
    }
  }

  function checkGameOver() {
    if (p1Score >= WIN_SCORE) {
      alert("Player 1 Wins!");
      restartGame();
    }

    if (p2Score >= WIN_SCORE) {
      alert("Player 2 Wins!");
      restartGame();
    }
  }

  function restartGame() {
    p1Score = 0;
    p2Score = 0;

    p1ScoreText.textContent = 0;
    p2ScoreText.textContent = 0;

    resetBall();
  }

  function update() {
    if (paused) {
      requestAnimationFrame(update);
      return;
    }

    balls.forEach((ball) => {
      ball.x += ball.dx;
      ball.y += ball.dy;

      ball.el.style.left = ball.x + "px";
      ball.el.style.top = ball.y + "px";

      collision(ball);
      score(ball);

      createTrail(ball.x, ball.y);
    });

    movePaddles();

    requestAnimationFrame(update);
  }

  restartBtn.onclick = restartGame;

  singleBtn.onclick = () => (twoPlayer = false);
  twoBtn.onclick = () => (twoPlayer = true);

  document.getElementById("doubleBall").onclick = () => {
    let newBall = {
      x: 440,
      y: 210,
      dx: -baseSpeed,
      dy: baseSpeed,
      spin: 0,
    };

    createBall(newBall.x, newBall.y, newBall.dx, newBall.dy);
  };

  document.getElementById("slowMotion").onclick = () => {
    balls.forEach((b) => {
      b.dx *= 0.5;
      b.dy *= 0.5;
    });

    setTimeout(() => {
      balls.forEach((b) => {
        b.dx *= 2;
        b.dy *= 2;
      });
    }, 3000);
  };

  document.getElementById("speedControl").addEventListener("input", (e) => {
    baseSpeed = Number(e.target.value);

    balls.forEach((b) => {
      b.dx = Math.sign(b.dx) * baseSpeed;
      b.dy = Math.sign(b.dy) * baseSpeed;
    });
  });

  update();
});
