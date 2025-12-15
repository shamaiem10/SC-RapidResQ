const validators = require("./validation");

const applyRule = (value, rule, fieldName) => {
  const parts = rule.split(" ");

  switch (parts[0]) {
    case "REQUIRED":
      return validators.validateRequired(value, fieldName);
    case "LENGTH":
      return validators.validateLength(value, +parts[1], +parts[2], fieldName);
    case "EMAIL":
      return validators.validateEmail(value);
    case "PHONE":
      return validators.validatePhone(value);
    case "PASSWORD":
      return validators.validatePassword(value);
    case "RANGE":
      return validators.validateNumericRange(value, +parts[1], +parts[2], fieldName);
    default:
      return { valid: true };
  }
};

const validateWithRules = (data, rules) => {
  const errors = [];

  for (const field in rules) {
    const value = data[field];
    const ruleSet = rules[field].split("|").map(r => r.trim());

    for (const rule of ruleSet) {
      const result = applyRule(value, rule, field);
      if (!result.valid) {
        errors.push(result.message);
        break;
      }
    }
  }

  return { valid: errors.length === 0, errors };
};

module.exports = validateWithRules;
