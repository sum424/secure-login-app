// simple password policy
function passwordMeetsPolicy(pw) {
  if (typeof pw !== 'string') return false;
  if (pw.length < 8) return false;
  // require uppercase, lowercase, number, special char
  const hasUpper = /[A-Z]/.test(pw);
  const hasLower = /[a-z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  return hasUpper && hasLower && hasNumber && hasSpecial;
}

module.exports = { passwordMeetsPolicy };
