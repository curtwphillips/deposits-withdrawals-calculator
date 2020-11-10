const math = require("mathjs");

exports.addRound8 = function (v1, v2) {
  if (isNaN(v1) || isNaN(v2)) {
    console.log("v1: " + v1 + ", v2: " + v2);
    throw new Error(`invalid values ${v1} and ${v2}`);
  }
  return math.round(math.add(v1, v2), 8);
};

exports.round = function (value, decimals) {
  value = Number.parseFloat(value);
  decimals = decimals || 0;
  return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
};
