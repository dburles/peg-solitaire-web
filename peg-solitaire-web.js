const VALUE = 1;
const ELEMENT = 2;
const MOVES = 3;

const colors = {
  empty: "lightgrey",
  filled: "#444",
  suggested: "red",
};

const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("viewBox", "-.5 -.5 7 7");
document.getElementById("container").appendChild(svg);

function cc(x, y) {
  const element = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "circle"
  );
  element.setAttribute("r", ".4");
  element.setAttribute("cx", x);
  element.setAttribute("cy", y);
  element.setAttribute("fill", colors.filled);
  return element;
}

// [index, value, moves[jump position, final position]]
// prettier-ignore
const initial_board = [
  [0, 1, cc(2, 0), [[1, 2], [3, 8]]],
  [1, 1, cc(3, 0), [[4, 9]]],
  [2, 1, cc(4, 0), [[1, 0], [5, 10]]],
  [3, 1, cc(2, 1), [[4, 5], [8, 15]]],
  [4, 1, cc(3, 1), [[9, 16]]],
  [5, 1, cc(4, 1), [[4, 3], [10, 17]]],
  [6, 1, cc(0, 2), [[7, 8], [13, 20]]],
  [7, 1, cc(1, 2), [[8, 9], [14, 21]]],
  [8, 1, cc(2, 2), [[7, 6], [3, 0], [9, 10], [15, 22]]],
  [9, 1, cc(3, 2), [[8, 7], [4, 1], [10, 11], [16, 23]]],
  [10, 1, cc(4, 2), [[9, 8], [5, 2], [11, 12], [17, 24]]],
  [11, 1, cc(5, 2), [[10, 9], [18, 25]]],
  [12, 1, cc(6, 2), [[11, 10], [19, 26]]],
  [13, 1, cc(0, 3), [[14, 15]]],
  [14, 1, cc(1, 3), [[15, 16]]],
  [15, 1, cc(2, 3), [[14, 13], [8, 3], [16, 17], [22, 27]]],
  [16, 0, cc(3, 3), [[15, 14], [9, 4], [17, 18], [23, 28]]],
  [17, 1, cc(4, 3), [[16, 15], [10, 5], [18, 19], [24, 29]]],
  [18, 1, cc(5, 3), [[17, 16]]],
  [19, 1, cc(6, 3), [[18, 17]]],
  [20, 1, cc(0, 4), [[13, 6], [21, 22]]],
  [21, 1, cc(1, 4), [[14, 7], [22, 23]]],
  [22, 1, cc(2, 4), [[21, 20], [15, 8], [23, 24], [27, 30]]],
  [23, 1, cc(3, 4), [[22, 21], [16, 9], [24, 25], [28, 31]]],
  [24, 1, cc(4, 4), [[23, 22], [17, 10], [25, 26], [29, 32]]],
  [25, 1, cc(5, 4), [[24, 23], [18, 11]]],
  [26, 1, cc(6, 4), [[25, 24], [19, 12]]],
  [27, 1, cc(2, 5), [[22, 15], [28, 29]]],
  [28, 1, cc(3, 5), [[23, 16]]],
  [29, 1, cc(4, 5), [[28, 27], [24, 17]]],
  [30, 1, cc(2, 6), [[27, 22], [31, 32]]],
  [31, 1, cc(3, 6), [[28, 23]]],
  [32, 1, cc(4, 6), [[31, 30], [29, 24]]],
];

const board = [...initial_board];

let pending_move = {
  index: undefined,
  moves: [],
};

function get_available_moves(index) {
  return board[index][MOVES].filter(([jump, final]) => {
    // If there is a peg we can jump and there isn't one in the final position.
    return board[jump][VALUE] === 1 && board[final][VALUE] === 0;
  });
}

function clear_pending_move() {
  if (pending_move.index !== undefined) {
    // Clear the previously pending move
    for (const [, final] of pending_move.moves) {
      const element = board[final][ELEMENT];
      element.removeAttribute("stroke-width");
      element.removeAttribute("stroke");
    }
  }
}

function suggest_moves(index) {
  clear_pending_move();

  const available_moves = get_available_moves(index);

  if (available_moves.length > 0) {
    pending_move = {
      index: index,
      moves: available_moves,
    };

    // Highlight all the possible moves for this peg.
    for (const [, final] of available_moves) {
      const element = board[final][ELEMENT];
      element.setAttribute("stroke-width", ".05");
      element.setAttribute("stroke", colors.suggested);
    }
  }
}

function lift_peg(index) {
  const element = board[index][ELEMENT];
  board[index][VALUE] = 0;
  element.setAttribute("fill", colors.empty);
}

function place_peg(index) {
  const element = board[index][ELEMENT];
  board[index][VALUE] = 1;
  element.setAttribute("fill", colors.filled);
}

for (const [index, value, element] of board) {
  // Fill the board.
  element.setAttribute("fill", colors[value === 1 ? "filled" : "empty"]);

  element.addEventListener("click", () => {
    // If this hole has a peg, then we can move it
    if (board[index][VALUE] === 1) {
      suggest_moves(index);
    } else {
      if (pending_move.index !== undefined) {
        const [jump] =
          pending_move.moves.find(([, final]) => {
            return final === index;
          }) || [];

        if (jump) {
          clear_pending_move();

          // Lift the peg.
          lift_peg(pending_move.index);

          // Remove jumped peg.
          lift_peg(jump);

          // Add peg to final position.
          place_peg(index);
        }
      }
    }
  });

  svg.appendChild(element);
}
