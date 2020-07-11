// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  try {
    let res = await axios.get('http://jservice.io/api/categories', {
      params: { count: 100, offset: Math.floor(Math.random() * 7220) },
    });
    return _.sampleSize(res.data, 6);
  } catch (err) {
    alert('Oops! Something went wrong! Try again.');
    throw new Error(err);
  }
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */
async function getCategory(catId) {
  try {
    let res = await axios.get('http://jservice.io/api/category', {
      params: { id: catId },
    });
    if (res.data.clues_count > 5) {
      return { title: res.data.title, clues: _.sampleSize(res.data.clues, 5) };
    }
    return { title: res.data.title, clues: res.data.clues };
  } catch (err) {
    alert('Oops! Something went wrong! Try again.');
    throw new Error(err);
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
function fillTable(categories) {
  const $gameboard = $('#gameboard');
  const $thead = $('<thead></thead>');
  const $theadRow = $('<tr></tr>')
  const $tbody = $('<tbody></tbody>');
  
  $gameboard.html('')

  //creates the category headers
  categories.forEach((category) => {
    let $categorySquare = $(`
      <th>${category.title.toUpperCase()}</th>
    `);
    $theadRow.append($categorySquare);
  });
  $thead.append($theadRow)
  $gameboard.append($thead);

  //creates the clue squares
  for (let i = 0; i < categories.length - 1; i++) {
    let $tbodyRow = $('<tr></tr>')
    let clues = categories.map((category) => category.clues[i]);
    clues.forEach((clue) => {
      let $clueSquare = $(`
        <td class="game-square"><span class="showing"><i class="fa fa-question-circle" aria-hidden="true"></i></span><span class="question hidden">${clue.question.toUpperCase()}</span><span class="answer hidden">${clue.answer.toUpperCase()}</span></td>
      `)
      $clueSquare.on('animationend', function() {
        $clueSquare.removeClass('animate__animated', 'animate__flip')
      })
      $tbodyRow.append($clueSquare)
    });
    $tbody.append($tbodyRow)
  }
  $gameboard.append($tbody);
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */
function handleClick(evt) {
  //Hide question mark, show question
  if (evt.currentTarget.firstChild.classList.contains('showing')) {
    evt.currentTarget.firstChild.classList.remove('showing');
    evt.currentTarget.firstChild.classList.add('hidden');
    evt.currentTarget.firstChild.nextSibling.classList.remove('hidden');
    evt.currentTarget.firstChild.nextSibling.classList.add('showing');
    evt.currentTarget.classList.add('animate__animated', 'animate__flip');
  } 
  //Hide question, show answer
  else if (evt.currentTarget.firstChild.nextSibling.classList.contains('showing')) {
    evt.currentTarget.classList.add('animate__animated', 'animate__flip','answered');
    evt.currentTarget.firstChild.nextSibling.classList.remove('showing');
    evt.currentTarget.firstChild.nextSibling.classList.add('hidden');
    evt.currentTarget.lastChild.classList.remove('hidden');
    evt.currentTarget.lastChild.classList.add('showing');
  }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  const categoryIds = await getCategoryIds();

  const categoriesPromises = categoryIds.map(async (categoryId) => {
    return await getCategory(categoryId.id);
  });
  const categories = await Promise.all(categoriesPromises);

  fillTable(categories);
}

/** On click of start / restart button, set up game. */
$('#new-game-btn').click(setupAndStart);

/** On page load, add event handler for clicking clues */
$('#gameboard').on('click', '.game-square', { event }, handleClick);