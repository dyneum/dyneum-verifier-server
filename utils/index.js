function calculateBirthdate(age) {
  // Get the current date
  const currentDate = new Date();

  // Subtract the age from the current year
  const birthYear = currentDate.getFullYear() - age;

  // Get the month and pad it with leading zero if necessary
  const birthMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  // Get the day and pad it with leading zero if necessary
  const birthDay = currentDate.getDate().toString().padStart(2, "0");

  // Concatenate the parts to form the birthdate in YYYYMMDD format
  const birthdate = birthYear.toString() + birthMonth + birthDay;

  return parseInt(birthdate);
}

module.exports = { calculateBirthdate };
