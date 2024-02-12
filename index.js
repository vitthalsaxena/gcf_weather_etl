const {Storage}=require('@google-cloud/storage');
const csv=require('csv-parser');
const {BigQuery}=require('@google-cloud/bigquery');

//Loading into BigQuery for test on demo file
const bq=new BigQuery();
const datasetId='weather_etl';
const tableId='assignment3';

exports.readObservation = (file, context) => {
//     console.log(`  Event: ${context.eventId}`);
//     console.log(`  Event Type: ${context.eventType}`);
//     console.log(`  Bucket: ${file.bucket}`);
//     console.log(`  File: ${file.name}`);

    const gcs=new Storage();
    const dataFile=gcs.bucket(file.bucket).file(file.name);
    dataFile.createReadStream()
    .on('error',()=>{
        //Error Handling
        console.error(error);
    })
    .pipe(csv())
    .on('data',(row)=>{
        //Log data
        //console.log(row);
        modifyData(file,row);
        printData(row);
        writetobq(row);
    })
    .on('end',()=>{
        //EOF
        console.log("End of File!");
        
    })
}
// Helper function

function printData(row){
    for(let key in row){
        console.log(key+":"+row[key]);
    }
}

//Modifying data

function modifyData(file,row){
    for(let key in row){
        if(key=="station"){
            row[key]=file.name;
        }
        if(row[key]==-9999){
            row[key]=null;
        }
        if(key=="airtemp" || key=="dewpoint" || key=="pressure" || key=="windspeed" || key=="precip1hour" || key=="precip6hour"){
            if(row[key]!=null){
                row[key]=row[key]/10;
            }
        }
    }
}

//create a helper function that writes to bigquery
async function writetobq(obj){
    //BQ expects an array of objects
    var data=[];
    data.push(obj);

    //insert the array into the table
    await bq
    .dataset(datasetId)
    .table(tableId)
    .insert(data)
    .then(()=>{
        data.forEach((val)=>{console.log(`Insterted: ${val}`)})
    })
    .catch((err)=>{console.error(`Error: ${err}`)})
}