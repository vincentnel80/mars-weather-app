const API_URL = 'https://mars.nasa.gov/rss/api/?feed=weather&category=mars2020&feedtype=json'

const currentSolElement = document.querySelector('[data-current-sol]')
const currentDateElement = document.querySelector('[data-current-date]')
const currentSeasonElement = document.querySelector('[data-current-season]')
const currentTempHighElement = document.querySelector('[data-current-temp-high]')
const currentTempLowElement = document.querySelector('[data-current-temp-low]')
const atPressureElement = document.querySelector('[data-at-pressure]')
const windDirectionText = document.querySelector('[data-wind-direction-text]')
const windDirectionArrow = document.querySelector('[data-wind-direction-arrow]')

const previousSolTemplate = document.querySelector('[data-previous-sol-template]')
const previousSolContainer = document.querySelector('[data-previous-sols]')

const previousWeatherToggle = document.querySelector('[data-previous-weather-toggle]')
const previousWeatherContainer = document.querySelector('[data-previous-weather-container]')

const unitToggle = document.querySelector('[data-unit-toggle]')

let selectedSolIndex
let metricUnits = unitToggle.getAttribute('aria-checked') !== 'true'

previousWeatherToggle.addEventListener('change', () => {
  previousWeatherContainer.classList.toggle('show-weather')
})

getWeather().then(sols => {
  selectedSolIndex = sols.length - 1
  displayPreviousSols(sols)
  displaySelectedSol(sols)

  unitToggle.addEventListener('click', () => {
    metricUnits = !metricUnits
    const label = metricUnits ? "celsius" : "fahrenheit"
    unitToggle.setAttribute('aria-checked', !metricUnits)
    unitToggle.setAttribute('aria-label', label)
    displaySols(sols)
    updateUnits()
  })
})

function getWeather() {
  return fetch(API_URL)
    .then(res => res.json())
    .then(resData => {
      const {
        sol_keys,
        validity_checks,
        ...solData
       } = resData

       solData.sols.forEach(function(message, index) {
        console.log('message index '+ index);
        Object.keys(message).forEach(function(prop) {    
            console.log(prop + " = " + message[prop]);
        });
    });

    return Object.entries(solData.sols).map(([sol, data]) => {
      return {
        sol:data.sol,
        maxTemp: data.max_temp,
        minTemp: data.min_temp,
        atPressure: data.pressure,
        season: data.season,
        date: data.terrestrial_date
      }
    })
  })
}

function displaySols(sols) {
  displaySelectedSol(sols)
  displayPreviousSols(sols)
}

function displaySelectedSol(sols) {
  const selectedSol = sols[selectedSolIndex]
  currentSolElement.innerText = selectedSol.sol
  currentDateElement.innerText = displayDate(selectedSol.date)
  currentSeasonElement.innerText = displayDate(selectedSol.season)
  currentTempHighElement.innerText = displayTemperature(selectedSol.maxTemp)
  currentTempLowElement.innerText = displayTemperature(selectedSol.minTemp)
  atPressureElement.innerText = displayAtPressure(selectedSol.atPressure)
  windDirectionText.innerText = selectedSol.windDirectionCardinal
  windDirectionArrow.style.setProperty('--direction', `${selectedSol.windDirectionDegrees}deg`)
}

function displayPreviousSols(sols) {
  previousSolContainer.innerHTML = ''
  sols.forEach((solData, index) => {
    const solContainer = previousSolTemplate.content.cloneNode(true)
    solContainer.querySelector('[data-sol]').innerText = solData.sol
    solContainer.querySelector('[data-date]').innerText = displayDate(solData.date)
    solContainer.querySelector('[data-temp-high]').innerText = displayTemperature(solData.maxTemp)
    solContainer.querySelector('[data-temp-low]').innerText = displayTemperature(solData.minTemp)
    solContainer.querySelector('[data-select-button]').addEventListener('click', () => {
      selectedSolIndex = index
      displaySelectedSol(sols)
    })
    previousSolContainer.appendChild(solContainer)
  })
}

function displayDate(date) {
  return date
}

function displayTemperature(temperature) {
  let returnTemp = temperature
  returnTemp = temperature
  if (!metricUnits) {
    returnTemp = temperature * (9 / 5) + 32;
  }

  return Math.round(returnTemp)
}

function displayAtPressure(pressure) {
  let returnAtPressure = pressure

  return Math.round(returnAtPressure)
}

function updateUnits() {
  const tempUnits = document.querySelectorAll('[data-temp-unit]')
  tempUnits.forEach(unit => unit.innerText = metricUnits ? 'C' : 'F')
}