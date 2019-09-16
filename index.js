var dataLoad;
var dates;
var players;
var scores;
const barsContainer = document.getElementsByClassName('bars')[0];
const horizontalGridlines = document.getElementsByClassName('horizontal-gridlines')[0];
const verticalGridlines = document.getElementsByClassName('vertical-gridlines')[0];
const valueAxis = document.getElementsByClassName('value-axis')[0];
const categoryAxis = document.getElementsByClassName('category-axis')[0];

// Initiate the window
window.onload = init();

// Watching click event on window, if the clicked element is not a bar, clear all the labels
window.addEventListener('click', function(e){
    if(!(e.target.className.split(' ').includes('bar'))){
        clearLabels();
    }
});

// Watching url changes, and modify interface according to the anchor
window.addEventListener('hashchange', function(e){
    const id = window.location.hash.replace("#", "")
    const params = id.split('_');
    const element = document.getElementById(id);
    const numberDate = dates.indexOf(params[1]);
    const score = scores[params[0]].points.filter(score => {
        return !!score;
    })[numberDate];
    const accumulate = accumulateScore(numberDate, scores, params[0]);
    clickBar(element, score, accumulate, players[params[0]]);
});

// Initiate the page 
function init() {
    // If data loading failed, show the error message
    getJSON('http://cdn.55labs.com/demo/api.json', function(err, data) {
        if(err !== 200) {
            console.log('error');
            alart('Get data failed: ' + err);
            document.getElementsByClassName('alarm')[0].appendChild(`<div class='fail'>Get data failed: ${err}</div>`);
        } else {
        // If data loading with success, initiate data and chart
            dataLoad = data;
            //Filter date not null
            dates = dataLoad.data.DAILY.dates.filter(date => {
                return !!date;
            });
            console.table(dates);
            players = dataLoad.settings.dictionary;
            console.table(players);
            scores = dataLoad.data.DAILY.dataByMember.players;
            console.table(scores);
            // Set title tag and h1 as the setting label indicates
            document.getElementsByTagName('title')[0].innerHTML = dataLoad.settings.label;
            document.getElementsByClassName('page-title')[0].innerHTML = dataLoad.settings.label;
            // Initiate Tags
            loadTags(players);
            // Initiate Chart
            loadChart(players, dates, scores);
        }
    });
}

// Get data
function getJSON(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(status, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

// Create bar chart with the data
function loadChart(players, dates, scores) {
    const playersKeys = Object.keys(players);
    // Filter score not null
    const score1 = scores[playersKeys[0]].points.filter(score => {
        return !!score;
    });
    const score2 = scores[playersKeys[1]].points.filter(score => {
        return !!score;
    });
    // Calculate bar width according to number og category (date)
    const barWith = 100/dates.length/3;
    // For each date, create a pair of bars for each player.
    for (let i = 0; i < dates.length; i++) {

        //create pair-container
        let pair = document.createElement('div');
        pair.setAttribute('class', 'pair-container');
        pair.style.width = `${barWith*2}%`;
        pair.style.marginLeft = `${barWith/2}%`;
        pair.style.marginRight = `${barWith/2}%`;
        
        // Create a pair of bars
        let bar1 = createBar(0, playersKeys, dates, i, score1);
        let bar2 = createBar(1, playersKeys, dates, i, score2);
        
        // Append bars to pair-container and append pair-container to barChart container
        pair.append(bar1);
        pair.append(bar2);
        barsContainer.append(pair);

        // Create horizontal gridline
        let gridHorizontal = document.createElement('div');
        gridHorizontal.style.width = `${barWith*3}%`;
        horizontalGridlines.append(gridHorizontal);

        // Create category axis
        let category = document.createElement('div');
        category.style.width = `${barWith*3}%`;
        categoryAxis.append(category);
        categoryAxis.children[i].innerHTML = dates[i];
    };

    // Create vertical gridline and value axis
    for(let i = 0; i < 10; i++) {
        let girdVertical = document.createElement('div');
        girdVertical.style.height = '10%';
        verticalGridlines.append(girdVertical);

        let value = document.createElement('div');
        value.style.height = '10%';
        valueAxis.append(value);
        valueAxis.children[i].innerHTML = 1000 - i * 100;
    }
}

/**
 * Set tags visible and set tags' labels as players' first name and last name
 * @param {object[]} players global variable players
 */
function loadTags(players) {
    const tags = document.getElementsByClassName('tags');
    const playersKeys = Object.keys(players);
    for(let i = 0; i < tags.length; i++) {

        tags[i].style.display = 'flex';
        tags[i].setAttribute('id',`tag_${playersKeys[i]}`);
        tags[i].children[1].innerHTML = `${players[playersKeys[i]].firstname} ${players[playersKeys[i]].lastname}`;
    }
}

/**
 * Clear the other labels and show the label of current bar
 * @param {object} element HTML element
 * @param {number} score The score of the current clicked bar
 * @param {number} accumulat Accumulate score from the first day to the day concerned about the clicked bar
 * @param {object} player The player who is concerned about the clicked bar
 */
function clickBar(element, score, accumulat, player) {
    clearLabels();
    changeURL(element.id);
    element.children[0].innerHTML = `${player.firstname} ${player.lastname} Score: ${score} Total: ${accumulat}`;
}

// TODO: click a tag, highlight all the bars of a player
// and show out the aggregate number of the player 
function clickTag(element) {

}

/**
 * Create a bar with the label and attached events to the bar
 * @param {number} playerIndex The index of the player
 * @param {string} playersKeys The key of the player (ex. john, larry)
 * @param {string[]} dates global variable, table of dates
 * @param {number} numberDate The index of the date in the data table
 * @param {number[]} score The table score of the player
 */
function createBar(playerIndex, playersKeys, dates, numberDate, score){
    let bar = document.createElement('div');
    bar.setAttribute('class',`bar bar${playerIndex + 1}`);
    bar.setAttribute('id', `${playersKeys[playerIndex]}_${dates[numberDate]}`);
    bar.style.height = `${score[numberDate]/10}%`;
    bar.style.width = '50%';
    let label = document.createElement('div');
    label.setAttribute('class','value-label');
    bar.append(label);
    let accumulate = accumulateScore(numberDate, score);
    bar.addEventListener("click", () => {clickBar(bar, score[numberDate], accumulate, players[playersKeys[playerIndex]]);});
    return bar;
}

/**
 * @param {string} id
 */
function changeURL(id) {
    window.location.hash = id;
}

// Clear the html content of all the value-label
function clearLabels() {
    let labels = document.getElementsByClassName('value-label');
    for( let i = 0; i < labels.length; i++) {
        labels[i].innerHTML = '';
    }
}

/**
 * Return the accumulate score from the first day to the indicated date
 * @param {number} numberDate The index of current date 
 * @param {Object | number[] } score The score table of a player or global variable scores with all the scores of two players
 * @param {string} key The key of the player (ex. john, larry). Required if param score is an object
 */
function accumulateScore(numberDate, score, key) {
    var scoreList = score;
    if(key) {
        scoreList = score[key].points.filter(score => {
            return !!score;
        });
    }
    let accScoreList = scoreList.slice(0, numberDate + 1);
    let accumulate = accScoreList.reduce((a, b) => a + b, 0);
    return accumulate;
}