document.addEventListener('DOMContentLoaded', function () {
  const startBtn = document.getElementById('start-timer');
  const stopBtn = document.getElementById('stop-timer');
  const logManualBtn = document.getElementById('log-manual-entry');
  const manualToggleBtn = document.getElementById('manual-entry-toggle');
  const timerForm = document.getElementById('timer-form');
  const manualForm = document.getElementById('manual-entry-form');
  const logList = document.getElementById('log-list');
  const analyticsChart = document.getElementById('analytics-chart');
  const showTrackerBtn = document.getElementById('show-tracker');
  const showAnalyticsBtn = document.getElementById('show-analytics');
  const timerClock = document.getElementById('timer-clock');
  const detailedLogList = document.getElementById('detailed-log-list');
  let startTime, endTime, timerInterval;
  let elapsedTime = 0;
  let timerDisplay = document.getElementById('timer-display');

  showTrackerBtn.addEventListener('click', function () {
      document.getElementById('tracker').classList.remove('hidden');
      document.getElementById('logs').classList.remove('hidden');
      document.getElementById('analytics').classList.add('hidden');
  });

  showAnalyticsBtn.addEventListener('click', function () {
      document.getElementById('tracker').classList.add('hidden');
      document.getElementById('logs').classList.add('hidden');
      document.getElementById('analytics').classList.remove('hidden');
      renderAnalytics();
  });

  startBtn.addEventListener('click', function () {
      startTime = new Date();
      elapsedTime = 0;
      timerClock.classList.remove('hidden');
      timerForm.classList.remove('hidden');
      startBtn.classList.add('hidden');
      updateTimer();
      timerInterval = setInterval(updateTimer, 1000);
  });

  stopBtn.addEventListener('click', function () {
      endTime = new Date();
      const taskDesc = document.getElementById('timer-name').value;
      const timerName = document.getElementById('timer-name').value || 'Unnamed Session';
      logSession(taskDesc, startTime, endTime, timerName);
      resetTimer();
  });

  logManualBtn.addEventListener('click', function () {
      const taskDesc = document.getElementById('manual-task-desc').value;
      const startTime = new Date(document.getElementById('start-time').value).getTime();
      const endTime = new Date(document.getElementById('end-time').value).getTime();
      const timerName = document.getElementById('timer-name').value || 'Manual Entry';
      if (taskDesc && startTime && endTime) {
          logSession(taskDesc, startTime, endTime, timerName);
          document.getElementById('manual-task-desc').value = '';
          document.getElementById('start-time').value = '';
          document.getElementById('end-time').value = '';
      }
  });

  manualToggleBtn.addEventListener('click', function () {
      manualForm.classList.toggle('hidden');
  });

  function updateTimer() {
      const now = new Date();
      elapsedTime = Math.floor((now - startTime) / 1000);
      timerDisplay.textContent = formatTime(elapsedTime);
  }

  function formatTime(seconds) {
      const hours = String(Math.floor(seconds / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
      const secs = String(seconds % 60).padStart(2, '0');
      return `${hours}:${minutes}:${secs}`;
  }

  function resetTimer() {
      clearInterval(timerInterval);
      timerClock.classList.add('hidden');
      timerForm.classList.add('hidden');
      startBtn.classList.remove('hidden');
      renderLogs();
  }

  function logSession(taskDesc, startTime, endTime, timerName) {
      const logs = getLogs();
      const duration = endTime - startTime;
      logs.push({ taskDesc, startTime, endTime, duration, timerName });
      localStorage.setItem('logs', JSON.stringify(logs));
  }

  function getLogs() {
      return JSON.parse(localStorage.getItem('logs')) || [];
  }

  function renderLogs() {
      const logs = getLogs();
      logList.innerHTML = '';
      logs.forEach((log, index) => {
          const li = document.createElement('li');
          li.innerHTML = `
              <div>
                  <strong>${log.timerName}</strong><br>
                  ${log.taskDesc}<br>
                  ${new Date(log.startTime).toLocaleString()} - ${new Date(log.endTime).toLocaleString()}<br>
                  Duration: ${formatTime(log.duration / 1000)}
              </div>
              <button class="delete-log" data-index="${index}">Delete</button>
          `;
          logList.appendChild(li);
      });
      document.querySelectorAll('.delete-log').forEach(button => {
          button.addEventListener('click', function () {
              const index = this.getAttribute('data-index');
              deleteLog(index);
          });
      });
  }

  function deleteLog(index) {
      const logs = getLogs();
      logs.splice(index, 1);
      localStorage.setItem('logs', JSON.stringify(logs));
      renderLogs();
  }

  function renderAnalytics() {
      const logs = getLogs();
      const ctx = analyticsChart.getContext('2d');
      const data = logs.reduce((acc, log) => {
          const date = new Date(log.startTime).toLocaleDateString();
          const duration = Math.floor(log.duration / 60000);
          if (!acc[date]) {
              acc[date] = 0;
          }
          acc[date] += duration;
          return acc;
      }, {});

      new Chart(ctx, {
          type: 'bar',
          data: {
              labels: Object.keys(data),
              datasets: [{
                  label: 'Time Spent (minutes)',
                  data: Object.values(data),
                  backgroundColor: 'rgba(75, 192, 192, 0.2)',
                  borderColor: 'rgba(75, 192, 192, 1)',
                  borderWidth: 1
              }]
          },
          options: {
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Date'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: 'Minutes'
                      }
                  }
              }
          }
      });

      renderDetailedLogs();
  }

  function renderDetailedLogs() {
      const logs = getLogs();
      detailedLogList.innerHTML = '';
      logs.forEach((log) => {
          const li = document.createElement('li');
          li.innerHTML = `
              <strong>${log.timerName}</strong><br>
              Task: ${log.taskDesc}<br>
              Start Time: ${new Date(log.startTime).toLocaleString()}<br>
              End Time: ${new Date(log.endTime).toLocaleString()}<br>
              Duration: ${formatTime(log.duration / 1000)}<br><br>
          `;
          detailedLogList.appendChild(li);
      });
      document.getElementById('analytics-details').classList.remove('hidden');
  }

  renderLogs();
});
