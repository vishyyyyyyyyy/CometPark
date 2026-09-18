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

const lots = [
    ['PS1', 'high', 'Not many students show up at this time! A safe choice ~'],
    ['PS3', 'low', 'Pretty full around this time'],
    ['PS4', 'moderate', 'High turnover time - some students heading out to lunch'],
    ['Lot H', 'moderate', 'High turnover time - some students heading out to lunch'],
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

function createSpotCard([lotName, availability, note]) {
    const card = document.createElement('article');
    const head = document.createElement('div');
    const title = document.createElement('h3');
    const mapsButton = document.createElement('button');
    const badge = document.createElement('span');
    const noteText = document.createElement('p');

    card.className = 'spot-card';
    head.className = 'spot-card-head';
    title.textContent = lotName;
    mapsButton.className = 'maps-button';
    mapsButton.type = 'button';
    mapsButton.textContent = 'Open Maps →';
    badge.className = `availability ${availability}`;
    badge.textContent = availabilityLabels[availability];
    noteText.className = 'spot-note';
    noteText.textContent = note;

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
        .filter(([lotName, availability]) => !top.some(([topName]) => topName === lotName) && availability === 'high')
        .slice(0, 3);

    topSpots.replaceChildren(...top.map(createSpotCard));
    alternativeSpots.replaceChildren(...alternatives.map(createSpotCard));

    lots.forEach(([lotName]) => {
        const option = document.createElement('option');
        option.value = lotName;
        option.textContent = lotName;
        lotPicker.append(option);
    });
}

function openFeedback(lotName) {
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
    if (lotPicker.value) openFeedback(lotPicker.value);
});

renderSpots();
