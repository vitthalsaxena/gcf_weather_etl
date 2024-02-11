const {Storage}=require('@google-cloud/storage');
const csv=require('csv-parser');

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
        if(row=="station"){
            row[key]=file.name;
        }
        if(row[key]==-9999){
            row[key]=null;
        }
        if(row=="airtemp" || row=="dewpoint" || row=="pressure" || row=="windspeed" || row=="precip1hour" || row=="precip6hour"){
            if(row[key]!=null){
                row[key]=row[key]*10;
            }
        }
    }
}