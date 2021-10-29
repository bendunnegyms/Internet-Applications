const axios = require('axios').default
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

app.get('/weather-and-pollution/:city', async function findWeather(req, res) {
    console.log(req.params.city)
    let apiKey = "d1a82a0c303941f548b8e3cb20b11fc2"
    let city = req.params.city;
    var response = await axios.get(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&APPID=${apiKey}`)
    
    if (response.status !== 200){
        console.warn(`Issue arisen: ${response.status}`)
        res.send(response)
    } else {
        let lat = response.data.city.coord.lat
        let lon = response.data.city.coord.lon
        let cityWeather = response.data.list
        var responsePollution = await axios.get(`http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`)
        
        if (responsePollution.status !== 200){
            console.warn(`Issue arisen for pollution API: ${response.status}`)
            var rainFlag = false
            var pollutionFlag = false

            cityWeather.forEach((e) =>{
                rainFlag = ("rain" in e ? true: rainFlag)
            })

            let formattedData = cityWeather.map((e) => {
                return {
                    "time": e.dt_txt,
                    "temp": e.main.temp,
                    "wind": e.wind.speed,
                    "rain": ("rain" in e ? e.rain['3h'] : 0)
                }
            })
            
            res.send({
                "rainFlag": rainFlag,
                "pollutionFlag": pollutionFlag,
                "weatherData": formattedData
            })
            

        } else {

            var rainFlag = false
            console.log(responsePollution.data.list[0].components.pm2_5)
            var pollutionFlag = (responsePollution.data.list[0].components.pm2_5 > 10 
                ? true 
                : false)

            cityWeather.forEach((e) =>{
                rainFlag = ("rain" in e ? true: rainFlag)
            })

            
            let formattedData = cityWeather.map((e) => {
                return {
                    "time": e.dt_txt,
                    "temp": e.main.temp,
                    "wind": e.wind.speed,
                    "rain": ("rain" in e ? e.rain['3h'] : 0)
                }
            })
            res.send({
                "rainFlag": rainFlag,
                "pollutionFlag": pollutionFlag,
                "weatherData": formattedData
            })
        }
    }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
