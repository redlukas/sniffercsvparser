const csv = require('csv-parser')
const fs = require('fs')
const express = require('express')
const app = express()

let APresults = ["no results yet"];
let clientResults = ["no results yet"];


function parseCSV(){
    let APtempresults=[];
    let clientTempResults=[];

    const buffer = fs.readFileSync("csvdir/ad-01.csv");
    const full = buffer.toString();
    const appart = full.substring(full.indexOf("BSSID"), full.indexOf("Station MAC"))
    const clientpart = full.substring(full.indexOf("Station MAC"))


    fs.writeFile('appart.csv', appart, err => {
        if (err) {
            console.error(err)
        }
    })
    fs.writeFile('clientpart.csv', clientpart, err => {
        if (err) {
            console.error(err)
        }
    })


    fs.createReadStream('clientpart.csv')
        .pipe(csv(
            {
                mapHeaders: ({
                                 header,
                                 index
                             }) => header.trim().replaceAll(" ", "_").replace("\#", "nr").replace("\-", "_")
            }
        ))
        .on('data', (data) => clientTempResults.push(data));


    fs.createReadStream('appart.csv')
        .pipe(csv(
            {
                mapHeaders: ({
                                 header,
                                 index
                             }) => header.trim().replaceAll(" ", "_").replace("\#", "nr").replace("\-", "_")
            }
        ))
        .on('data', (data) => APtempresults.push(data));
    APresults=APtempresults;
    clientResults=clientTempResults
    setTimeout(parseCSV, 30_000)
}

parseCSV()
///Rest calls
app.get('/api/clients', function (req, res) {
    res.json(clientResults)
})

app.get('/api/aps', function (req, res) {
    res.json(APresults)
})


app.listen(3000)
