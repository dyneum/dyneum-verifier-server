function calculateBirthdate(age) {
  // Get the current date
  var currentDate = new Date();

  // Subtract the age from the current year
  var birthYear = currentDate.getFullYear() - age;

  // Get the month and pad it with leading zero if necessary
  var birthMonth = (currentDate.getMonth() + 1).toString().padStart(2, "0");

  // Get the day and pad it with leading zero if necessary
  var birthDay = currentDate.getDate().toString().padStart(2, "0");

  // Concatenate the parts to form the birthdate in YYYYMMDD format
  var birthdate = birthYear.toString() + birthMonth + birthDay;

  return birthdate;
}

module.exports = { calculateBirthdate };
