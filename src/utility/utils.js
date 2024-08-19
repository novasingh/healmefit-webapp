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
