const phoneValidate = phone => {
  const expression = /(09|01[2|6|8|9]|03)+([0-9]{8})\b|(84)+([0-9]{9})\b/i;
  return expression.test(String(phone).toLowerCase());
};

module.exports = phoneValidate;
