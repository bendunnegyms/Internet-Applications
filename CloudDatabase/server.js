const AWS = require('aws-sdk')
const express = require('express')
const { get } = require('https')
const app = express()
const port = 3000
const cors = require("cors")
app.use(cors({
    origin: "*",
}))
const path=require("path")
let publicPath= path.resolve(__dirname,"public")
app.use(express.static(publicPath))


// -- AWS OBJECTS AND CONFIGS --
var AWS_ACCESS_KEY = ""
var AWS_SECRET_KEY = ""

AWS.config.update({
    region: 'eu-west-1',
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_KEY
  }
});

var dynamodb = new AWS.DynamoDB()
var s3Bucket = new AWS.S3()
// --

app.post('/create/', async function createDB(req, res) {
    console.log("create endpoint jerked")
    var params = {
        TableName : "Movies",
        KeySchema: [
            { AttributeName: "year", KeyType: "HASH"},
            { AttributeName: "title", KeyType: "RANGE" },
        ],
        AttributeDefinitions: [
            { AttributeName: "year", AttributeType: "N" },
            { AttributeName: "title", AttributeType: "S" },         
        ],
        ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
        }
    }
    dynamodb.createTable(params, function(err, data) {
        if (err) {
            console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
        }
    })

    params = {
        Bucket: "csu44000assignment220", 
        Key: "moviedata.json"
    };

    const resp = await s3Bucket.getObject(params).promise()
    var moviesData = JSON.parse(resp.Body)
    console.log(moviesData)
    //populate table

    res.send({"response":"successfully created table"})
})

app.post('/destroy/', async function destroyDB(req,res){
    console.log("destroy endpoint creamed")
    dynamodb.deleteTable({"TableName":"Movies"}, function(err, data) {
        if (err && err.code === 'ResourceNotFoundException') {
            console.log("Error: Table not found");
        } else if (err && err.code === 'ResourceInUseException') {
            console.log("Error: Table in use");
        } else {
            console.log("Success", data);
        }
    })
    res.send({"response":"successfully deleted table"})
})

app.post('/query/', async function queryDB(req,res){
    console.log("query endpoint blasted")
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
