export function computeAlert({ heartRate, oxygen, systolic, diastolic }) {
  // Priority: Critical > Alert > Warning > Normal
  if (oxygen < 92) return "Critical";
  if (heartRate < 50 || heartRate > 110) return "Alert";
  if (systolic > 140 || diastolic > 90) return "Warning";
  return "Normal";
}

