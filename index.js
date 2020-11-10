const fs = require("fs");
const path = require("path");
const csv = require("fast-csv");

const {
  columnMappings: { amountColumn, balanceColumn, currencyColumn, typeColumn },
} = require("./config");

const { addRound8, round } = require("./utilities");

// fee, withdrawal, deposit, match
const processTypes = ["withdrawal", "deposit"];
const rows = [];

fs.createReadStream(path.resolve(__dirname, "statements", "main.csv"))
  .pipe(csv.parse({ headers: true }))
  .on("error", (error) => console.error(error))
  .on("data", (row) => rows.push(row))
  .on("end", (rowCount) => {
    console.log(`Parsed ${rowCount} rows`);
    processRows(rows);
  });

function processRows(rows) {
  const results = {
    /*
      btc: {
        balance: 1.1,
        deposits: 1.1,
        withdrawals: 1.1,
      },
      ...
    */
  };

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const currency = row[currencyColumn]; // BTC, ETH, USD, etc.
    results[currency] = results[currency] || {
      balance: 0,
      deposits: 0,
      withdrawals: 0,
    };

    const result = results[currency];
    result.balance = Number(row[balanceColumn]);

    // only process deposits and withdrawals
    const type = row[typeColumn];
    if (!processTypes.includes(type)) {
      continue;
    }

    if (type === "deposit") {
      result.deposits = addRound8(result.deposits, Number(row[amountColumn]));
    } else if (type === "withdrawal") {
      result.withdrawals = addRound8(
        result.withdrawals,
        -Number(row[amountColumn])
      );
    }
  }

  for (let currency in results) {
    results[currency].balance = round(results[currency].balance, 2);
    results[currency].deposits = round(results[currency].deposits, 2);
    results[currency].withdrawals = round(results[currency].withdrawals, 2);
  }

  console.log(`results: ${JSON.stringify(results, null, 2)}`);

  return results;
}
