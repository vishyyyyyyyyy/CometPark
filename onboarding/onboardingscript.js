const questionOne = document.querySelector('.question-one');
const questionTwo = document.querySelector('.question-two');
const permitChoices = document.querySelectorAll('.permit-choice');
const backButton = document.querySelector('.back-button');
const nextButton = document.querySelector('.next-button');
const locationList = document.querySelector('.location-list');
let selectedPermit = '';

const lotPermits = [
    ['PS1', ['Pay by space', 'Purple', 'Orange', 'Gold']],
    ['PS3', ['Pay by space', 'Purple', 'Orange', 'Gold']],
    ['PS4', ['Pay by space', 'Purple', 'Orange', 'Gold']],
    ['Lot H', ['Purple', 'Orange', 'Gold']],
    ['Lot I', ['Purple', 'Orange', 'Gold']],
    ['Lot J', ['Purple', 'Orange', 'Gold']],
    ['Lot F', ['Pay by space']],
    ['Lot M north', ['Purple']],
    ['Lot M east', ['Pay by space', 'Purple', 'Orange']],
    ['Lot M south', ['Gold']],
    ['Lot M southeast 1', ['Gold']],
    ['Lot M southeast 2', ['Green']],
    ['Lot U', ['Green']],
    ['Lot A1', ['Purple', 'Orange']],
    ['Lot B1', ['Pay by space', 'Purple', 'Orange']],
    ['Lot A2 + B2', ['Gold', 'Green']],
    ['Lot C1', ['Orange', 'Gold']],
    ['Lot C2', ['Gold']],
    ['Lot D', ['Orange', 'Gold']],
    ['Lot S', ['Purple', 'Orange', 'Gold', 'Green']],
    ['Lot N', ['Purple', 'Orange', 'Gold']],
    ['Lot P', ['Purple', 'Orange', 'Gold']],
    ['Lot T1', ['Orange', 'Gold', 'Green']],
    ['Lot T3', ['Green']],
    ['SPN lot', ['Pay by space', 'Purple', 'Orange', 'Gold', 'Green']],
    ['Lot W', ['Purple', 'Orange', 'Gold', 'Green']],
    ['Lot V', ['Purple', 'Orange', 'Gold', 'Green']]
];

function renderLocations(selectedPermit) {
    const matchingLots = lotPermits.filter(([, permits]) => permits.includes(selectedPermit));
    locationList.replaceChildren();

    if (matchingLots.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.className = 'location-empty';
        emptyMessage.textContent = `No listed parking areas are available for ${selectedPermit}.`;
        locationList.append(emptyMessage);
        return;
    }

    for (let choiceIndex = 0; choiceIndex < 3; choiceIndex += 1) {
        const choice = document.createElement('label');
        const select = document.createElement('select');
        const placeholder = document.createElement('option');

        choice.className = 'location-choice';
        choice.textContent = '';
        select.name = `parking-choice-${choiceIndex + 1}`;
        const ordinal = ['st', 'nd', 'rd'][choiceIndex];
        select.setAttribute('aria-label', `${choiceIndex + 1}${ordinal} parking choice`);

        placeholder.value = '';
        placeholder.textContent = `${choiceIndex + 1}. Select a parking area`;
        placeholder.disabled = true;
        placeholder.selected = true;
        select.append(placeholder);

        matchingLots.forEach(([lotName]) => {
            const option = document.createElement('option');
            option.value = lotName;
            option.textContent = lotName;
            select.append(option);
        });

        select.addEventListener('change', () => {
            const selectedValues = Array.from(locationList.querySelectorAll('select'))
                .map((otherSelect) => otherSelect.value)
                .filter(Boolean);

            locationList.querySelectorAll('select').forEach((otherSelect) => {
                Array.from(otherSelect.options).forEach((option) => {
                    option.hidden = option.value !== otherSelect.value && selectedValues.includes(option.value);
                });
            });
        });

        choice.append(select);
        locationList.append(choice);
    }
}

function showQuestionTwo(event) {
    selectedPermit = event.currentTarget.dataset.permit;
    renderLocations(event.currentTarget.dataset.permit);
    questionOne.hidden = true;
    questionTwo.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

permitChoices.forEach((choice) => {
    choice.addEventListener('click', showQuestionTwo);
});

backButton.addEventListener('click', () => {
    questionTwo.hidden = true;
    questionOne.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

nextButton.addEventListener('click', () => {
    const parkingChoices = Array.from(locationList.querySelectorAll('select'))
        .map((select) => select.value)
        .filter(Boolean);

    localStorage.setItem('cometParkPreferences', JSON.stringify({
        permit: selectedPermit,
        parkingChoices
    }));
    window.location.href = '../home/home.html';
});
