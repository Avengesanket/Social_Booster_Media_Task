const API_BASE = window.location.origin;

// City autocomplete suggestions
const cityInput = document.getElementById('city');
const suggestionsBox = document.getElementById('suggestions');
let timeout = null;

if (cityInput) {
  cityInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(timeout);
    
    if (!query) {
      suggestionsBox.innerHTML = '';
      return;
    }
    
    timeout = setTimeout(() => {
      fetch(`${API_BASE}/api/citytemps/by_city/?name=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
          if (data.length === 0) {
            suggestionsBox.innerHTML = '<div class="sugg" style="color: #999;">No matching cities found</div>';
            return;
          }
          
          suggestionsBox.innerHTML = data.map(item => 
            `<div class="sugg" data-city="${item.city_name}" data-temp="${item.temperature}">
              ${item.city_name} — ${item.temperature !== null ? item.temperature + '°C' : 'N/A'}
            </div>`
          ).join('');
          
          document.querySelectorAll('.sugg').forEach(el => {
            el.addEventListener('click', () => {
              const selectedCity = el.dataset.city;
              const temp = el.dataset.temp;
              
              cityInput.value = selectedCity;
              suggestionsBox.innerHTML = '';
              
              // Fetch latest weather data
              fetchWeatherData(selectedCity);
            });
          });
        })
        .catch(error => {
          console.error('Error fetching suggestions:', error);
          suggestionsBox.innerHTML = '<div class="sugg" style="color: #dc3545;">Error loading suggestions</div>';
        });
    }, 300);
  });
  
  // Close suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (!cityInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.innerHTML = '';
    }
  });
}

// Fetch weather data from API
function fetchWeatherData(city) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerText = 'Fetching weather data...';
  resultDiv.style.background = '#fff3cd';
  resultDiv.style.borderLeftColor = '#ffc107';
  
  fetch(`${API_BASE}/fetch_weather/?city=${encodeURIComponent(city)}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        resultDiv.innerText = `Error: ${data.error}`;
        resultDiv.style.background = '#f8d7da';
        resultDiv.style.borderLeftColor = '#dc3545';
      } else {
        document.getElementById('temp').value = data.temperature !== null ? data.temperature : '';
        resultDiv.innerText = `✅ Fetched: ${data.city_name} - ${data.temperature}°C`;
        resultDiv.style.background = '#d4edda';
        resultDiv.style.borderLeftColor = '#28a745';
      }
    })
    .catch(error => {
      console.error('Fetch weather error:', error);
      resultDiv.innerText = '❌ Failed to fetch weather data';
      resultDiv.style.background = '#f8d7da';
      resultDiv.style.borderLeftColor = '#dc3545';
    });
}

// Fetch weather button
const fetchBtn = document.getElementById('fetchBtn');
if (fetchBtn) {
  fetchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (!city) {
      alert('Please enter a city name');
      return;
    }
    fetchWeatherData(city);
  });
}

// Submit form - save or update city
const form = document.getElementById('cityForm');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const city = cityInput.value.trim();
    const tempValue = document.getElementById('temp').value;
    const temperature = tempValue === '' ? null : parseFloat(tempValue);
    
    if (!city) {
      alert('Please provide a city name');
      return;
    }
    
    const resultDiv = document.getElementById('result');
    resultDiv.innerText = 'Saving...';
    resultDiv.style.background = '#e7f3ff';
    resultDiv.style.borderLeftColor = '#667eea';
    
    // Check if city exists
    fetch(`${API_BASE}/api/citytemps/?search=${encodeURIComponent(city)}`)
      .then(response => response.json())
      .then(list => {
        const existing = list.find(item => 
          item.city_name.toLowerCase() === city.toLowerCase()
        );
        
        if (existing) {
          // Update existing
          return fetch(`${API_BASE}/api/citytemps/${existing.id}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              city_name: city, 
              temperature: temperature 
            })
          })
          .then(response => response.json())
          .then(data => {
            resultDiv.innerText = `✅ Updated: ${data.city_name} - ${data.temperature}°C`;
            resultDiv.style.background = '#d4edda';
            resultDiv.style.borderLeftColor = '#28a745';
          });
        } else {
          // Create new
          return fetch(`${API_BASE}/api/citytemps/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              city_name: city, 
              temperature: temperature 
            })
          })
          .then(response => response.json())
          .then(data => {
            resultDiv.innerText = `✅ Saved: ${data.city_name} - ${data.temperature}°C`;
            resultDiv.style.background = '#d4edda';
            resultDiv.style.borderLeftColor = '#28a745';
          });
        }
      })
      .catch(error => {
        console.error('Save error:', error);
        resultDiv.innerText = '❌ Failed to save data';
        resultDiv.style.background = '#f8d7da';
        resultDiv.style.borderLeftColor = '#dc3545';
      });
  });
}

// Dashboard functionality
function loadRecords() {
  fetch(`${API_BASE}/api/citytemps/`)
    .then(response => response.json())
    .then(data => {
      const tbody = document.querySelector('#records tbody');
      if (!tbody) return;
      
      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #999;">No records found. Add some cities from the Home page!</td></tr>';
        return;
      }
      
      tbody.innerHTML = data.map(record => `
        <tr>
          <td>${record.id}</td>
          <td>${record.city_name}</td>
          <td>${record.temperature !== null ? record.temperature + '°C' : 'N/A'}</td>
          <td>${new Date(record.updated_at).toLocaleString()}</td>
          <td>
            <button onclick="deleteRecord(${record.id})">Delete</button>
            <button onclick="editRecord(${record.id}, '${record.city_name.replace(/'/g, "\\'")}', ${record.temperature})">Edit</button>
          </td>
        </tr>
      `).join('');
      
      // Visualize last 20 records
      const slice = data.slice(0, 20);
      const labels = slice.map(x => x.city_name).reverse();
      const temps = slice.map(x => x.temperature !== null ? x.temperature : 0).reverse();
      renderChart(labels, temps);
      
      // Generate report
      generateReport(data);
    })
    .catch(error => {
      console.error('Load records error:', error);
      const tbody = document.querySelector('#records tbody');
      if (tbody) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #dc3545;">Error loading data</td></tr>';
      }
    });
}

function deleteRecord(id) {
  if (!confirm(`Delete record ${id}?`)) return;
  
  fetch(`${API_BASE}/api/citytemps/${id}/`, { method: 'DELETE' })
    .then(() => {
      loadRecords();
      alert('Record deleted successfully');
    })
    .catch(error => {
      console.error('Delete error:', error);
      alert('Failed to delete record');
    });
}

function editRecord(id, city, temp) {
  const newTemp = prompt(`Enter new temperature for ${city}:`, temp !== null ? temp : '');
  if (newTemp === null) return;
  
  const temperature = newTemp === '' ? null : parseFloat(newTemp);
  
  fetch(`${API_BASE}/api/citytemps/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      city_name: city, 
      temperature: temperature 
    })
  })
  .then(() => {
    loadRecords();
    alert('Record updated successfully');
  })
  .catch(error => {
    console.error('Update error:', error);
    alert('Failed to update record');
  });
}

let chartInstance = null;

function renderChart(labels, values) {
  const canvas = document.getElementById('tempChart');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  
  if (chartInstance) {
    chartInstance.destroy();
  }
  
  chartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Temperature (°C)',
        data: values,
        backgroundColor: 'rgba(102, 126, 234, 0.6)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Temperature (°C)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Cities'
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.y + '°C';
            }
          }
        }
      }
    }
  });
}

function generateReport(data) {
  const reportSection = document.getElementById('reportSection');
  if (!reportSection) return;
  
  const totalRecords = data.length;
  const validTemps = data.filter(d => d.temperature !== null).map(d => d.temperature);
  
  if (validTemps.length === 0) {
    reportSection.innerHTML = '<p>No temperature data available for analysis.</p>';
    return;
  }
  
  const avgTemp = (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(2);
  const maxTemp = Math.max(...validTemps).toFixed(2);
  const minTemp = Math.min(...validTemps).toFixed(2);
  
  const hottestCity = data.find(d => d.temperature === parseFloat(maxTemp));
  const coldestCity = data.find(d => d.temperature === parseFloat(minTemp));
  
  reportSection.innerHTML = `
    <p><strong>Total Cities:</strong> ${totalRecords}</p>
    <p><strong>Cities with Temperature Data:</strong> ${validTemps.length}</p>
    <p><strong>Average Temperature:</strong> ${avgTemp}°C</p>
    <p><strong>Highest Temperature:</strong> ${maxTemp}°C (${hottestCity ? hottestCity.city_name : 'N/A'})</p>
    <p><strong>Lowest Temperature:</strong> ${minTemp}°C (${coldestCity ? coldestCity.city_name : 'N/A'})</p>
  `;
}

// Auto-load dashboard on page load
const refreshBtn = document.getElementById('refreshBtn');
if (refreshBtn) {
  refreshBtn.addEventListener('click', loadRecords);
  loadRecords();
}