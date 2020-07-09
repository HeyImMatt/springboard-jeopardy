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
    let res = await axios.get('http://jservice.io/api/categories', {params: { count: 100, offset: Math.floor(Math.random() * 7220) } });
    return _.sampleSize(res.data, 6)
  }
  catch (err) {
    alert('Oops! Something went wrong! Try again.')
    throw new Error(err)
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
    let res = await axios.get('http://jservice.io/api/category', {params: { id: catId } });
    if (res.data.clues_count > 5) {
      return { title: res.data.title, clues: _.sampleSize(res.data.clues, 5) }
    } 
    return { title: res.data.title, clues: res.data.clues }
  }
  catch (err) {
    alert('Oops! Something went wrong! Try again.')
    throw new Error(err)
  }
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */
async function fillTable(clues) {
  const $gameboard = $('#gameboard');
  const $thead = $('<thead></thead>');
  const $tr = $('<tr></tr>');

  clues.forEach( clue => {
    const $th = $(`
      <th>${clue.title}</th>
    `)
    $tr.append($th)
  })
  $thead.append($tr);
  $gameboard.append($thead);

  console.log(clues)
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {

}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
  const categories = await getCategoryIds();

  const cluesPromises = categories.map(async (category) => {
    return await getCategory(category.id)
  });
  const clues = await Promise.all(cluesPromises);

  fillTable(clues);
}

/** On click of start / restart button, set up game. */
$('#new-game-btn').click(setupAndStart);

/** On page load, add event handler for clicking clues */

// TODO