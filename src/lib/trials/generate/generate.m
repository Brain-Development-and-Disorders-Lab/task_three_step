% Note: this script requires MATLAB version R2020B or newer
clear

% Variables
hoppingTrialsMean = 5.0;
hoppingTrialsVariance = 2.0;
hoppingTrialsStandardDeviation = sqrt(hoppingTrialsVariance);
trialCount = 250;

% Assemble the array
x = [];
while sum(x) < trialCount
    val = round(normrnd(hoppingTrialsMean, hoppingTrialsStandardDeviation, 1, 1));
    if val < 1
        val = 1;
    end
    x = [x val];
end

% Present a histogram
counts = histcounts(x);
trials = sum(x);
hist(x)
xlabel('Stay Time (Trials)');
ylabel('Frequency');
title('Reward Stay Time');
subtitle(['n = ', num2str(trialCount), ', mean = ', num2str(mean(x)), ', var = ', num2str(var(x))]);