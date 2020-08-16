const SparqlClient = require('sparql-http-client')
const endpointUrl = 'https://query.wikidata.org/sparql'

const query = (region) => `
    SELECT ?countryLabel ?cityLabel ?city ?flag
    WHERE {
    wd:${region} wdt:P527 ?country .
    ?country wdt:P36 ?city; wdt:P41 ?flag
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`

const query1 = (cityCode) => `
    SELECT ?city ?languageLabel ?instanceLabel
    WHERE {
    wd:${cityCode} wdt:P1448 ?city;
    wdt:P37 ?language;
    wdt:P31 ?instance.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`

const query2 = `
    SELECT DISTINCT ?region ?regionLabel
    WHERE
    {
    ?region wdt:P31* wd:Q82794 .
    SERVICE wikibase:label {
        bd:serviceParam wikibase:language "en" .
    }
    }`

const query3 = (cityCode) => `
    SELECT ?city ?flag ?flagLabel
    WHERE {
    wd:${cityCode} wdt:P1448 ?city;
    wdt:P41 ?flag.
    SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
    }`

class Sparql {
    constructor() {
        this.client = new SparqlClient({ endpointUrl })
    }

    async makeQuery(query, client = this.client) {
        return new Promise(async(resolve, reject) => {
            const stream = await client.query.select(query)

            const storage = []
            stream.on('data', row => {
                const total = {}
                Object.entries(row).forEach(([key, value]) => {
                    total[key] = value.value
                })
                storage.push(total)
            })

            stream.on('end', () => resolve(storage))

            stream.on('error', err => {
                // console.error(err)
                reject(err)
            })
        })
    }

}

// async function main() {
//     const sp = new Sparql()
//     console.log(await sp.makeQuery(query))
// }

module.exports = { Sparql, queries: [query, query1, query2, query3] }