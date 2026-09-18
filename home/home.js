const preferences = JSON.parse(localStorage.getItem('cometParkPreferences') || '{}');
const selectedLots = Array.isArray(preferences.parkingChoices) ? preferences.parkingChoices : [];
const topSpots = document.querySelector('#top-spots');
const alternativeSpots = document.querySelector('#alternative-spots');
const lotPicker = document.querySelector('#lot-picker');
const feedbackBackdrop = document.querySelector('.feedback-backdrop');
const feedbackClose = document.querySelector('.feedback-close');
const feedbackLot = document.querySelector('.feedback-lot');
const easeQuestion = document.querySelector('.ease-question');
const celebration = document.querySelector('.celebration');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const dropdownMenu = document.querySelector('.dropdown-menu');
const preferencesButton = document.querySelector('.preferences-button');
const arrivalButtons = document.querySelectorAll('.arrival-tabs button');
const homeLoading = document.querySelector('.home-loading');
const homeLoadingImage = document.querySelector('.home-loading-image');
let parkingAvailability = {};
let selectedTimeSlot = document.querySelector('.arrival-tabs .is-active').textContent.trim();
let activeFeedback = null;

const feedbackStorageKey = 'cometParkLotFeedback';
const savedFeedback = JSON.parse(localStorage.getItem(feedbackStorageKey) || '[]');

const loadingFromOnboarding = sessionStorage.getItem('cometParkLoadingFromOnboarding') === 'true';
const temocFrames = ['../assets/temoc1.png', '../assets/temoc2.png'];
let temocFrameIndex = 0;
let temocAnimation;

if (loadingFromOnboarding) {
  homeLoading.hidden = false;
  temocAnimation = window.setInterval(() => {
    temocFrameIndex = (temocFrameIndex + 1) % temocFrames.length;
    homeLoadingImage.src = temocFrames[temocFrameIndex];
  }, 500);
  sessionStorage.removeItem('cometParkLoadingFromOnboarding');
}

function finishHomeLoading() {
  if (!loadingFromOnboarding) return;

  window.clearInterval(temocAnimation);
  homeLoading.hidden = true;
}

const observedAvailability = {
  '8-10': {
    'Lot H': {
      gold: { availability: 'moderate', note: 'A couple of Gold spots may be available' },
      orange: { availability: 'high', note: 'lots of spots available!!' }
    },
    'Visitor Center': { availability: 'low', note: 'Usually full around this time' },
    'Lot A': {
      gold: { availability: 'high', note: 'About 70% Gold availability reported' },
      green: { availability: 'high', note: 'About 50% Green availability reported' },
      orange: { availability: 'moderate', note: 'About 40% Orange availability reported' }
    }
  },
  '10-12': {
  },
  '12-2': {
    'Lot H': { availability: 'low', note: 'Mostly full, but turnover may open a spot around lunch' },
    'Lot A': { availability: 'moderate', note: 'Mid turnover with a good amount of Orange availability' }
  },
  '2-4': {
    'Lot H': {
      gold: { availability: 'low', note: 'A couple of Gold spots may be available' },
      orange: { availability: 'low', note: 'Orange is usually full around this time' }
    }
  },
  '4-6': {
    'Lot H': {
      gold: { availability: 'low', note: 'A few Gold spots may be available' },
      orange: { availability: 'moderate', note: 'Some Orange spots may be available' }
    },
    'ECS lot': { orange: { availability: 'moderate', note: 'About 20 Orange spots reported' } }
  },
  '6-8': {
    'Lot H': {
      gold: { availability: 'high', note: 'About 70% Gold availability reported' },
      orange: { availability: 'high', note: 'About 80% Orange availability reported' }
    }
  }
};

const lots = [
    ['PS1', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['PS3', 'low', 'Pretty full around this time'],
    ['PS4', 'moderate', 'High turnover time - some students heading out to lunch'],
    ['Lot H', 'moderate', 'High turnover time - some students heading out to lunch'],
    ['Lot A', 'moderate', 'Mid turnover around this time'],
    ['Visitor Center', 'low', 'Availability varies by time'],
    ['ECS lot', 'moderate', 'Availability varies by time'],
    ['Lot I', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot J', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot F', 'moderate', 'Some spaces usually open during this window'],
    ['Lot M north', 'high', 'A safe choice for early arrivals'],
    ['Lot M east', 'moderate', 'Steady turnover around this time'],
    ['Lot M south', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot M southeast 1', 'high', 'A safe choice for early arrivals'],
    ['Lot M southeast 2', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot U', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot A1', 'moderate', 'Some spaces usually open during this window'],
    ['Lot B1', 'moderate', 'Steady turnover around this time'],
    ['Lot A2 + B2', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot C1', 'moderate', 'High turnover time - some students heading out to lunch'],
    ['Lot C2', 'high', 'A safe choice for early arrivals'],
    ['Lot D', 'moderate', 'Steady turnover around this time'],
    ['Lot S', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot N', 'high', 'A safe choice for early arrivals'],
    ['Lot P', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot T1', 'moderate', 'Steady turnover around this time'],
    ['Lot T3', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['SPN lot', 'high', 'A safe choice for early arrivals'],
    ['Lot W', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['Lot V', 'high', 'Not many students show up at this time! A safe choice ~']
];

const availabilityLabels = {
    high: 'High Availability',
    moderate: 'Moderate Availability',
    low: 'Low Availability'
};

function mapsUrl(lotName) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lotName}, The University of Texas at Dallas`)}`;
}

function normalizePermitType(permitType) {
  return permitType
    .replace(/permit/gi, '')
    .replace(/pay[- ]by[- ]space/gi, 'Pay by space')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function getAvailabilityData(lotName, fallbackAvailability, fallbackNote) {
  const lotData = parkingAvailability[lotName];
  const availableSpaces = lotData?.[normalizePermitType(preferences.permit || '')];

  let availabilityData;
  if (Number.isFinite(availableSpaces)) {
    if (availableSpaces >= 30) 
    {
      availabilityData = { availability: 'high', note: 'Many spots avail!' };
    } 
    else if (availableSpaces >= 15) 
    {
      availabilityData = { availability: 'moderate', note: 'Couple spots up for grabs' };
    } 
    else 
    {
      availabilityData = { availability: 'low', note: 'Very few spots at this time' };
    }
  } 
  else 
    {
        const timeData = observedAvailability[selectedTimeSlot]?.[lotName];
        const permitData = timeData?.[normalizePermitType(preferences.permit || '')] || timeData?.default;
        availabilityData = permitData || { availability: fallbackAvailability, note: fallbackNote };
  }

  const feedbackScore = savedFeedback
    .filter(({ lotName: feedbackLotName, timeSlot }) => feedbackLotName === lotName && timeSlot === selectedTimeSlot)
    .reduce((score, { parked }) => score + (parked ? 1 : -1), 0);
  const availabilityLevels = ['low', 'moderate', 'high'];
  const currentLevel = availabilityLevels.indexOf(availabilityData.availability);
  const adjustedLevel = Math.max(0, Math.min(availabilityLevels.length - 1, currentLevel + Math.sign(feedbackScore)));

  return {
    availability: availabilityLevels[adjustedLevel],
    note: feedbackScore ? `${availabilityData.note} Updated by student feedback.` : availabilityData.note
  };
}

function createSpotCard([lotName, availability, note]) {
    const card = document.createElement('article');
    const head = document.createElement('div');
    const title = document.createElement('h3');
    const mapsButton = document.createElement('button');
    const badge = document.createElement('span');
    const noteText = document.createElement('p');
    const availabilityData = getAvailabilityData(lotName, availability, note);

    card.className = 'spot-card';
    head.className = 'spot-card-head';
    title.textContent = lotName;
    mapsButton.className = 'maps-button';
    mapsButton.type = 'button';
    mapsButton.textContent = 'Open Maps →';
    badge.className = `availability ${availabilityData.availability}`;
    badge.textContent = availabilityLabels[availabilityData.availability];
    noteText.className = 'spot-note';
    noteText.textContent = availabilityData.note;

    mapsButton.addEventListener('click', () => {
        window.open(mapsUrl(lotName), '_blank', 'noopener,noreferrer');
        openFeedback(lotName);
    });

    head.append(title, mapsButton);
    card.append(head, badge, noteText);
    return card;
}

function renderSpots() {
    const topLotData = selectedLots
        .map((lotName) => lots.find((lot) => lot[0] === lotName))
        .filter(Boolean);
    const fallbackTop = lots.filter((lot) => !topLotData.some(([name]) => name === lot[0])).slice(0, 3);
    const top = [...topLotData, ...fallbackTop].slice(0, 3);
    const alternatives = lots
        .filter((lot) => {
            const [lotName] = lot;
            return !top.some(([topName]) => topName === lotName)
                && getAvailabilityData(...lot).availability === 'high';
        })
        .slice(0, 3);

    topSpots.replaceChildren(...top.map(createSpotCard));
    alternativeSpots.replaceChildren(...alternatives.map(createSpotCard));

    lotPicker.replaceChildren(new Option('Select Lot', ''));
    lots.forEach(([lotName]) => {
        const option = document.createElement('option');
        option.value = lotName;
        option.textContent = lotName;
        lotPicker.append(option);
    });
}

function openFeedback(lotName) {
  activeFeedback = { lotName, timeSlot: selectedTimeSlot };
    feedbackLot.textContent = lotName;
    feedbackBackdrop.hidden = false;
    easeQuestion.hidden = true;
}

function closeFeedback() {
    feedbackBackdrop.hidden = true;
}

function showCelebration() {
    celebration.replaceChildren();
    for (let index = 0; index < 28; index += 1) {
        const piece = document.createElement('span');
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * .4}s`;
        piece.style.transform = `rotate(${Math.random() * 90}deg)`;
        celebration.append(piece);
    }
    celebration.classList.add('is-visible');
    window.setTimeout(() => celebration.classList.remove('is-visible'), 1600);
}

feedbackClose.addEventListener('click', closeFeedback);
feedbackBackdrop.addEventListener('click', (event) => {
    if (event.target === feedbackBackdrop) closeFeedback();
});

document.querySelectorAll('[data-feedback="parked-yes"], [data-feedback="parked-no"]').forEach((button) => {
    button.addEventListener('click', () => {
    const parked = button.dataset.feedback === 'parked-yes';

    if (activeFeedback) {
      savedFeedback.push({ ...activeFeedback, parked });
      localStorage.setItem(feedbackStorageKey, JSON.stringify(savedFeedback));
    }

    if (!parked) {
      closeFeedback();
      showCelebration();
      return;
    }

        easeQuestion.hidden = false;
    });
});

document.querySelectorAll('[data-feedback^="easy-"]').forEach((button) => {
    button.addEventListener('click', () => {
        closeFeedback();
        showCelebration();
    });
});

lotPicker.addEventListener('change', () => {
  if (lotPicker.value) {
    window.open(mapsUrl(lotPicker.value), '_blank', 'noopener,noreferrer');
    openFeedback(lotPicker.value);
  }
});

const pageToScrape =
  "https://services.utdallas.edu/transit/garages/_code.php";

const parkingStructures = [
  "Parking Structure 1",
  "Parking Structure 3",
  "Parking Structure 4"
];

const parkingStructuresShort = ["PS1", "PS3", "PS4"];

dropdownToggle.addEventListener('click', () => {
  const isOpen = dropdownToggle.getAttribute('aria-expanded') === 'true';
  dropdownToggle.setAttribute('aria-expanded', String(!isOpen));
  dropdownMenu.hidden = isOpen;
});

preferencesButton.addEventListener('click', () => {
  window.location.href = '../onboarding/onboarding.html';
});

arrivalButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectedTimeSlot = button.textContent.trim();
    arrivalButtons.forEach((arrivalButton) => arrivalButton.classList.remove('is-active'));
    button.classList.add('is-active');
    renderSpots();
  });
});

async function getParkingData() {
  try {
    const response = await fetch(pageToScrape);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const html = await response.text();

    // Turn the downloaded HTML into a document we can search
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const finalList = [];

    parkingStructures.forEach((structure, index) => {
      const jsonObj = {
        structure: structure,
        shortName: parkingStructuresShort[index]
      };

      // Find the table for this parking structure
      const table = [...doc.querySelectorAll("table")].find(table => {
        return table.getAttribute("summary") === structure;
      });

      if (!table) {
        console.log(`Couldn't find ${structure}`);
        return;
      }

      // Get every row in the table
      const rows = table.querySelectorAll("tbody tr");

      rows.forEach(row => {
        const cells = row.querySelectorAll("td");

        if (cells.length >= 4) {
          // Based on the structure of the UTD table
          const permitType = normalizePermitType(cells[1].textContent);
          const availableSpaces = cells[3].textContent.trim();

          const number = parseInt(availableSpaces, 10);

          if (!Number.isNaN(number)) {
            jsonObj[permitType] = (jsonObj[permitType] || 0) + number;
          }
        }
      });

      finalList.push(jsonObj);
    });

    parkingAvailability = finalList.reduce((availabilityByLot, lotData) => {
      availabilityByLot[lotData.shortName] = lotData;
      return availabilityByLot;
    }, {});

  } catch (error) {
    console.error("Error getting parking data:", error);
  } finally {
    renderSpots();
    finishHomeLoading();
  }
}

getParkingData();
