const Nightmare = require('nightmare')
const cheerio = require('cheerio');
const nightmare = Nightmare({ show: true });
const baseurl = 'https://www.nfl.com';
const url = 'https://www.nfl.com/teams/';
const playersUrl = 'https://www.nfl.com/players/active/';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.set('views', './views'); // specify the views directory
app.set('view engine', 'ejs'); // register the template engine
//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: true })); // Parses urlencoded bodies
app.use(bodyParser.json()); // Send JSON responses
//render css files
app.use('/static', express.static("public"));

var teams = [];

app.get('/', (req, res) => {

    teams = [];
    res.render("index.ejs", { teamData: teams, });

})

app.get('/getTeams', (req, res) => {
    teams = [];
    nightmare
        .goto(url)
        .wait('body')
        .evaluate(() => document.querySelector('body').innerHTML)
        .end()
        .then(response => {
            console.log(getData(response));
        }).catch(err => {
            console.log(err);
        });

    let getData = html => {

        const $ = cheerio.load(html);
        $('.nfl-c-custom-promo div').each(function (i, element) {
            //result object to store articles and links to articles
            var result = {};
            //grab the title and link from the scrapped html and store in result

            result.title = $(this).children('h4').text();
            $(this).find('a').each(function (index, element) {
                if (index === 0) {
                    result.url = url + $(element).attr('href');
                }
                else {
                    result.site = $(element).attr('href');
                }
            })
            //checks that an empty articles arent pulled 
            if (result.title !== "") {
                //result.link = $(this).children('a').attr('href');
                //console.log(result);
                if (teams.indexOf(result.title) == -1) {
                    teams.push(result);
                }
            }
        });

        res.render("index.ejs", { teamData: teams });
    }
})


app.post('/getPlayers', (req, res) => {
    var img = [];
    var char = req.body.lastN.toLowerCase();
    nightmare
        .goto(playersUrl + char)
        .wait('body')
        .evaluate(() => document.querySelector('body').innerHTML)
        .end()
        .then(response => {
            console.log(getData(response));
        }).catch(err => {
            console.log(err);
        });

    let getData = html => {

        const $ = cheerio.load(html);
        $('table').each(function (index, element) {


            $(this).find('a', 'img').each(function (index, element) {
                var result = {};
                result.url = baseurl + ($(element).attr('href'));
                result.title = $(element).text();
                result.site = "empty";
                if (result.title !== " " && result.url !== " ")
                    teams.push(result);
            })


        });

        res.render("index.ejs", { teamData: teams });
    }
})

app.listen(process.env.PORT || 3000);