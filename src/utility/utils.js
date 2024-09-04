export function isTokenExpired(token) {
    if (!token) {
        return true;
    }
    const payload = token.split('.')[1];
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    const currentTime = Math.floor(Date.now() / 1000);
    return decodedPayload.exp < currentTime;
}

// function normalize(value, min, max) {
//     return (value - min) / (max - min);
//   }
  
// export async function calculateHealthScore(age, bmi, heartRate, steps, sleep) {

//     // Normalize each metric based on the given ranges
//     const ageNorm = normalize(age, 20, 80);
//     const bmiNorm = normalize(bmi, 15, 40);
//     const heartRateNorm = normalize(heartRate, 40, 100);
//     const stepsNorm = normalize(steps, 0, 10000);
//     const sleepNorm = normalize(sleep, 4, 10);
  
//     // Calculate the average score
//     let healthScore = (ageNorm + bmiNorm + heartRateNorm + stepsNorm + sleepNorm) / 5;
  
//     // Determine the health category
//     let category;
//     if (healthScore >= 0.8) {
//       category = "Excellent";
//     } else if (healthScore >= 0.6) {
//       category = "Good";
//     } else if (healthScore >= 0.4) {
//       category = "Fair";
//     } else {
//       category = "Bad";
//     }

//     if(isNaN(healthScore)){
//         healthScore = 0
//     }
  
//     return { healthScore: healthScore.toFixed(2), category };
//   }
  

/**
 * Calculates the age score based on the given age.
 *
 * @param {number} age - The age of the individual.
 * @returns {number} The score for age.
 */
function getAgeScore(age) {
    if (age >= 20 && age <= 30) return 1; // Excellent
    if (age >= 31 && age <= 50) return 0.75; // Good
    if (age >= 51 && age <= 65) return 0.5; // Fair
    if (age >= 66 && age <= 80) return 0.25; // Bad
    return 0; // Outside of considered age range
}

/**
 * Calculates the BMI score based on the given BMI.
 *
 * @param {number} bmi - The Body Mass Index of the individual.
 * @returns {number} The score for BMI.
 */
function getBMIScore(bmi) {
    if (bmi >= 18.5 && bmi <= 24.9) return 1; // Excellent
    if (bmi >= 25.0 && bmi <= 27.9) return 0.75; // Good
    if (bmi >= 28.0 && bmi <= 29.9) return 0.5; // Fair
    if (bmi >= 30.0 && bmi <= 40.0) return 0.25; // Bad
    return 0; // Outside of considered BMI range
}

/**
 * Calculates the heart rate score based on the given heart rate.
 *
 * @param {number} heartRate - The resting heart rate of the individual.
 * @returns {number} The score for heart rate.
 */
function getHeartRateScore(heartRate) {
    if (heartRate >= 48 && heartRate <= 55) return 1.25; // Excellent
    if (heartRate >= 56 && heartRate <= 62) return 1; // Excellent
    if (heartRate >= 63 && heartRate <= 70) return 0.75; // Good
    if (heartRate >= 71 && heartRate <= 82) return 0.5; // Fair
    if (heartRate >= 83 && heartRate <= 100) return 0.25; // Bad
    return 0; // Outside of considered heart rate range
}

/**
 * Calculates the steps score based on the given number of steps.
 *
 * @param {number} steps - The number of steps taken by the individual.
 * @returns {number} The score for steps.
 */
function getStepsScore(steps) {
    if (steps >= 12000 && steps <= 20000) return 1; // Excellent
    if (steps >= 8000 && steps < 12000) return 0.75; // Good
    if (steps >= 5000 && steps < 8000) return 0.5; // Fair
    if (steps < 5000) return 0.25; // Bad
    return 0; // Outside of considered steps range
}

/**
 * Calculates the sleep score based on the given number of sleep hours.
 *
 * @param {number} sleepHours - The number of hours the individual sleeps.
 * @returns {number} The score for sleep.
 */
function getSleepScore(sleepHours) {
    if (sleepHours >= 7 && sleepHours <= 9) return 1; // Excellent
    if (sleepHours >= 5 && sleepHours < 7) return 0.75; // Good
    if (sleepHours >= 4 && sleepHours < 5) return 0.5; // Fair
    if (sleepHours < 4) return 0.25; // Bad
    return 0; // Outside of considered sleep range
}

/**
 * Calculates the health score based on the given metrics.
 *
 * @param {number} age - The age of the individual.
 * @param {number} bmi - The Body Mass Index of the individual.
 * @param {number} heartRate - The resting heart rate of the individual.
 * @param {number} steps - The number of steps taken by the individual.
 * @param {number} sleepHours - The number of hours the individual sleeps.
 * @returns {number} The calculated health score.
 */
export function calculateHealthScore(age, bmi, heartRate, steps, sleepHours) {
    const ageScore = getAgeScore(age);
    const bmiScore = getBMIScore(bmi);
    const heartRateScore = getHeartRateScore(heartRate);
    const stepsScore = getStepsScore(steps);
    const sleepScore = getSleepScore(sleepHours);

    // Weights for each factor
    const weights = {
        age: 0.25,
        bmi: 0.25,
        heartRate: 0.25,
        steps: 0.15,
        sleep: 0.10
    };

    // Calculate the weighted health score
    let healthScore = (ageScore * weights.age) +
                        (bmiScore * weights.bmi) +
                        (heartRateScore * weights.heartRate) +
                        (stepsScore * weights.steps) +
                        (sleepScore * weights.sleep);

    // Determine the health category
    let category;
    if (healthScore >= 0.8) {
      category = "Excellent";
    } else if (healthScore >= 0.6) {
      category = "Good";
    } else if (healthScore >= 0.4) {
      category = "Fair";
    } else {
      category = "Bad";
    }

    if(isNaN(healthScore)){
        healthScore = 0
    }
  
    return { healthScore: healthScore.toFixed(2), category };
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

  export function getStepActivityLevel(steps) {
    let result = { type: "Unknown", color: "gray", recommended: "" }; // Default return object

    if (steps >= 12000 && steps <= 20000) {
        result = { 
            type: "Excellent", 
            color: "green", 
            recommended: "(12,000 - 20,000 steps/day)" 
        };
    } else if (steps >= 8000 && steps <= 11999) {
        result = { 
            type: "Good", 
            color: "#5eb75e", 
            recommended: "(8,000 - 11,999 steps/day)" 
        };
    } else if (steps >= 5000 && steps <= 7999) {
        result = { 
            type: "Fair", 
            color: "yellow", 
            recommended: "(5,000 - 7,999 steps/day)" 
        };
    } else if (steps >= 0 && steps <= 4999) {
        result = { 
            type: "Bad", 
            color: "red", 
            recommended: "(0 - 4,999 steps/day)" 
        };
    }

    return result;
}

  export function getHeartRateType(age, heartRate) {
    let result = { type: "Unknown", recommended : 'N/A',  color: "gray" }; // Default return object
    if (heartRate >= 48 && heartRate <= 55) {
        result = { type: "Athletic", recommended: '(48 - 55 bpm)', color: "green" };
    }else if (heartRate >= 56 && heartRate <= 62) {
        result = { type: "Excellent", recommended: '(56 - 62 bpm)', color: "green" };
    } else if (heartRate >= 63 && heartRate <= 70) {
        result = { type: "Good", recommended: '(63 - 70 bpm)' , color: "#5eb75e" };
    } else if (heartRate >= 71 && heartRate <= 82) {
        result = { type: "Fair", recommended: '(71 - 83 bpm)' , color: "yellow" };
    } else if (heartRate >= 83 && heartRate <= 100) {
        result = { type: "Bad", recommended: '(81 - 100 bpm)' ,color: "red" };
    }

    return result;
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
            status: 'Excellent',
            range: '(18.5 - 24.9)',
            color: 'rgb(16, 185, 129)'
        };
    } else if (bmi >= 25 && bmi <= 27.9) {
        return {
            status: 'Good',
            range: '(25 - 29.9)',
            color: 'orange'
        };
    } else if (bmi >= 28 && bmi <= 29.9) {
        return {
            status: 'Fair',
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

    if (sleepHours < 4) {
        return {
            status: 'Bad',
            color: 'red',
            advice: '- (Consume less caffeine)'
        };
    } else if (sleepHours >= 4 && sleepHours < 5) {
        return {
            status: 'Bad',
            color: 'red',
            advice: '- (Reaction time may be affected)'
        };
    } else if (sleepHours >= 5 && sleepHours < 6) {
        return {
            status: 'Fair',
            color: 'yellow',
            advice: '- (Ensure a comfortable sleeping environment)'
        };
    } else if (sleepHours >= 6 && sleepHours < 7) {
        return {
            status: 'Good',
            color: 'green',
            advice: '- (Maintain current sleep routine)'
        };
    } else if (sleepHours >= 7 && sleepHours <= 9) {
        return {
            status: 'Excellent',
            color: 'green',
            advice: '- (Keep up the good sleep habits)'
        };
    } else {
        return {
            status: 'High',
            color: 'green',
            advice: '- (Ensure air quality of sleeping zone)'
        };
    }
}

export async function calculateAverages(sleepData, stepsData, heartRateData) {
    
    const getDefault = (value) => (isNaN(value) || value == null ? 0 : value);
  
    const totalSleep = sleepData.length;
    const totalTimeInBed = sleepData.reduce((sum, entry) => sum + getDefault(entry.timeInBed), 0);
    const totalMinutesAsleep = sleepData.reduce((sum, entry) => sum + getDefault(entry.minutesAsleep), 0);
    const totalMinutesAwake = sleepData.reduce((sum, entry) => sum + getDefault(entry.minutesAwake), 0);
  
    const avgTimeInBed = Math.round(totalSleep ? totalTimeInBed / totalSleep : 0);
    const avgMinutesAsleep = Math.round(totalSleep ? totalMinutesAsleep / totalSleep : 0);
    const avgMinutesAwake = Math.round(totalSleep ? totalMinutesAwake / totalSleep : 0);
  
    const totalSteps = stepsData.length;
    const totalStepsValue = stepsData.reduce((sum, entry) => sum + getDefault(parseInt(entry.value, 10)), 0);
    const avgSteps = Math.round(totalSteps ? totalStepsValue / totalSteps : 0);
  
    const totalHeartRates = heartRateData.length;
    const totalRestingHeartRate = heartRateData.reduce((sum, entry) => sum + getDefault(entry.value.restingHeartRate), 0);
    const avgRestingHeartRate = Math.round(totalHeartRates ? totalRestingHeartRate / totalHeartRates : 0);
  
    return {
      avgTimeInBed,
      avgMinutesAsleep,
      avgMinutesAwake,
      avgSteps,
      avgRestingHeartRate
    };
  }

 export  function cmToFeetInches(cm) {
    const totalInches = cm / 2.54;

    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}ft ${inches}in`;
  }

  export function convertWeightToKg(weight, weightUnit) {
    if (weightUnit === "en_US") {
        // 1 pound (lbs) = 0.453592 kg
        const weightInKg = weight * 0.453592;
        return weightInKg.toFixed(2); // Round to 2 decimal places
    } else {
        return weight;
    }
}