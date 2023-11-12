const algoliasearch = require("algoliasearch");
const { createClient } = require('@supabase/supabase-js');

const sburl ="https://ktbibwgpjxgqhgsovoec.supabase.co"
const key ="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Ymlid2dwanhncWhnc292b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0OTU0MTEsImV4cCI6MjAwNjA3MTQxMX0.WTJOY5lb-7MwZX4gHOqpYwkKoZOBfRl5uveu6DFmwOM"

// Search-only version
// import algoliasearch from 'algoliasearch/lite';
async function uploadData() {
    const client = algoliasearch('ETT8OD4DUG', '5a444039929899766ee85e78027b53a5');
    const index = client.initIndex('dev_athletes');
    const supabaseClient = createClient(sburl, key);
    const athletes = [];
    const { data, error } = await supabaseClient
    .from('Athlete')
    .select('*, Interaction(*),HighSchool(*),AthleteType(*)')
    .range(0,23000)
        
    if (!error) {
        //console.log(JSON.stringify(data[0].HighSchool.highschoolStateId))

         data.map((d) => {
            d.name = d.fname + " " + d.lname;
            d.height = d.heightFeet + "' " + d.heightInches + "\"";
            d.location = d.HighSchool ? d.HighSchool.highschoolStateId : 'N/A';
            d.count = d.HighSchool ? d.HighSchool.county : 'N/A';
            d.GPA = d.GPA && d.GPA != null && d.GPA != '' ? d.GPA : '0';
            d.ACT = d.ACT && d.ACT != null && d.ACT != '' ? d.ACT : '0';
            d.SAT = d.SAT && d.SAT != null && d.SAT != '' ? d.SAT : '0';
            d.inches = d.heightFeet ? (d.heightFeet * 12) + (d.heighInches) : 0;
            d.athleteType = d.AthleteType.type;

            athletes.push(d);
        })

        index.saveObjects(athletes, { autoGenerateObjectIDIfNotExist: true }); 
    }
    else
    {
        console.log('error: ', JSON.stringify(error))
    }
}

(async () => {
    uploadData();
})()