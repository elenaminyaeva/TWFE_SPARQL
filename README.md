# TWFE_SPARQL

## SPARQL queries

**sparql.js**

+ SPARQL client 

```
const SparqlClient = require('sparql-http-client')
```

+ Add wikidata endpoint 

```
const endpointUrl = 'https://query.wikidata.org/sparql'
```

+ Add SPARQL queries

```
const query = (region) => `
    SELECT ?countryLabel ?cityLabel ?city ?flag
    WHERE {
    wd:${region} wdt:P527 ?country .
    ?country wdt:P36 ?city; wdt:P41 ?flag
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`
```

*Returns the list of contries and their capitals which are going to be hardcoded as a first imput in **index.html***

![SPARQL](/images/query.png)

```
const query1 = (cityCode) => `
    SELECT ?city ?languageLabel ?instanceLabel
    WHERE {
    wd:${cityCode} wdt:P1448 ?city;
    wdt:P37 ?language;
    wdt:P31 ?instance.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }
```

*Returns city's attributes*

![SPARQL](/images/query1.png)

```
const query3 = (cityCode) => `
    SELECT ?city ?flag ?flagLabel
    WHERE {
    wd:${cityCode} wdt:P1448 ?city;
    wdt:P41 ?flag.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`
```
*Returns city's flag by city code*

![SPARQL](/images/query3.png)

+ Add new class
+ Add function

```
async makeQuery(query, client = this.client) {
        return new Promise(async(resolve, reject) => {
            const stream = await client.query.select(query) // wait for users query

            const storage = []
            stream.on('data', row => { 
                const total = {}
                Object.entries(row).forEach(([key, value]) => {
                    total[key] = value.value // add data to the dictionary 
                })
                storage.push(total) // add data to array
            })
```

+ Return data to the user

```
stream.on('end', () => resolve(storage))
```

+ Export client and queries
```
module.exports = { Sparql, queries: [query, query1, query2, query3] 
```

## Server

+ Add client exported in **sparql.s**

```
const { Sparql, queries } = require('./sparql')
```

+ Render home page

```
app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname + '/views/index.html'))
})
```

+ Add API

```
app.get('/query/:id/:code', async (req, res) => {
  const { id, code } = req.params;
  res.setHeader('Content-Type', 'application/json');
  res.json(await sparql.makeQuery(queries[id](code)))
})
```

*Where 'id' = queryId, 'code' = cityCode, the data is reurned in JSON format*

+ Turn on the server and wait for a request

```
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`)
})
```

## Index.html

+ Connect *jquery*, *semantic*, *noty* (notifications) libraries

```
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/noty/3.1.4/noty.min.js" integrity="sha512-lOrm9FgT1LKOJRUXF3tp6QaMorJftUjowOWiDcG5GFZ/q7ukof19V0HKx/GWzXCdt9zYju3/KhBNdCLzK8b90Q==" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdn.rawgit.com/needim/noty/a6cccf80/lib/noty.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.js" integrity="sha512-dqw6X88iGgZlTsONxZK9ePmJEFrmHwpuMrsUChjAw1mRUhUITE5QU9pkcSox+ynfLhL15Sv2al5A0LVyDCmtUw==" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css" integrity="sha512-8bHTC73gkZ7rZ7vpqUQThUDhqcNFyYi2xgDgPDHc+GXVGHXq+xPjynxIopALmOPqzo9JZj0k6OqqewdGO3EsrQ==" crossorigin="anonymous" />
    <title>SPARQL Search</title>
</head>
```
+ Add dropdown list with hardcoded region's codes

```
<div class="menu zoneSelector">
<div class="item" data-value="Q27496">Western Europe</div>
<div class="item" data-value="Q27468">Eastern Europe</div>
<div class="item" data-value="Q12585">Latin America</div>
<div class="item" data-value="Q49">North America</div>
</div>
```

+ Add jquery function

```
 $(document).ready(function() {
 ...
 }
```
+ Activate dropdown list for semantic

```
$('.dropdown').dropdown({})
```

+ Add function for capital selection

```
$('.dropdown.zoneSelector').dropdown('setting', 'onChange', function(val) {
            console.log(val)
            $.getJSON(`/query/0/${val}`, function(data) {
                console.log(data);
                $('.menu.capitalSelector').html('')
                data.forEach(row => {
                    const info = `${row.cityLabel} (${row.countryLabel})`.length > 32 ? `${row.cityLabel} (${row.countryLabel})`.slice(0, 29) + '...)' : `${row.cityLabel} (${row.countryLabel})`;
                    $('.menu.capitalSelector').append(`<div class="item" data-value="${row.city.split('/').pop()}"><img class="ui mini spaced image" style="width: 3rem" src="${row.flag}"></img>${info}</div>`)
                })
            })
        })
```

*$.getJSON(`/query/0/${val}`, function(data)* - server request for searching by region
*$('.menu.capitalSelector').html('')* - clean dropdown list if filled out
*$('.menu.capitalSelector').append* - construct add html item for each capital value

+ Add button for flag display 

```
$('.ui.toggle.button').on('click', function(e) {
            if (!$(this).hasClass('active') && $('.dropdown.capitalSelector').dropdown('get value')) {
                $(this).addClass('loading')
                $.getJSON(`/query/3/${$('.dropdown.capitalSelector').dropdown('get value')}`, (data) => {
                    console.log(data);
                    // $('.menu.capitalSelector').html('')
                    $(this).removeClass('loading')
                    if (data[0]) {
                        createNotification('Successfully retrieved an emblem of the city', 'success')
                        $('.emblem').attr('src', data[0].flag).fadeIn(1000)
                        $(this).addClass('active')
                        $(this).text('Hide city\'s emblem')
                    } else {
                        createNotification('Couldn\'t find an emblem in the city page', 'error')
                    }
                })
            } else {
                $('.emblem').fadeOut(1000)
                $(this).text('Show city\'s emblem')
                $(this).removeClass('active')
            }
```

*$('.dropdown.capitalSelector').dropdown('get value'))* - check if a capital value is selected
*$.getJSON(`/query/3/${$('.dropdown.capitalSelector').dropdown('get value')}`* - get JSON result for query with id=3 + cityCode selected from dropdown list
*$('.emblem').attr('src', data[0].flag).fadeIn(1000)* - display image with animation while loading
*else ..* - hide image if other item selected

## Demo

![DEMO](images/demo.mp4)

<video width="320" height="240" controls>
  <source src="images/demo.mp4" type="video/mp4">
</video>
