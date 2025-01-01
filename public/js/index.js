$(document).ready(function () {
  let currselected = 0;
  let currentSessions = 20;
  let gamePin = "";
  let currCard = 4;
  let king = "Sahib";
  let minister = "Dev";

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
      return `<div class="parchment-row-align-right"><img src="/public/img/cross.png" class="parchment-cross"/></div><div class="parchment-row-center"><input type="text" class="game-pin-text" placeholder="GAME PIN" id="game-entered-pin" /><p class="game-pin-error" id="error-entered-pin">Error: PIN not found</p><button class="game-pin-btn" id="enter-game-pin">ENTER</button><p class="parchment-or-text">OR</p><button class="game-pin-btn" id="create-pin-btn">CREATE PIN</button></div>`;
    }
    if (type == 1) {
      return (
        `
        <div class="parchment-row-align-right">
          <img
            src="/public/img/cross.png"
            class="parchment-cross"
          />
        </div>
        <div class="parchment-row-center">
          <div class="parchment-flex-row">
            <img
              src="/public/img/left-select.png"
              class="parchment-profile-pic-select pfp-select-left"
            />
            <img
              src="/public/img/characters/10.svg"
              class="parchment-profile-pic"
              id="parchment-pfp"
            />
            <img
              src="/public/img/right-select.png"
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
          <p>Waiting for players to join</p>
          <img src="/public/img/load.gif" />
        </div>
        <div class="parchment-wait-character-list">
          <img
            src="/public/img/characters/11.svg"
          />
          <p>Player 1</p>
        </div>
        <div class="parchment-wait-character-list">
          <img
            src="/public/img/characters/11.svg"
          />
          <p>Player 2</p>
        </div>
        <div class="parchment-wait-character-list">
          <img
            src="/public/img/characters/11.svg"
          />
          <p>Player 3</p>
        </div>
        <div class="parchment-wait-character-list">
          <img
            src="/public/img/characters/11.svg"
          />
          <p>Player 4</p>
        </div>
        <div class="parchment-wait-start-btn">Start Game</div>`
      );
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
    dropParchment(0);
  });
  $("#play-against-ai").click(function () {
    dropParchment(1);
  });
  $("#how-to-play").click(function () {
    dropParchment(2);
  });
  $(document).on("click", ".parchment-cross", function () {
    hideParchment();
  });
  $(document).on("click", "#create-pin-btn", function () {
    hideParchment();
    setTimeout(function () {
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
        url: "/validate-game-pin",
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
    const profilePic = currselected;

    if (playerName == "") {
      $("#playerNameError").text("Please enter your name");
      $("#playerNameError").css("display", "block");
    } else {
      if (gamePin != "") {
        alert("ye to game pin hai!");
      } else {
        $("#playerNameError").css("display", "none");
        $("#parchment-loader-layer").css("display", "grid");
        // Make AJAX POST request to the /create-game endpoint
        $.ajax({
          url: "/create-game", // Flask endpoint
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

  //dropParchment(2); // temporarily

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
    img.src = "/public/img/characters/" + pfp;
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
  function initiallyRollCards() {
    hideMainScreen();
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
  initiallyRollCards();
  var cardFlipped = false;
  var cardFlippedsecond = false;
  var isCardPutBack = false;
  var isCardPutBacksecond = false;
  function flipCard() {
    if (!cardFlipped) {
      cardFlipped = true;
      $("#scaling-card-reveal").attr(
        "src",
        "/public/img/cards/" + currCard + ".png"
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
        "/public/img/cards/" + currCard + ".png"
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
  function startTimer(time) {
    $("#timer-frame").attr("src", "/public/img/timer/ongoing.png");
    $(".timer-container").css(
      "-webkit-animation",
      "time " + time + "s linear 1"
    );
    $(".timer-container").css("animation", "time " + time + "s linear 1");
    $(".timer").css("-webkit-animation", "mask " + time + "s linear 1");
    setTimeout(function () {
      $("#timer-frame").attr("src", "/public/img/timer/timeup.png");
    }, time * 1000);
  }
  function showPlayArea() {
    $("#layer2").fadeOut(500);
    $("#king-name").text(king);
    $("#minister-name").text(minister);
    if (currCard == 4) {
      $("#king-name").text(king + " (You)");
      // $(".thief-soldier-area").hide();
      $("#game-curr-text").text(
        "Your Majesty! Minister " + minister + " is pursuing the thief."
      );
    }
    $("#playing-area-layer").fadeIn(500);
    startTimer(120);
  }
});
