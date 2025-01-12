$(document).ready(function () {
    const soundEffects = {
        click: new Audio('https://crownchase.s3.us-east-1.amazonaws.com/public/sounds/click.mp3'), 
        scoreup: new Audio('https://crownchase.s3.us-east-1.amazonaws.com/public/sounds/scoreup.mp3'), 
        scoredown: new Audio('https://crownchase.s3.us-east-1.amazonaws.com/public/sounds/scoredown.mp3'), 
        winner: new Audio('https://crownchase.s3.us-east-1.amazonaws.com/public/sounds/winnerreveal.mp3')  
    };
    function playSound(soundKey) {
        if (soundEffects[soundKey]) {
            soundEffects[soundKey].play().catch((err) => {
                console.error('Error playing sound:', err);
            });
        } else {
            console.warn('Sound not found:', soundKey);
        }
    }
    $(document).on("click", function() {
        playSound('click');
    });
    if (isSafariOnIphone()) {
    document.body.style.height = '90vh'; // Example of a specified height
    $(".layer").css('height', "90vh");
    $(".playing-area-container").css('height', "90vh");
    $(".thief-soldier-img").css("height", "9vh");
    // $("#parchment").css("height", "84vh");
    const safariStyles = `
    @keyframes moveUpperLayerSecond {
      0% {
        top: -50vh;
      }
      100% {
        top: -82vh;
      }
    }
    @keyframes moveLowerLayerSecond {
      0% {
        top: 50vh;
      }
      100% {
        top: 82vh;
      }
    }
    `;
    $("<style>").text(safariStyles).appendTo("head");
}
  let currselected = 1;
  let currentSessions = 20;
  let gamePin = "";
  let currCard = 7;
  let players = ["Sahib", "Dev", "Arnav", "Suvir"];
  let playersScore = [124000, 110000, 120000, 180000];
  let playersPfp = ["9.svg", "10.svg", "11.svg", "12.svg"];
  let currSession = 1;
  let thirdPersonIndex = 2;
  let fourthPersonIndex = 3;
  let kingIndex = 0;
  let ministerIndex = 1;
  let gameStarted = false;
  let currRuleImage = 33;
  const minRuleImage = 33;
  const maxRuleImage = 42;

  $(".blur-layer").css({
    "backdrop-filter": "blur(4px)",
    "-webkit-backdrop-filter": "blur(4px)",
  });
  $("#upperparchment-layer").hide();
  $("#lowerparchment-layer").hide();
  $("#parchment-layer").hide();
  $("#loader-layer").css("display", "none");
  $("#layer2").fadeIn(2000);

  function getHTMLContent(type) {
    if (type == 0) {
      return `<div class="parchment-row-align-right"><img src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/cross.png" class="parchment-cross"/></div><div class="parchment-row-center"><input type="text" class="game-pin-text" placeholder="GAME PIN" id="game-entered-pin" /><p class="game-pin-error" id="error-entered-pin">Error: PIN not found</p><button class="game-pin-btn" id="enter-game-pin">ENTER</button><p class="parchment-or-text">OR</p><button class="game-pin-btn" id="create-pin-btn">CREATE PIN</button></div>`;
    }
    if (type == 1) {
      return (
        `
        <div class="parchment-row-align-right">
          <img
            src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/cross.png"
            class="parchment-cross"
          />
        </div>
        <div class="parchment-row-center">
          <div class="parchment-flex-row">
            <img
              src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/left-select.png"
              class="parchment-profile-pic-select pfp-select-left"
            />
            <img
              src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/10.svg"
              class="parchment-profile-pic"
              id="parchment-pfp"
            />
            <img
              src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/right-select.png"
              class="parchment-profile-pic-select pfp-select-right"
            />
          </div>
          <input type="text" class="game-pin-text" placeholder="Your Name?" id="playerName" />
          <p class="game-pin-error" id="playerNameError">Error: PIN not found</p>
          ` +
        (gamePin == ""
          ? `
          <div class="court-sessions-container">
            <button class="game-pin-btn-court-session-controls decrement">
              -
            </button>
            <span class="court-sessions-display">Court Sessions = 20</span>
            <button class="game-pin-btn-court-session-controls increment">
              +
            </button>
          </div>`
          : "") +
        `
          <button class="game-pin-btn" id="game-pin-next-btn">Next</button>
        `
      );
    }
    if (type == 2) {
      return (
        `<h5 class="parchment-wait-game-pin-head">GAME PIN</h5>
        <h1 class="parchment-wait-game-pin" id="generated-game-pin">` +
        gamePin +
        `</h1>
        <div class="parchment-wait">
          <p id="wait-text">Waiting for players to join</p>
          <img src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/load.gif" />
        </div>
        <div id="parchment-wait-characters">
        </div>
        <div class="parchment-wait-start-btn" style="display:none;">Start Game</div>`
      );
    }
    if (type == 3) {

      let playersData = playersScore.map((score, index) => ({
        score,
        name: players[index],
        pfp: playersPfp[index]
      }));

      playersData.sort((a, b) => b.score - a.score);

      let url = "https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/";

      return `
      <h2 class="results-heading">Court Sessions Concluded</h2>
      <div class="results-section">
        <div class="results-individual-section">
      <img src="${url}${playersData[1].pfp}" id="results-second-pfp" class="results-pfp"/>
      <div class="results-name" id="results-second-name">${playersData[1].name}</div>
      <div class="results-aura" id="results-second-aura">Score: ${playersData[1].score}</div>
    </div>
    <div class="results-individual-section">
      <img src="${url}${playersData[0].pfp}" id="results-first-pfp" class="winner-pfp"/>
      <img src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/winner-tag.png" class="results-winner-tag"/>
      <div class="results-name" id="results-first-name">${playersData[0].name}</div>
      <div class="results-aura" id="results-first-aura">Score: ${playersData[0].score}</div>
    </div>
    <div class="results-individual-section">
      <img src="${url}${playersData[2].pfp}" id="results-third-pfp" class="results-pfp"/>
      <div class="results-name" id="results-third-name">${playersData[2].name}</div>
      <div class="results-aura" id="results-third-aura">Score: ${playersData[2].score}</div>
    </div>
      </div>
      <button class="game-pin-btn restart-btn" style="margin: 3vh 24.5%;">Return to Home</button>
      `;
    }
    if(type == 4){

      return `
      <h2 class="results-heading">Invalid Game</h2>
      <div class="parchment-wait">
          <p id="wait-text">Whoops!! players disconnected</p>
      </div>
      <div id="parchment-wait-characters"></div>
      <button class="game-pin-btn restart-btn" style="margin: 3vh 24.5%;">Return to Home</button>
      `;
    }
    if(type == 5){
      return `<div class="parchment-row-align-right"><img src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/cross.png" class="parchment-cross"/></div>
      <h2 class="results-heading" style="margin-top: -5vh">Game Rules</h2>
      <img src='https://crownchase.s3.us-east-1.amazonaws.com/public/img/rules/33.png' id='rules-img'><br><div class="rules-btn-div"><button class="rules-btn" style="display:none;" id="rule-previous">Previous</button><button class="rules-btn"  id="rule-next">Next</button></div>`;
    }
    return ``;
  }

  function dropParchment(type) {
    var htmlString = getHTMLContent(type);
    $("#parchment").empty();
    $("#parchment").append(htmlString);
    $("#upperparchment-layer").show();
    $("#lowerparchment-layer").show();
    $("#upperparchment-layer").css({
      animation: "moveUpperLayer 1s forwards",
    });
    $("#lowerparchment-layer").css({
      animation: "moveLowerLayer 1s forwards",
    });

    $("#upperparchment-layer").one("animationend", function () {
      $("#upperparchment-layer").css({
        animation: "moveUpperLayerSecond 1s forwards",
      });
      $("#layer2").fadeOut(500);
      $("#parchment-layer").show();
      $("#parchment").css({
        animation: "moveParchment 1s forwards",
      });
    });
    $("#lowerparchment-layer").one("animationend", function () {
      $("#lowerparchment-layer").css({
        animation: "moveLowerLayerSecond 1s forwards",
      });
    });
  }
  function hideParchment() {
    $("#upperparchment-layer").css({
      animation: "reverseUpperLayerSecond 1s forwards",
    });
    $("#parchment").css({
      animation: "reverseParchment 1s forwards",
    });
    $("#lowerparchment-layer").css({
      animation: "reverseLowerLayerSecond 1s forwards",
    });
    $("#upperparchment-layer").one("animationend", function () {
      $("#layer2").fadeIn(500);
      $("#upperparchment-layer").css({
        animation: "reverseUpperLayer 1s forwards",
      });
      $("#lowerparchment-layer").css({
        animation: "reverseLowerLayer 1s forwards",
      });
      $("#upperparchment-layer").one("animationend", function () {
        $("#upperparchment-layer").hide();
        $("#lowerparchment-layer").hide();
        $("#parchment-layer").hide();
      });
    });
  }
  $("#play-with-friends").click(function () {
    $("#layer2").hide();
    dropParchment(0);
  });
  $("#play-against-ai").click(function () {
    dropParchment(1);
  });
  $("#how-to-play").click(function () {
    dropParchment(5);
    currRuleImage = 33;
    updateImage();
    updateButtons();
  });
  $(document).on("click", ".parchment-cross", function () {
    hideParchment();
    $("#layer2").show();
  });
  $(document).on("click", "#create-pin-btn", function () {
    hideParchment();
    setTimeout(function () {
      $("#layer2").hide();
      gamePin = "";
      dropParchment(1);
    }, 2200);

  });
  $(document).on("click", "#enter-game-pin", function () {
    let enteredPin = $("#game-entered-pin").val();
    if (enteredPin == "") {
      $("#error-entered-pin").text("Please enter a PIN");
      $("#error-entered-pin").fadeIn(500);
    } else {
      $("#parchment-loader-layer").css("display", "grid");
      $.ajax({
        url: "https://0y9kk910ol.execute-api.us-east-1.amazonaws.com/dev/validate-game-pin",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({ game_pin: enteredPin }),
        success: function (response) {
          $("#parchment-loader-layer").css("display", "none");
          if (response.message) {
            hideParchment();
            setTimeout(function () {
              gamePin = enteredPin;
              console.log("Game Pin set to:", gamePin);
              dropParchment(1);
            }, 2200);
          } else {
            if (response.error) {
              $("#error-entered-pin").text(response.error);
            } else {
              $("#error-entered-pin").text("Invalid PIN");
            }
            $("#error-entered-pin").fadeIn(500);
          }
        },
        error: function (xhr, status, error) {
          $("#parchment-loader-layer").css("display", "none");
          const errorMessage =
            xhr.responseJSON && xhr.responseJSON.error
              ? xhr.responseJSON.error
              : "An error occurred";
          $("#error-entered-pin").text("Internal Server Error");
          console.log("Error checking PIN: " + errorMessage);
        },
      });
    }
  });
  $(document).on("click", "#game-pin-next-btn", function () {
    const playerName = $("#playerName").val();
    const courtSessions = currentSessions;
    const profilePic = pfps[currselected];

    if (playerName == "") {
      $("#playerNameError").text("Please enter your name");
      $("#playerNameError").css("display", "block");
    } else {
      if (gamePin != "") {
        hideParchment();
        setTimeout(function () {
          dropParchment(2);
          joinGame(gamePin, token, profilePic, playerName);
      }, 2200);
      } else {
        $("#playerNameError").css("display", "none");
        $("#parchment-loader-layer").css("display", "grid");
        // Make AJAX POST request to the /create-game endpoint
        $.ajax({
          url: "https://0y9kk910ol.execute-api.us-east-1.amazonaws.com/dev/create-game", // Flask endpoint
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify({
            token: token,
            name: playerName,
            courtsessions: courtSessions,
            profilepic: profilePic,
          }),
          success: function (response) {
            $("#parchment-loader-layer").css("display", "none");
            if (response.game_pin) {
              hideParchment();
              setTimeout(function () {
                gamePin = response.game_pin;
                dropParchment(2);
                joinGame(gamePin, token, profilePic, playerName);
              }, 2200);
            } else {
              $("#playerNameError").text("Internal Server Error");
            }
          },
          error: function (xhr, status, error) {
            $("#parchment-loader-layer").css("display", "none");
            const errorMessage =
              xhr.responseJSON && xhr.responseJSON.error
                ? xhr.responseJSON.error
                : "An error occurred";
            $("#playerNameError").text("Internal Server Error");
            console.log("Error creating game: " + errorMessage);
          },
        });
      }
    }
  });

  const pfps = [
    "9.svg",
    "10.svg",
    "11.svg",
    "12.svg",
    "13.svg",
    "14.svg",
    "15.svg",
  ];
  const preloadedImages = [];
  pfps.forEach((pfp) => {
    const img = new Image();
    img.src = "https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/" + pfp;
    preloadedImages.push(img);
  });
  function changePfp(next) {
    if (next) {
      currselected = (currselected + 1) % pfps.length;
    } else {
      currselected = (currselected - 1 + pfps.length) % pfps.length;
    }
    $("#parchment-pfp").attr("src", preloadedImages[currselected].src);
  }
  $(document).on("click", ".pfp-select-left", function () {
    changePfp(false);
  });
  $(document).on("click", ".pfp-select-right", function () {
    changePfp(true);
  });

  let minSessions = 20;
  let maxSessions = 100;

  function updateDisplay() {
    $(".court-sessions-display").text(`Court Sessions = ${currentSessions}`);
  }

  $(document).on("click", ".increment", function () {
    if (currentSessions < maxSessions) {
      currentSessions++;
      updateDisplay();
    }
  });
  $(document).on("click", ".decrement", function () {
    if (currentSessions > minSessions) {
      currentSessions--;
      updateDisplay();
    }
  });
  function getCurrentSessions() {
    return currentSessions;
  }
  function hideMainScreen() {
    $("#layer2").fadeOut(500);
    $("#cards-animation-layer").fadeIn(500);
  }
  var cardFlipped = false;
  var cardFlippedsecond = false;
  var isCardPutBack = false;
  var isCardPutBacksecond = false;
  
  function initiallyRollCards() {
    cardFlipped = false;
    cardFlippedsecond = false;
    isCardPutBack = false;
    isCardPutBacksecond = false;
    hideMainScreen();
  
    $("#playing-area-layer").fadeOut(500);
    $(".cards-roll-area-img1, .cards-roll-area-img2").css({
    animation: "none",
  });
  $(".cards-roll-area").css({
    animation: "none",
  });
  $("#scaling-card, #scaling-card-reveal").css({
    animation: "none",
  });
    $(".cards-roll-area-img1").css("left", "100vw");
    $(".cards-roll-area-img2").css("left", "-10vw");
    $("#cards-animation-layer").css("top", "-50vh");

    $(".cards-roll-area-img2").css({
      animation: "leftcardrollentry 2s forwards",
    });
    $(".cards-roll-area-img1").css({
      animation: "rightcardrollentry 2s forwards",
    });
    $(".cards-roll-area-img1").one("animationend", function () {
      $(".cards-roll-area").css({
        animation: "rotatecardsinitial 1s forwards",
      });
      $(".cards-roll-area").one("animationend", function () {
        $(".cards-roll-area-img4").css("display", "block");
        $(".cards-roll-area").css({
          animation: "rotatecardscontinue 3s forwards",
        });
        setTimeout(function () {
          $(".cards-roll-area-img2").css({
            animation: "leftcardrollexit 2s forwards",
          });
          $(".cards-roll-area-img1").css({
            animation: "rightcardrollexit 2s forwards",
          });
          $("#card-reveal-layer").css("display", "block");
          $(".cards-roll-area-img4").css("display", "none");
          $("#scaling-card").css({
            animation: "scalecard 2s forwards",
          });
          $("#scaling-card-reveal").css({
            animation: "scalecard 2s forwards",
          });
          $("#cards-animation-layer").fadeOut(2000);
          setTimeout(function () {
            if (!cardFlipped && !isCardPutBack) {
              flipCard();
            }
          }, 6000);
          setTimeout(function () {
            if (!isCardPutBack) {
              flipCard();
            }
          }, 12000);
        }, 3000);
      });
    });
  }
  //initiallyRollCards();
  function flipCard() {
    if (!cardFlipped) {
      cardFlipped = true;
      $("#scaling-card-reveal").attr(
        "src",
        "https://crownchase.s3.us-east-1.amazonaws.com/public/img/cards/" + currCard + ".png"
      );
      $(".cards-roll-reveal-area").css({
        animation: "flipfrontcard 0.4s linear",
      });
      setTimeout(function () {
        $("#scaling-card").css({
          "z-index": -1,
        });
        $(".cards-roll-reveal-area").css({
          animation: "flipfrontcardcontinue 0.4s linear",
        });
      }, 400);
    } else {
      cardFlipped = false;
      isCardPutBack = true;
      cardFlippedsecond = false;
      isCardPutBacksecond = true;
      $(".cards-roll-reveal-area").css({
        animation: "flipbackcard 0.4s linear",
      });
      setTimeout(function () {
        $("#scaling-card").css({
          "z-index": 1,
        });
        $(".cards-roll-reveal-area").css({
          animation: "flipbackcardcontinue 0.4s linear",
        });
        placeBackCard();
      }, 400);
    }
  }
  function flipCardSetteled() {
    if (!cardFlippedsecond) {
      cardFlippedsecond = true;
      $(".card-placed-img-reveal").attr(
        "src",
        "https://crownchase.s3.us-east-1.amazonaws.com/public/img/cards/" + currCard + ".png"
      );
      $("card-score-card-reveal-area").css({
        animation: "flipfrontcard 0.4s linear",
      });
      setTimeout(function () {
        $(".card-placed-img").css({
          "z-index": -1,
        });
        $(".card-score-card-reveal-area").css({
          animation: "flipfrontcardcontinue 0.4s linear",
        });
      }, 400);
    } else {
      cardFlippedsecond = false;
      isCardPutBacksecond = true;
      $(".card-score-card-reveal-area").css({
        animation: "flipbackcard 0.4s linear",
      });
      setTimeout(function () {
        $(".card-placed-img").css({
          "z-index": 1,
        });
        $(".card-score-card-reveal-area").css({
          animation: "flipbackcardcontinue 0.4s linear",
        });
      }, 400);
    }
  }
  function placeBackCard() {
    $(".card-roll-image").css({
      animation: "putBackCard 2s forwards",
    });
    setTimeout(function () {
      $("#card-reveal-layer").fadeOut(500);
      showPlayArea();
    }, 2000);
  }

  $(document).on("click", ".card-roll-image", function () {
    flipCard();
  });
  $(document).on("click", ".card-placed", function () {
    flipCardSetteled();
  });
  let timerTimeout;
  function startTimer(time) {
    if (timerTimeout) {
        clearTimeout(timerTimeout);
    }
    $(".timer-container").css("animation", "none");
    $(".timer-container").css("-webkit-animation", "none");
    $(".timer").css("animation", "none");
    $(".timer").css("-webkit-animation", "none");

    $("#timer-frame").attr("src", "https://crownchase.s3.us-east-1.amazonaws.com/public/img/timer/ongoing.png");
    $(".timer-container").css(
      "-webkit-animation",
      "time " + time + "s linear 1"
    );
    $(".timer-container").css("animation", "time " + time + "s linear 1");
    $(".timer").css("-webkit-animation", "mask " + time + "s linear 1");
    timerTimeout = setTimeout(function () {
      $("#timer-frame").attr("src", "https://crownchase.s3.us-east-1.amazonaws.com/public/img/timer/timeup.png");
      socket.send(JSON.stringify({
        action: "guessThief",
        gameid: gamePin,
        choice: 7
    }));
    }, time * 1000);
  }
  function showPlayArea() {
    $("#layer2").fadeOut(500);
    $("#king-name").text(players[kingIndex]);
    $("#minister-name").text(players[ministerIndex]);
    $("#king-pfp").attr(
      "src",
      "https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/" + playersPfp[kingIndex]
    );
    $("#minister-pfp").attr(
      "src",
      "https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/" + playersPfp[ministerIndex]
    );
    $("#game-curr-text").show();
    if (currCard == 4) {
      $("#king-name").text(players[kingIndex] + " (You)");
      $(".thief-soldier-area").hide();
      $("#game-curr-text").text(
        "Your Majesty! Minister " +
          players[ministerIndex] +
          " is pursuing the thief."
      );
    }
    if (currCard == 5) {
      $("#minister-name").text(players[ministerIndex] + " (You)");
      $("#third-person-name").text(players[thirdPersonIndex]);
      $("#fouth-person-name").text(players[fourthPersonIndex]);
      $("#third-person-pfp").attr(
        "src",
        "https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/" + playersPfp[thirdPersonIndex]
      );
      $("#fourth-person-pfp").attr(
        "src",
        "https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/" + playersPfp[fourthPersonIndex]
      );
      $(".thief-soldier-area").show();
      $("#game-curr-text").text(
        "Minister " + players[ministerIndex] + "! Help us find the thief."
      );
    }
    if (currCard == 6 || currCard == 7) {
      $(".thief-soldier-area").hide();
      $("#game-curr-text").text(
        "Minister " + players[ministerIndex] + " is finding the thief."
      );
    }
    $("#playing-area-layer").fadeIn(500);
    $("#score-board").empty();
    let sessionHeader = `<h2>Court Session - ${currSession}/${currentSessions}</h2>`;
    $("#score-board").append(sessionHeader);
    for (let i = 0; i < players.length; i++) {
      let playerName = players[i];
      let score = playersScore[i];
      let pfp = playersPfp[i];
      let scoreRow = `
            <div class="score-row">
                <img src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/${pfp}" class="scorepfp" />
                <div class="profilenamescore">
                    <div class="profilename">${playerName}</div>
                    <div class="profilescore">${score}</div>
                </div>
            </div>
        `;
      $("#score-board").append(scoreRow);
    }
    //startTimer(120);
    
    //showAura(0);
  }
  //dropParchment(3);

  function showAura(points) {
      $("#plus-aura-layer").show();
      let keyplay = '';
      if (points > 0) {
        $("#plus-aura-layer").addClass("positive-aura");
        $("#plus-aura-layer").removeClass("negative-aura");
        $("#aura-heading").text("+" + points + " Aura");
        keyplay = 'scoreup';
      } else {
        $("#plus-aura-layer").addClass("negative-aura");
        $("#plus-aura-layer").removeClass("positive-aura");
        $("#aura-heading").text(points + " Aura");
        keyplay = 'scoredown';
      }
      $("#plus-aura-layer").css({
        animation: "auralayer 3s forwards",
      });
      $("#aura-heading").css({
        animation: "gayab 3s forwards",
      });
      playSound(keyplay);
      setTimeout(function () {
        $("#plus-aura-layer").hide();
      }, 3000);
    }
 
  
  const socket = new WebSocket(`wss://lbd5gqoguj.execute-api.us-east-1.amazonaws.com/production?token=${token}`);

  socket.onopen = (event) => {
    console.log("Connected to server");
  };
  var tempPlayers = [];
  socket.onmessage = function(event) {

    try {
    const data = JSON.parse(event.data); // Parse JSON
    if (data.responseType === "updateWaitingPlayers") {
    // Iterate through each player in the players array
    $("#parchment-wait-characters").empty();

  
    data.players.forEach(function(player) {
        $("#parchment-wait-characters").append(`
            <div class="parchment-wait-character-list">
                <img
                    src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/${player.profilepic}"
                    alt=""
                />
                <p>${player.playername}</p>
            </div>
        `);

        tempPlayers.push(player.playername);
      
    });
    console.log(data.createdBy);
    console.log(token);
    console.log(data.players.length);
    if(data.players.length == 4 && token == data.createdBy){
      $(".parchment-wait-start-btn").fadeIn(1000);
    }
    if(data.players.length == 4){
      $("#wait-text").text("Starting Game");
      players = tempPlayers;
      playersScore = [0, 0, 0, 0];
    }
}
if (data.responseType === "deltaAura"){
  showAura(parseInt(data.message, 10));
}
if(data.responseType === "endGame"){
  $("#playing-area-layer").fadeOut(1000);
  dropParchment(3);
  playSound("winner");
  playersScore = data.finalScores;
    setTimeout(function () {
        $("#upperparchment-layer").attr("style", "display: flex !important; top: -87vh !important;");
        $("#lowerparchment-layer").attr("style", "display: block !important; top: 87vh !important;");
        $("#parchment-layer").attr("style", "display: flex !important;");
    }, 2400);
}
if(data.responseType === "invalidGame"){
  let playersleft = data.playersLeft;

  dropParchment(4);
  $("#parchment-wait-characters").empty();
  data.playersLeft.forEach(function(player) {
    let indexs = tempPlayers.indexOf(player);
    let profilePic = playersPfp[indexs];
    console.log(tempPlayers);
    console.log(indexs);
    console.log(profilePic);
    $("#playing-area-layer").hide();
    $("#card-reveal-layer").hide();
    $("#cards-animation-layer").hide();

    $("#parchment-wait-characters").append(`
        <div class="parchment-wait-character-list">
            <img
                src="https://crownchase.s3.us-east-1.amazonaws.com/public/img/characters/${profilePic}"
                alt=""
            />
            <p>${player}</p>
        </div>
    `);      
    });

  

}
if (data.responseType === "rollCards") {
  currentSessions = data.currentSessions;
  currCard = data.currCard;
  players = data.players;
  playersScore = data.playersScore;
  playersPfp = data.playersPfp;
  currSession = data.currSession;
  thirdPersonIndex = data.thirdPersonIndex;
  fourthPersonIndex = data.fourthPersonIndex;
  kingIndex = data.kingIndex;
  ministerIndex = data.ministerIndex;
  $("#data-player-left").data('player', thirdPersonIndex);
  $("#data-player-right").data('player', fourthPersonIndex);
  document.getElementById("layer2").style.setProperty("display", "none", "important");
  initiallyRollCards();
  startTimer(120);
  if(!gameStarted){
    gameStarted = true;
    hideParchment();
  }
}
    console.log("Message from server:", data);
  } catch (error) {
    console.log("Failed to parse message:", error);
  }
};

  socket.onclose = (event) => {
    console.log("Disconnected from server");
  };
  function joinGame(gamejoinpin, userToken, pfppic, username){
    socket.send(JSON.stringify({
    action: "joinRoom",
    gameid: gamejoinpin,
    gameusertoken: userToken,
    gamepfppic: pfppic,
    gameusername: username
  }));
  $(document).on("click", ".parchment-wait-start-btn", function () {
    socket.send(JSON.stringify({
    action: "startGame",
    gameid: gamejoinpin
  }));
  $(".parchment-wait-start-btn").fadeOut(500);
  });
  }
  $(document).on("click", ".thief-soldier-img-area", function () {
    var playerChoice = $(this).data('player');
    socket.send(JSON.stringify({
    action: "guessThief",
    gameid: gamePin,
    choice: playerChoice
  }));
  });
  $(document).on('click', '.restart-btn', function() {
    location.reload();
});
// currCard = 5;

// showPlayArea();

function updateImage() {
    $("#rules-img").attr(
      "src",
      `https://crownchase.s3.us-east-1.amazonaws.com/public/img/rules/${currRuleImage}.png`
    );
  }

  function updateButtons() {
    if (currRuleImage === minRuleImage) {
      $("#rule-previous").hide();
    } else {
      $("#rule-previous").show();
    }

    if (currRuleImage === maxRuleImage) {
      $("#rule-next").hide();
    } else {
      $("#rule-next").show();
    }
  }

  $(document).on("click", "#rule-next", function () {
    if (currRuleImage < maxRuleImage) {
      currRuleImage++;
      updateImage();
      updateButtons();
    }
  });

  $(document).on("click", "#rule-previous", function () {
    if (currRuleImage > minRuleImage) {
      currRuleImage--;
      updateImage();
      updateButtons();
    }
  });
});
