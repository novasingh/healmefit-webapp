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

  export function getHeartRateType(age, heartRate) {
    if (age >= 18 && age <= 25) {
        if (heartRate >= 40 && heartRate <= 52) return `Athlete (40 - 52)`;
        else if (heartRate >= 56 && heartRate <= 61) return `Excellent (56 - 61)`;
        else if (heartRate >= 62 && heartRate <= 65) return `Good (62 - 65)`;
        else if (heartRate >= 66 && heartRate <= 69) return `Above Average (66 - 69)`;
        else if (heartRate >= 70 && heartRate <= 73) return `Average (70 - 73)`;
        else if (heartRate >= 74 && heartRate <= 81) return `Below Average (74 - 81)`;
        else if (heartRate >= 82) return `Poor (82+)`;
    } else if (age >= 26 && age <= 35) {
        if (heartRate >= 44 && heartRate <= 50) return `Athlete (44 - 50)`;
        else if (heartRate >= 55 && heartRate <= 61) return `Excellent (55 - 61)`;
        else if (heartRate >= 62 && heartRate <= 65) return `Good (62 - 65)`;
        else if (heartRate >= 66 && heartRate <= 70) return `Above Average (66 - 70)`;
        else if (heartRate >= 71 && heartRate <= 74) return `Average (71 - 74)`;
        else if (heartRate >= 75 && heartRate <= 81) return `Below Average (75 - 81)`;
        else if (heartRate >= 82) return `Poor (82+)`;
    } else if (age >= 36 && age <= 45) {
        if (heartRate >= 47 && heartRate <= 53) return `Athlete (47 - 53)`;
        else if (heartRate >= 57 && heartRate <= 62) return `Excellent (57 - 62)`;
        else if (heartRate >= 63 && heartRate <= 66) return `Good (63 - 66)`;
        else if (heartRate >= 67 && heartRate <= 70) return `Above Average (67 - 70)`;
        else if (heartRate >= 71 && heartRate <= 75) return `Average (71 - 75)`;
        else if (heartRate >= 76 && heartRate <= 82) return `Below Average (76 - 82)`;
        else if (heartRate >= 83) return `Poor (83+)`;
    } else if (age >= 46 && age <= 55) {
        if (heartRate >= 49 && heartRate <= 54) return `Athlete (49 - 54)`;
        else if (heartRate >= 58 && heartRate <= 63) return `Excellent (58 - 63)`;
        else if (heartRate >= 64 && heartRate <= 67) return `Good (64 - 67)`;
        else if (heartRate >= 68 && heartRate <= 71) return `Above Average (68 - 71)`;
        else if (heartRate >= 72 && heartRate <= 76) return `Average (72 - 76)`;
        else if (heartRate >= 77 && heartRate <= 83) return `Below Average (77 - 83)`;
        else if (heartRate >= 84) return `Poor (84+)`;
    } else if (age >= 56 && age <= 65) {
        if (heartRate >= 51 && heartRate <= 56) return `Athlete (51 - 56)`;
        else if (heartRate >= 57 && heartRate <= 61) return `Excellent (57 - 61)`;
        else if (heartRate >= 62 && heartRate <= 67) return `Good (62 - 67)`;
        else if (heartRate >= 68 && heartRate <= 71) return `Above Average (68 - 71)`;
        else if (heartRate >= 72 && heartRate <= 75) return `Average (72 - 75)`;
        else if (heartRate >= 76 && heartRate <= 81) return `Below Average (76 - 81)`;
        else if (heartRate >= 82) return `Poor (82+)`;
    } else if (age >= 66) {
        if (heartRate >= 52 && heartRate <= 55) return `Athlete (52 - 55)`;
        else if (heartRate >= 56 && heartRate <= 61) return `Excellent (56 - 61)`;
        else if (heartRate >= 62 && heartRate <= 65) return `Good (62 - 65)`;
        else if (heartRate >= 66 && heartRate <= 69) return `Above Average (66 - 69)`;
        else if (heartRate >= 70 && heartRate <= 73) return `Average (70 - 73)`;
        else if (heartRate >= 74 && heartRate <= 79) return `Below Average (74 - 79)`;
        else if (heartRate >= 80) return `Poor (80+)`;
    }

    return "Unknown"; // if age/heartRate doesn't fit into any category
}

export function getWeightStatus(bmi) {
    if (bmi < 18.5) {
        return {
            status: 'Underweight',
            range: '(Below 18.5)',
            color: 'red'
        };
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        return {
            status: 'Great',
            range: '(18.5 - 24.9)',
            color: 'rgb(16, 185, 129)'
        };
    } else if (bmi >= 25 && bmi <= 29.9) {
        return {
            status: 'Overweight',
            range: '(25 - 29.9)',
            color: 'orange'
        };
    } else if (bmi >= 30) {
        return {
            status: 'Obese',
            range: '(30 and above)',
            color: 'red'
        };
    } else {
        return {
            status: 'Unknown',
            range: '',
            color: 'grey'
        };
    }
}

export function getSleepAnalysis(ageInYears, sleepMinutes) {
    const sleepHours = sleepMinutes / 60;

    let recommendedHours;
    if (ageInYears <= 0.25) { // Newborn: 0-3 months
        recommendedHours = { min: 14, max: 17 };
    } else if (ageInYears <= 0.9) { // Infant: 4-11 months
        recommendedHours = { min: 12, max: 15 };
    } else if (ageInYears <= 2) { // Toddler: 1-2 years
        recommendedHours = { min: 11, max: 14 };
    } else if (ageInYears <= 5) { // Preschool: 3-5 years
        recommendedHours = { min: 10, max: 13 };
    } else if (ageInYears <= 13) { // School-age: 6-13 years
        recommendedHours = { min: 9, max: 11 };
    } else if (ageInYears <= 17) { // Teen: 14-17 years
        recommendedHours = { min: 8, max: 10 };
    } else if (ageInYears <= 25) { // Young Adult: 18-25 years
        recommendedHours = { min: 7, max: 9 };
    } else if (ageInYears <= 64) { // Adult: 26-64 years
        recommendedHours = { min: 7, max: 9 };
    } else { // Older Adult: 65+ years
        recommendedHours = { min: 7, max: 8 };
    }


    if (sleepHours < 5) {
        return {
            status: 'Low',
            color: 'red',
            advice: '- (Consume less caffeine)'
        };
    } else if (sleepHours >= 5 && sleepHours < 6) {
        return {
            status: 'Need more',
            color: 'yellow',
            advice: '- (Reaction time may be affected)'
        };
    } else if (sleepHours >= recommendedHours.min && sleepHours <= recommendedHours.max) {
        return {
            status: 'Normal',
            color: 'green',
            advice: '- (Ensure a comfortable sleeping environment)'
        };
    } else if (sleepHours > recommendedHours.max) {
        return {
            status: 'High',
            color: 'green',
            advice: '- (Air quality of sleeping zone)'
        };
    } else {
        return {
            status: 'Below Recommended',
            color: 'orange',
            advice: '- (Try to sleep more)'
        };
    }
}
