const axios = require("axios");
const XLSX = require("xlsx");
const fs = require('fs');

function makeGetRequest(url) {
  return new Promise(function (resolve, reject) {
      axios.get(url).then(
          (response) => {
              var result = response.data;
              resolve(result);
          },
              (error) => {
              reject(error);
          }
      );
  });
}

function compare( a, b ) {
  if ( a.Coin < b.Coin ){
    return -1;
  }
  if ( a.Coin > b.Coin ){
    return 1;
  }
  return 0;
}

//Gets list of coins to get
listofcoins=fs.readFileSync('./coinids.txt', 'utf8' , (data) => {
  return data;
})

//Gets configuration
appconfig=fs.readFileSync('./config.txt', 'utf8' , (data) => {
  return data;
})

async function main() {
  listofcoins=listofcoins.split(','); //Formating
  appconfig=appconfig.split(','); //Formating
  var url="https://api.coingecko.com/api/v3/simple/price?ids="+listofcoins+"&vs_currencies="+appconfig[0]; //Generates url for api
  var apiresponse = await makeGetRequest(url); //Api request
  apiresponse=JSON.stringify(apiresponse);
  apiresponse=apiresponse.split(',');
  readyfordatabase=[];

  //Formats the data
  for(i=0; i<listofcoins.length; i++){
    apiresponse[i]=apiresponse[i].replace(/{/g,'');
    apiresponse[i]=apiresponse[i].replace(/}/g,'');
    apiresponse[i]=apiresponse[i].replace(/"/g,'');
    apiresponse[i]=apiresponse[i].split(':');
    readyfordatabase[i]={"Coin":apiresponse[i][0],"Price":apiresponse[i][2]};
  }
  //Sorts everything alphabetically
  readyfordatabase.sort(compare);

  //Puts everything into the spreadsheet
  const ws = XLSX.utils.json_to_sheet(readyfordatabase)
  const wb = XLSX.utils.book_new(appconfig[1])
  XLSX.utils.book_append_sheet(wb, ws, appconfig[2])
  XLSX.writeFile(wb, appconfig[1])
}

main();