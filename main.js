// JavaScript File that contains the main application logic

var grid;
var speed;
var speedInt;
var solution = null;
var inProgress = false;

// Get the audio element and set the default volume level to 35%
const audio = document.getElementById("audio");
audio.volume = 0.35;

// Creating songs array with one song element to play for the viewer when visualizing the algorithm
const songs = ["summer"];

// Initially load song details into DOM
loadSong(songs[0]);

// Load Song
function loadSong(song) {
  audio.src = `music/${song}.mp3`;
}

// Play song
function playSong() {
  audio.play();
}

// Function to get the current Grid Details
const fetchCurrentGrid = () => {
  let grid = [];
  for (let row = 0; row < 9; row++) {
    let currentRow = [];
    let rowElement = document.querySelector(`.row:nth-child(${row + 1})`);
    for (col = 0; col < rowElement.children.length; col++) {
      currentRow.push(rowElement.children[col]);
    }
    grid.push(currentRow);
  }
  return grid;
};

grid = fetchCurrentGrid();
speed = "Fast";
speedInt = 3;

// Function to clear all the values from the Grid
const clearGrid = () => {
  if (inProgress) {
    showAlert(
      "Animation in Progress..  Please Reload the Page to solve another puzzle before animation gets completed.",
      "danger"
    );
    return;
  }
  grid.forEach((row) =>
    row.forEach((td) => {
      td.className = "";
      td.children[0].value = "";
    })
  );
  solution = null;
};

// Setting the OnClick Event Listener for Clear Grid Button
const clearGridBtn = document.getElementById("clearBtn");
clearGridBtn.addEventListener("click", clearGrid);

// Function to Generate Puzzle
const generatePuzzle = () => {
  if (inProgress) {
    showAlert(
      "Animation in Progress..  Please Reload the Page to solve another puzzle before animation gets completed.",
      "danger"
    );
    return;
  } else {
    clearGrid();
    fillDiagonalSectionsRandomly();
    backtracking(grid, 0, true);
    solution = grid.map((row) =>
      row.map((td) => {
        return td.children[0].value;
      })
    );
    // Randomly Delete Cells after solving puzzle to generate puzzle
    deleteRandomely();
    fixClasses();
  }
};

// Setting OnClick Event Listener for Generate Puzzle Button
const generateBtn = document.getElementById("generateBtn");
generateBtn.addEventListener("click", generatePuzzle);

const fillDiagonalSectionsRandomly = () => {
  let row = 0;
  let col = 0;
  let counter = 0;

  while (row != 9 && col != 9 && counter < 900) {
    counter++;
    let possibleNum = Math.floor(Math.random() * 9) + 1;

    grid[row][col].children[0].value = possibleNum;
    grid[row][col].classList.add("fixed");

    if (row % 3 == 0 && col % 3 == 0) {
      col++;
    } else if (isSquareValid(row, col, grid)) {
      if (col % 3 != 2) {
        col++;
      } else if (col % 3 === 2) {
        if (row % 3 === 2) {
          col++;
        } else {
          col = col - 2;
        }

        row++;
      }
    }
  }
};

const deleteRandomely = () => {
  let cellsToRemoveFromPuzzle = [];
  for (let i = 0; i < 80; i++) {
    let randomCellIdx = Math.floor(Math.random() * 81);
    cellsToRemoveFromPuzzle.push(randomCellIdx);
  }

  let counter = 0;
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (cellsToRemoveFromPuzzle.indexOf(counter) !== -1) {
        grid[row][col].children[0].value = "";
      }
      counter++;
    }
  }
};

const fixClasses = () => {
  grid.forEach((row) =>
    row.forEach((td) => {
      if (td.children[0].value) {
        td.className = "fixed";
      } else {
        td.className = "";
      }
    })
  );
};

// Function to disable the DOMRectdown menus while animating
const menus = document.querySelectorAll(`nav li input[type='checkbox']`);

menus.forEach((menu) => {
  menu.addEventListener("click", (e) => {
    if (e.target.checked) {
      menus.forEach((menu) => {
        if (menu !== e.target) {
          menu.checked = false;
        }
      });
    }
  });
});

// Handle the entered numbers into the grid
grid.forEach((row, rowIdx) =>
  row.forEach((td, colIdx) => {
    td.children[0].addEventListener("input", (e) => {
      if (e.target.value == "") {
        td.className = "";
        return;
      }

      if (
        ["1", "2", "3", "4", "5", "6", "7", "8", "9"].indexOf(
          e.target.value
        ) === -1
      ) {
        td.classList.add("wrong");
        setTimeout(() => {
          e.target.value = "";
          td.classList.remove("wrong");
        }, 500);
      } else {
        if (solution) {
          if (td.children[0].value == solution[rowIdx][colIdx]) {
            td.classList.add("correct");
          } else {
            td.classList.add("wrong");
          }
        } else {
          td.classList.add("fixed");
          if (isCellValid(rowIdx, colIdx, grid)) return;
          td.classList.remove("fixed");
          td.classList.add("wrong");
          setTimeout(() => {
            td.classList.remove("wrong");
            e.target.value = "";
          }, 500);
        }
      }
    });
  })
);

// Add Event isteners to adjust the speed of the animation
const speedBtns = document.querySelectorAll(`#speed ~ ul > li`);

speedBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    speed = e.target.getAttribute("data-value");

    // for UI
    speedBtns.forEach((option) => option.classList.remove("active"));
    e.target.classList.add("active");

    switch (speed) {
      case "Fast":
        speedInt = 3;
        break;
      case "Average":
        speedInt = 10;
        break;
      case "Slow":
        speedInt = 150;
        break;
    }
    document.getElementById("speed").checked = false;
  });
});

// Setting the Event Listener for VISUALIZE Button
const visualizeBtn = document.getElementById("visualizeBtn");

visualizeBtn.addEventListener("click", () => {
  if (inProgress) {
    showAlert(
      "Animation in Progress..  Please Wait till the animation completes..",
      "danger"
    );
    return;
  }

  //Clear the grid of previous solutions.
  grid.forEach((row) =>
    row.forEach((td) => {
      if (!td.classList.contains("fixed")) {
        td.children[0].value = "";
        td.className = "";
      }
    })
  );

  //Disabling the Dropdowns
  let menues = document.querySelectorAll(`ul input[type='checkbox']`);
  menues.forEach((checkbox) => {
    checkbox.checked = false;
    checkbox.disabled = true;
  });

  inProgress = true;
  playSong();
  return backtracking(grid, speedInt);
});
``;

// BackTracking Algorithm to solve the puzzle

const backtracking = (
  grid,
  speedInt,
  comingFromGenerator = false,
  row = 0,
  col = 0,
  counter = null,
  animationList = null
) => {
  if (!animationList) animationList = [];

  if (!counter) counter = { iteration: 0, startTime: Date.now() };

  counter["iteration"]++;

  // Break and throw alert to the user if algorithm takes too much time or steps to solve the current puzzle

  if (counter["iteration"] >= 100000) {
    showAlert(
      "Backtracking is a naive algorithm.Please try an easier puzzle for it.",
      "danger"
    );
    return false;
  }

  if (row === grid.length && col === grid[row].length) {
    clearGrid();
    animate(animationList, speedInt);
    return true;
  }

  let nextEmpty = findNextEmpty(grid, row, col);

  if (!nextEmpty) {
    if (!comingFromGenerator) {
      grid.forEach((row) =>
        row.forEach((td) => {
          if (!td.classList.contains("fixed")) {
            td.children[0].value = "";
          }
        })
      );

      animate(animationList, speedInt);

      let duration = Date.now() - counter["startTime"];
      showAlert(
        `Backtracking Algorithm solved the puzzle successfully in ${duration} ms.`,
        "success"
      );
    }

    enableMenu(animationList.length);

    return true;
  }

  let [nextRow, nextCol] = nextEmpty;

  for (let possibleNum = 1; possibleNum <= 9; possibleNum++) {
    grid[nextRow][nextCol].children[0].value = possibleNum;
    animationList.push([nextRow, nextCol, possibleNum, "wrong"]);

    if (isCellValid(nextRow, nextCol, grid)) {
      animationList.push([nextRow, nextCol, possibleNum, "correct"]);
      if (
        backtracking(
          grid,
          speedInt,
          comingFromGenerator,
          nextRow,
          nextCol,
          counter,
          animationList
        )
      )
        return true;
    }
  }

  grid[nextRow][nextCol].children[0].value = "";
  animationList.push([nextRow, nextCol, "", ""]);
  return false;
};

// Helper Functions to help solve the Puzzle using the BackTracking Algorithm
const isRowValid = (grid, rowIdx) => {
  for (let row = 0; row < 9; row++) {
    if (rowIdx === row) {
      let numsInRow = {};

      for (col = 0; col < 9; col++) {
        if (
          grid[rowIdx][col].children[0].value &&
          numsInRow[grid[rowIdx][col].children[0].value]
        ) {
          return false;
        } else if (grid[rowIdx][col].children[0].value) {
          numsInRow[grid[rowIdx][col].children[0].value] = true;
        }
      }

      return true;
    }
  }
};

const isColValid = (grid, colIdx) => {
  let numsInCol = {};

  for (let row = 0; row < grid.length; row++) {
    for (col = 0; col < grid[row].length; col++) {
      if (colIdx === col) {
        currentNum = grid[row][col].children[0].value;

        if (currentNum && numsInCol[currentNum]) {
          return false;
        } else if (currentNum) {
          numsInCol[currentNum] = true;
        }
      }
    }
  }

  return true;
};

const isSquareValid = (rowIdx, colIdx, matrix) => {
  let xSquare = Math.floor(colIdx / 3);
  let ySquare = Math.floor(rowIdx / 3);

  let numsInSquare = {};

  for (let row = ySquare * 3; row < (ySquare + 1) * 3; row++) {
    for (let col = xSquare * 3; col < (xSquare + 1) * 3; col++) {
      let currentNum = matrix[row][col].children[0].value;

      if (currentNum && numsInSquare[currentNum]) {
        return false;
      } else if (currentNum) {
        numsInSquare[currentNum] = true;
      }
    }
  }

  return true;
};

const isCellValid = (row, col, matrix) => {
  return (
    isRowValid(grid, row) &&
    isColValid(grid, col) &&
    isSquareValid(row, col, matrix)
  );
};

// Function to find the next empty cell to fill the value
const findNextEmpty = (grid, row, col) => {
  for (let currentRow = 0; currentRow < grid.length; currentRow++) {
    for (let currentCol = 0; currentCol < grid[row].length; currentCol++) {
      if (
        !grid[currentRow][currentCol].classList.contains("fixed") &&
        !grid[currentRow][currentCol].children[0].value
      ) {
        return [currentRow, currentCol];
      }
    }
  }
};

// Function to Animate and Visualize the Algorithm's Solution

const animate = (animationList, speedInt) => {
  for (let event = 0; event < animationList.length; event++) {
    setTimeout(() => {
      let [row, col, value, className] = animationList[event];
      grid[row][col].children[0].value = value;
      grid[row][col].className = className;
    }, event * speedInt);
  }
  enableMenu(animationList.length);
};

// Function to enable the menu after the animation is complete
const enableMenu = (events) => {
  setTimeout(() => {
    inProgress = false;

    document
      .querySelectorAll(`ul input[type='checkbox']`)
      .forEach((checkbox) => {
        checkbox.disabled = false;
      });
  }, events * speedInt);
};

// Function to create alerts
const showAlert = (msg, className) => {
  // Create the alert
  const alert = document.createElement("div");
  alert.classList.add("alert");
  alert.classList.add(className);
  alert.appendChild(document.createTextNode(msg));

  //Append the alert to body ( Display on the Screen )
  document.querySelector("body").appendChild(alert);

  setTimeout(() => {
    document.querySelector("body").removeChild(alert);
  }, 5000);
};
