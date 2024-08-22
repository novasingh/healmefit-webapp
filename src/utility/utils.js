export function isTokenExpired(token) {
    if (!token) {
        return true;
    }
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp < currentTime;
}
function normalize(value, minVal, maxVal) {
    return (value - minVal) / (maxVal - minVal);
}

export function calculateHealthScore(age, bmi, heartRate, steps, sleep) {
    // Normalization
    const normalizedAge = normalize(age, 20, 80);
    const normalizedBmi = normalize(bmi, 15, 40);
    const normalizedHeartRate = normalize(heartRate, 40, 100);
    const normalizedSteps = normalize(steps, 0, 20000);
    const normalizedSleep = normalize(sleep, 4, 10);

    // Weights
    const weightAge = 0.2;
    const weightBmi = 0.2;
    const weightHeartRate = 0.2;
    const weightSteps = 0.2;
    const weightSleep = 0.2;

    // Health Score Calculation
    const healthScore = (
        (weightAge * normalizedAge) +
        (weightBmi * normalizedBmi) +
        (weightHeartRate * normalizedHeartRate) +
        (weightSteps * normalizedSteps) +
        (weightSleep * normalizedSleep)
    );

    return healthScore;
}

export function calculateBMI(weightKg, heightCM) {
    const heightM = heightCM / 100;
    const bmi = weightKg / (heightM * heightM);
    return bmi.toFixed(2); 
}

export function calculateSleepPercentage(minutesSlept) {
    const hoursSlept = minutesSlept / 60;
    
    const maxSleepHours = 9;
    const minSleepHours = 1;
    
    let percentage;

    if (hoursSlept >= maxSleepHours) {
        percentage = 100;
    } else if (hoursSlept >= minSleepHours) {
        percentage = 90 + (100 - 90) * ((hoursSlept - minSleepHours) / (maxSleepHours - minSleepHours));
    } else {
        percentage = 0;
    }
    
    return percentage.toFixed(2);
}

export const convertDecimalHours = (totalSleep) => {
    const hours = Math.floor(totalSleep / 60);
    const minutes = totalSleep % 60;
    const decimalHours = `${hours}.${minutes}`;
    const hoursSleep = Math.floor(decimalHours);
    const minutesSleep = Math.round((decimalHours - hoursSleep) * 60);
    return `${hoursSleep}hr ${minutesSleep}min`;
  };
