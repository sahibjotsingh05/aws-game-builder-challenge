$(document).ready(function () {
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
      return `<div class="parchment-row-align-right"><img src="/public/img/cross.png" class="parchment-cross"/></div><div class="parchment-row-center"><input type="text" class="game-pin-text" placeholder="GAME PIN" /><p class="game-pin-error">Error: PIN not found</p><button class="game-pin-btn">ENTER</button><p class="parchment-or-text">OR</p><button class="game-pin-btn">CREATE PIN</button></div>`;
    }
    if (type == 1) {
      return `
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
          <input type="text" class="game-pin-text" placeholder="Your Name?" />
          <div class="court-sessions-container">
            <button class="game-pin-btn-court-session-controls decrement">
              -
            </button>
            <span class="court-sessions-display">Court Sessions = 20</span>
            <button class="game-pin-btn-court-session-controls increment">
              +
            </button>
          </div>
          <button class="game-pin-btn">Next</button>
        `;
    }
    return ``;
  }

  function dropParchment(type) {
    var htmlString = getHTMLContent(type);
    //$("#parchment").empty();
    //$("#parchment").append(htmlString);
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
  dropParchment(0); // temporarily

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
  let currselected = 0;
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
  let currentSessions = 20;

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
});
