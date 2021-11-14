const csv = require('csv-parser')
const fs = require('fs')
const express = require('express')
const app = express()
const util = require('util');
const fsPromises = fs.promises;

const readdir = util.promisify(fs.readdir);

let APresults = ["no results yet"];
let clientResults = ["no results yet"];
let lastFileScan = new Date()


async function getFiles() {
    console.log("getting files");
    let fileArray
    try{
        fileArray = await readdir("csvdir/")
        console.log("fileArray in try block is", fileArray);
    }catch (err){
        console.log(err);
    }
    console.log("fileArray is", fileArray);
    let filesToScan = []
    for (let file of fileArray) {
        console.log(file);
        await fs.stat("csvdir/" + file, (err, stats) => {
            if (err) {
                throw err;
            }
            console.log("looking at", file);
            if (stats.mtime.getMilliseconds() > lastFileScan.getMilliseconds()) {
                console.log("adding it");
                filesToScan.push(file)
            } else console.log("not adding it")
        });
    }
    lastFileScan = new Date()
    return filesToScan;
}


async function parseCSV() {
    console.log("parsing csv");
    let files = await getFiles();
    console.log("parsing files", files);
    let APtempresults = [];
    let clientTempResults = [];
    for (let file of files) {
        console.log("processing", file);
        const buffer = fs.readFileSync(`csvdir/${file}`);
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
    }
    APresults = APtempresults;
    clientResults = clientTempResults
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
