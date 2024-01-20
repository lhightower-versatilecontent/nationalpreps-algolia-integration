const algoliasearch = require("algoliasearch");
const { createClient } = require('@supabase/supabase-js');

const sburl = "https://ktbibwgpjxgqhgsovoec.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Ymlid2dwanhncWhnc292b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0OTU0MTEsImV4cCI6MjAwNjA3MTQxMX0.WTJOY5lb-7MwZX4gHOqpYwkKoZOBfRl5uveu6DFmwOM"

// Search-only version
// import algoliasearch from 'algoliasearch/lite';
async function buildIndex() {
    const client = algoliasearch('ETT8OD4DUG', '5a444039929899766ee85e78027b53a5');
    const index = client.initIndex('dev_highschools');
    const supabaseClient = createClient(sburl, key);
    const hschools = [];
    const { data, error } = await supabaseClient
        .from('HighSchool')
        .select()

    if (!error) {
        //console.log(JSON.stringify(data[0].HighSchool.highschoolStateId))

        data.map((d) => {
            d.objectID = d.ETS;
            hschools.push(d);
        })

        index.saveObjects(hschools, { autoGenerateObjectIDIfNotExist: true });
    }
    else {
        console.log('error: ', JSON.stringify(error))
    }
}

(async () => {
    buildIndex();
})()