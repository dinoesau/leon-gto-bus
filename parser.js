// Get input from CLI
const input = process.argv[2];

if (!input) {
  console.error("Usage: node parser.js <base64_string>");
  process.exit(1);
}

function base64ToString(base64) {
  return Buffer.from(base64, 'base64').toString('utf-8');
}

function parseCustomPayload(dataString) {
  let rawRows = dataString.split('|');

  let footerRaw = rawRows.pop();
  let paginationData = footerRaw.replace('&', '').trim();

  rawRows[0] = rawRows[0].replace(/^\$\d{4}/, '');

  let parsedRows = rawRows.map(row => row.split('#'));

  // parse row index 3 and 4 to longitude and latitude
  // 3 = latitude, 4 = longitude
  // example input '2109986' should be parsed to 21.09986
  // example input '10173168' should be parsed to -101.73168
  parsedRows = parsedRows.map(row => {
    row[3] = parseFloat(row[3]) / 100000;
    row[4] = -(parseFloat(row[4]) / 100000);
    return row;
  });

  // Filter specific columns
  const filteredData = parsedRows.map(row => {
    return [
      row[0], row[1], row[3], row[4],
      row[10], row[11],
      row[16], row[17], row[18],
      row[19], row[20], row[21], row[22]
    ];
  });

  // add names to the filtered data instead of column index to only some of the columns
  const namedFilteredData = filteredData.map(row => {
    return {
      id: row[5],
      latitude: row[2],
      longitude: row[3],
      hora: row[11],
    };
  });

  return {
    pagination: paginationData,
    data: parsedRows,
    filteredData: filteredData,
    namedFilteredData: namedFilteredData
  };
}

// Decode base64 input
let parsed = base64ToString(input);

// Run parser
const result = parseCustomPayload(parsed);

console.log("\n\n\n-- Parsed Result --");
console.log("Pagination/Meta:", result.pagination);



// console.table(result.data);
console.table(result.namedFilteredData);