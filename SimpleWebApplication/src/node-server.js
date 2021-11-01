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

            let formattedWeatherDataForEveryThreeHours = cityWeather.map((e) => {
                date = new Date(e.dt_txt.split(" ")[0]).getDate()
                return {
                    "date": date,
                    "temp": e.main.temp,
                    "wind": e.wind.speed,
                    "rain": ("rain" in e ? e.rain['3h'] : 0)
                }
            })
            let formattedData = []
            const days = ["Monday", 
                    "Tuesday", 
                    "Wednesday", 
                    "Thursday", 
                    "Friday",
                    "Saturday",
                    "Sunday"]
            
            for (var day in [0,1,2,3,4,5,6]){
                
                let tempWeatherData = formattedWeatherDataForEveryThreeHours.filter((e) => {
                    e.date == day
                })
                let temperatures = 0
                let windspeed = 0
                let rainlevel = 0
                tempWeatherData.forEach((e) => {
                    temperatures += e.temp
                    windspeed += e.wind
                    rainlevel += e.rain
                })
                temperatures = temperatures/ tempWeatherData.length
                windspeed = windspeed/tempWeatherData.length
                rainlevel = rainlevel/tempWeatherData.length
                if(tempWeatherData.length > 0){
                    formattedData.push({
                        "day": days[day-1],
                        "temp": Math.trunc(temperatures),
                        "wind": windspeed,
                        "rain": rainlevel
                    }) 
                }
            }

            let packFor = (formattedData[0].temp > 20 
                ? 1 
                : (formattedData[0].temp > 10 
                    ? 0
                    : -1))
            res.send({
                "packFor": packFor,
                "rainFlag": rainFlag,
                "pollutionFlag": pollutionFlag,
                "weatherData": formattedData
            })
            

        } else {

            var rainFlag = false
            var pollutionFlag = false
            responsePollution.data.list.forEach((e) => {
                pollutionFlag = (e.components.pm2_5 > 10 
                    ? true 
                    : pollutionFlag)
            })

            cityWeather.forEach((e) =>{
                rainFlag = ("rain" in e ? true: rainFlag)
            })

            
            let formattedWeatherDataForEveryThreeHours = cityWeather.map((e) => {
                date = new Date(e.dt_txt.split(" ")[0]).getDate()
                return {
                    "date": date,
                    "temp": e.main.temp,
                    "wind": e.wind.speed,
                    "rain": ("rain" in e ? e.rain['3h'] : 0)
                }
            })
            let formattedData = []
            
            const days = ["Monday", 
                    "Tuesday", 
                    "Wednesday", 
                    "Thursday", 
                    "Friday",
                    "Saturday",
                    "Sunday"]
            for (var day in [0,1,2,3,4,5,6]){
                
                let tempWeatherData = formattedWeatherDataForEveryThreeHours.filter((e) => {
                    return e["date"] == day
                })

                let temperatures = 0
                let windspeed = 0
                let rainlevel = 0
                tempWeatherData.forEach((e) => {
                    temperatures += e.temp
                    windspeed += e.wind
                    rainlevel += e.rain
                })
                temperatures = temperatures/ tempWeatherData.length
                windspeed = windspeed/tempWeatherData.length
                rainlevel = rainlevel/tempWeatherData.length
                if(tempWeatherData.length > 0){
                    formattedData.push({
                        "day": days[day-1],
                        "temp": Math.trunc(temperatures),
                        "wind": windspeed,
                        "rain": rainlevel
                    }) 
                }
            }

            let packFor = (formattedData[0].temp > 20 
                ? 1 
                : (formattedData[0].temp > 10 
                    ? 0
                    : -1))
            res.send({
                "packFor": packFor,
                "rainFlag": rainFlag,
                "pollutionFlag": pollutionFlag,
                "weatherData": formattedData
            })
        }
    }
})
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
