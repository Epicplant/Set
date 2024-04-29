/**
 * Christopher Roy
 * 04/26/2020
 * Section AK: Austin Jenchi
 * Javascript code the game "set." This code deals with creating cards and manipulating the buttons
 * and selectors of set.css and set.html in order to make the game run like it would be expected to.
 */
"use strict";
(function() {
  window.addEventListener("load", init);

  const TEN_SECS = 10;
  const SECOND = 1000;
  const EASY = 9;
  const HARD = 12;
  const MINUTE = 60;
  const COUNT = [1, 2, 3];
  const SHAPE = ["diamond", "oval", "squiggle"];
  const STYLE = ["solid", "outline", "striped"];
  const COLOR = ["red", "green", "purple"];
  let time = 0;
  let isHard;
  let interval;

  /**
   * The init function waits until the dom has loaded for it run the inside code, ensuring
   * that all following chained code will run into a DOM error concerning the DOM not having
   * been initilized yet.
   */
  function init() {
    id("start-btn").addEventListener("click", toggleViews);
    id("back-btn").addEventListener("click", toggleViews);
    id("refresh-btn").addEventListener("click", refresh);
  }

  /**
   * Changes the view of the game from actually showing the game where you
   *  play the game to showing the game menu where you choose difficulty and timer.
   */
  function toggleViews() {
    id("refresh-btn").disabled = false;
    if (id("menu-view").classList.contains("hidden")) {
      id("board").innerHTML = "";
      id("menu-view").classList.remove("hidden");
      id("game-view").classList.add("hidden");
      id("set-count").textContent = "0";
      clearInterval(interval);
      interval = null;
    } else {
      id("menu-view").classList.add("hidden");
      id("game-view").classList.remove("hidden");
      if (!document.getElementsByName("diff")[0].checked) {
        isHard = true;
        startTimer();
        for (let i = 0; i < HARD; i++) {
          id("board").appendChild(generateUniqueCard(false));
        }
      } else {
        isHard = false;
        startTimer();
        for (let i = 0; i < EASY; i++) {
          id("board").appendChild(generateUniqueCard(true));
        }
      }
    }
  }

  /**
   * The generateRandomAttributes function essentially returns an array of values that will be
   * used to create a card in the generateUniqueCard function.
   * @param {Boolean} isEasy - if `true` style of card will always be solid, otherwise the
   * style attribute should be randomly selected.
   * @return {Array} attributes -An array consisting of style, shape, color, and img count used to
   * create a card in the set game.
   */
  function generateRandomAttributes(isEasy) {
    let styleVal = "solid";
    if (!isEasy) {
      styleVal = randArray(STYLE);
    }
    return [styleVal, randArray(SHAPE), randArray(COLOR), randArray(COUNT)];
  }

  /**
   * A function that takes a string array and returns a randomly selected stored string.
   * @param {Array} arg -A string array that contains attributes for the game set
   * @return {String} arg -A randomly selected attribute that will be assigned to a card.
   */
  function randArray(arg) {
    return arg[Math.floor(Math.random() * (arg.length))];
  }

  /**
   * This function generates and returns a unique card that will be placed in the game
   * "set." The card is given a unique id and is returned to be placed as a child in the
   * board id found in set.html.
   * @param {Boolean} isEasy -if `true`, the style of card will always be solid, otherwise each
   * of the three possible styles is equally likely.
   * @return {Object} card -A generated card being returned in order to put it on the game board.
   */
  function generateUniqueCard(isEasy) {

    let card = gen("div");
    let attributes = generateRandomAttributes(isEasy);
    let uniqueId = "" + attributes[0] + "-" + attributes[1] + "-" + attributes[2] + "-" +
                   attributes[3];

    for (let i = 0; i < attributes[3]; i++) {
      let img = gen("img");
      img.src = "img/" + attributes[0] + "-" + attributes[1] + "-" + attributes[2] + ".png";
      img.alt = uniqueId;
      card.appendChild(img);
    }

    card.id = uniqueId;
    let cards = qsa(".card");
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].id === uniqueId) {
        card = generateUniqueCard(isEasy);
      }
    }

    card.classList.add("card");
    card.addEventListener("click", cardSelected);
    return card;
  }

  /**
   * This function sets up an interval timer by setting the game timer to selected time in
   * the game menu. Activates the advanceTimer function.
   */
  function startTimer() {
    let timeIndex = qs("select").selectedIndex;
    time = qs("select")[timeIndex].value;
    id("time").textContent = "0" + ((time / MINUTE)) + ":00";
    interval = setInterval(advanceTimer, SECOND);
  }

  /**
   * Ends the game of set by removing card EventListeners and removing the refresh button
   * EventListener
   */
  function endGame() {
    id("refresh-btn").disabled = true;
    let cards = document.querySelectorAll(".card");
    for (let i = 0; i < cards.length; i++) {
      cards[i].classList.remove("selected");
      cards[i].removeEventListener("click", cardSelected);
    }
  }

  /**
   * This function decreases the game time by 1 every second and makes the game unplayable
   * until the game is reset by going to the game menu and starting a new game.
   */
  function advanceTimer() {
    time--;
    let minutes = "0" + Math.floor(time / MINUTE);
    let secs = time % MINUTE;
    if (secs < TEN_SECS) {
      secs = "0" + secs;
    }
    id("time").textContent = minutes + ":" + secs;
    if (time === 0) {
      endGame();
      clearInterval(interval);
      interval = null;
    }
  }

  /**
   * This function determines whether a card is a set or not and replaces 3 cards
   * if they are a set and states that 3 cards are not a set if they aren't.
   */
  function cardSelected() {
    if (this.classList.contains("selected")) {
      this.classList.remove("selected");
    } else {
      this.classList.add("selected");
    }

    if (qsa(".selected").length === 3) {

      let cards = document.querySelectorAll("div.card.selected");
      for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        card.classList.remove("selected");
      }

      if (isASet(cards)) {
        id("set-count").textContent = "" + (parseInt(id("set-count").textContent) + 1);
        setter(true, cards);
      } else {
        setter(false, cards);
      }
    }
  }

  /**
   * This function is used to state whether 3 cards are a set or not. If it is a set, all
   * three of the cards are replaced with newly generated ones.
   * @param {Boolean} set - States whether the three cards are a set or not.
   * @param {ElementList} cards - A list of the cards that have been selected.
   */
  function setter(set, cards) {
    for (let i = 0; i < cards.length; i++) {
      let uniqueCard;
      let card;
      if (set) {
        uniqueCard = generateUniqueCard(!isHard);
        id("board").replaceChild(uniqueCard, id(cards[i].id));
        card = id(uniqueCard.id).appendChild(gen("p"));
        card.textContent = "SET!";
      } else {
        uniqueCard = cards[i];
        card = id(cards[i].id).appendChild(gen("p"));
        card.textContent = "Not a Set";
      }
      uniqueCard.classList.add("hide-imgs");
    }

    let newCards = document.querySelectorAll(".hide-imgs");
    setTimeout(function() {
      for (let i = 0; i < newCards.length; i++) {
        id(newCards[i].id).removeChild(id(newCards[i].id).lastChild);
        newCards[i].classList.remove("hide-imgs");
      }
    }, SECOND);
  }

  /**
   * This function refreshes the board by clearing all cards currently on it and replacing
   * all said removed cards with newly generated ones.
   */
  function refresh() {
    let cards = qsa(".card");
    let length = cards.length;
    for (let i = 0; i < length; i++) {
      id("board").removeChild(cards[i]);
      let card = generateUniqueCard(!isHard);
      card.addEventListener("click", cardSelected);
      id("board").appendChild(card);
    }
  }

  /**
   * Checks to see if the three selected cards make up a valid set. This is done by comparing each
   * of the type of attribute against the other two cards. If each four attributes for each card are
   * either all the same or all different, then the cards make a set. If not, they do not make a set
   * @param {DOMList} selected - list of all selected cards to check if a set.
   * @return {boolean} true - if valid set false otherwise.
   */
  function isASet(selected) {
    let attribute = [];
    for (let i = 0; i < selected.length; i++) {
      attribute.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attribute[0].length; i++) {
      let allSame = attribute[0][i] === attribute[1][i] &&
                    attribute[1][i] === attribute[2][i];
      let allDiff = attribute[0][i] !== attribute[1][i] &&
                    attribute[1][i] !== attribute[2][i] &&
                    attribute[0][i] !== attribute[2][i];
      if (!(allSame || allDiff)) {
        return false;
      }
    }
    return true;
  }

  /**
   * This function accepts an id name and gets said elemeny from the html page index.html.
   * @param {String} idName - A name of an elements id in index.html.
   * @return {Element} id - Returns an element with a specific ID.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

  /**
   * This function accepts an element type and gets said list of elements from the
   * html page index.html.
   * @param {String} qsaName - A name of a list of elements in index.html.
   * @return {Element} qsa - Returns a list of a type of element.
   */
  function qsa(qsaName) {
    return document.querySelectorAll(qsaName);
  }

  /**
   * This function accepts the name of an element type and then creates it.
   * @param {String} elName - The name of an element that is to be created.
   * @return {Element} gen - Returns a newly created element.
   */
  function gen(elName) {
    return document.createElement(elName);
  }

  /**
   * This function accepts the name of an element type and returns the first found instance of it.
   * @param {String} qsName - The name of the element you wish to gain access to.
   * @return {Element} qs - Returns a newly created reference to the first instance of
   * a specific element.
   */
  function qs(qsName) {
    return document.querySelector(qsName);
  }

})();