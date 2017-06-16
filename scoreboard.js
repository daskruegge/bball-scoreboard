Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
}

var _init = {
  version: 1,
  home: {
    name: 'TSV',
    score: 0,
    fouls: 0
  },
  guest: {
    name: 'GUEST',
    score: 0,
    fouls: 0
  },
  time: {
    periodTime: 10 * 60,
    periods: 4,
    running: false,
    remainingTime: -1,
    started: 0
  }
}
var _data;
var _timer;

function handleKeypress(event) {

  if ($(event.target).is('input, textarea, select')) {
    _data.home.score = Number.parseInt($('#score_home').val());
    _data.guest.score = Number.parseInt($('#score_guest').val());

    updateView();
  } else {
    event.preventDefault();
    if (event.key) {
      switch (event.key) {
        case '+':
          if (!_data.time.running) {
            _data.time.remainingTime++;
            updateTime();
          }
          break;
        case '-':
          if (!_data.time.running) {
            _data.time.remainingTime--;
            updateTime();
          }
          break;
        case ' ':
          toggleTime();
          break;
        case 'a':
          _data.home.score = Math.max(--_data.home.score, 0);
          break;
        case 's':
          _data.home.score++;
          break;
        case 'k':
          _data.guest.score = Math.max(--_data.guest.score, 0);
          break;
        case 'l':
          _data.guest.score++;
          break;
        case 'q':
          // reset dialog
          $('#resetModal').modal('show');
          break;
        case 'h':
          $('.help-content').toggle();
          $('.help-trigger').toggle();
          break;
      }

      updateView();
    }
  }
}

function handleReset(event) {
  switch ($(this).data('type')) {
    case 'all':
      _data.time.remainingTime = _init.time.periodTime;
      _data.time.lastRemainingTime = 0;
      _data.time.running = false;
      _data.time.started = 0;
      _data.home.score = 0;
      _data.guest.score = 0;
      break;
    case 'time':
      _data.time.remainingTime = _init.time.periodTime;
      _data.time.lastRemainingTime = 0;
      _data.time.running = false;
      _data.time.started = 0;
      break;
    case 'scores':
      _data.home.score = 0;
      _data.guest.score = 0;
      break;
  }
  updateView();
  updateTime();
  $('#resetModal').modal('hide');
}

function updateTime() {
  console.log('update');
  if (_data.time.running && _data.time.started) {
    var secondsElapsed = Math.floor((Date.now() - _data.time.started) / 1000);
    _data.time.remainingTime = _data.time.lastRemainingTime - secondsElapsed;
  }
  var minutes = 0;
  var seconds = 0;
  if (_data.time.remainingTime > 0) {
    minutes = Math.floor(_data.time.remainingTime / 60);
    seconds = _data.time.remainingTime - (minutes * 60);
  } else {
    toggleTime(false);
  }

  $('#clock').html(minutes.pad() + ':' + seconds.pad());

  // save current values
  localStorage.setItem('scoreboard.current', JSON.stringify(_data));
}

function toggleTime(newValue) {
  console.log('toggle');
  console.log(_data.time.started);
  console.log(_data.time.remainingTime);
  console.log(_data.time.lastRemainingTime);
  console.log(_data.time.running);
  _data.time.running = newValue !== undefined ? newValue : !_data.time.running;
  console.log(_data.time.running);
  if (!_data.time.running) {
    // stop
    window.clearInterval(_timer);
    _timer = false;
    _data.time.started = 0;
    _data.time.lastRemainingTime = 0;
  } else {
    // start
    _data.time.started = _data.time.started || Date.now();
    _data.time.lastRemainingTime = _data.time.lastRemainingTime || _data.time.remainingTime;
    if (!_timer) {
      _timer = window.setInterval(updateTime, 100);
    }
  }

  $('.clock-indicator.running').toggle(_data.time.running);
  $('.clock-indicator.not-running').toggle(!_data.time.running);

  // save current values
  localStorage.setItem('scoreboard.current', JSON.stringify(_data));
}

function updateView() {
  $('#score_home').val(_data.home.score);
  $('#score_guest').val(_data.guest.score);

  $('#name_home').html(_init.home.name || 'HOME');
  $('#name_guest').html(_init.guest.name || 'GUEST');

  // save current values
  localStorage.setItem('scoreboard.current', JSON.stringify(_data));
}

function init() {
  var current = JSON.parse(localStorage.getItem('scoreboard.current') || '{}');
  _data = $.extend(true, {}, _init, current);
  if (_data.time.remainingTime === -1) {
    _data.time.remainingTime = _init.time.periodTime;
  }
}

// Initialization
init();
updateView();
toggleTime(_data.time.running);
updateTime();

// bind events
$(document).on('keyup', 'body', handleKeypress);
$(document).on('click', '#resetTime, #resetScores, #resetAll', handleReset);