const algoliasearch = require("algoliasearch");
const { createClient } = require('@supabase/supabase-js');

const sburl = "https://ktbibwgpjxgqhgsovoec.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Ymlid2dwanhncWhnc292b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0OTU0MTEsImV4cCI6MjAwNjA3MTQxMX0.WTJOY5lb-7MwZX4gHOqpYwkKoZOBfRl5uveu6DFmwOM"

// Search-only version
// import algoliasearch from 'algoliasearch/lite';
async function uploadData() {
    const client = algoliasearch('ETT8OD4DUG', '5a444039929899766ee85e78027b53a5');
    const index = client.initIndex('dev_TRANSFERS');

    const supabaseClient = createClient(sburl, key);
    const athletes = [];
    const schools = [];

   

    const { data: teams, error: teamsError } = await supabaseClient
        .from('Team')
        .select()

    if (!teamsError) {

        const { data, error } = await supabaseClient
            .from('Athlete')
            .select('*,HighSchool(*),AthleteType(*)')
            .eq('rank','7 Transfer Portal')
            .limit(10)
        if (!error) {
            //console.log(JSON.stringify(data[0].HighSchool.highschoolStateId))

            data.map((d) => {
                let location = '';

                if (d.HighSchool) {
                    location = d.HighSchool ? d.HighSchool.highschoolStateId : d.athleteStateId ? d.athleteStateId : 'N/A';
                }
                else {
                    location = d.city ? d.city + ", " : '';
                    location += d.athleteStateId ? d.athleteStateId : ''
                }
            
                if (d.rank === '7 Transfer Portal') {
                    d.AthleteType.type = 'Transfer Portal';
                }
                let teamId = 0;
                let committedTeam = {};
                let exitingTeam = {};
                let offerTeams = [];
                let enteredPortalDate = '';
                let committedDate = '';
                let offerTeam = {};

                if (d.interactions && d.interactions.length > 0) {
                    const aryInteractions = d.interactions.map(JSON.parse);
                    const c = aryInteractions.find(x => x.interactionType === 4)
                    if (c) {
                        
                        teamId = c.teamId;
                        committedTeam = teams.find(x => x.id === teamId)
                        committedDate = c.interactionDate;
                    }
                    console.log('commitDate', committedDate)

                    const e = aryInteractions.find(x => x.interactionType === 6)
                    if (e) {
                        teamId = e.teamId;
                        exitingTeam = teams.find(x => x.id === teamId)
                        enteredPortalDate = e.interactionDate;
                    }
                    console.log(enteredPortalDate)

                    const o = aryInteractions.filter(x => x.interactionType === 2)
                    if (aryInteractions && aryInteractions.length > 0 && o && o.length > 0) {
                        o.forEach(item => {
                            teamId = item.teamId;
                            offerTeam = teams.find(x => x.id === teamId)
                            offerTeam.offerDate = item.interactionDate;
                            offerTeams.push(offerTeam)
                        })
                    }
                }

                const addAthlete = {
                    objectID: d.id,
                    fname: d.fname,
                    lname: d.lname,
                    twitterHandle: d.twitterHandle,
                    instagramHandle: d.instagramHandle,
                    offPosition: d.offPosition,
                    defPosition: d.defPosition,
                    stPosition: d.stPosition,
                    scoutPosition: d.scoutPosition,
                    name: d.fname + " " + d.lname,
                    inches: d.heightFeet ? (d.heightFeet * 12) + (d.heightInches) : 0,
                    height: d.heightFeet + "' " + d.heightInches + "\"",
                    weight: d.weight,
                    location: location,
                    county: d.HighSchool ? d.HighSchool.county : 'Unknown',
                    highschoolDisplay: d.HighSchool ? d.HighSchool.name + ' (' + d.HighSchool.city + ', ' + d.HighSchool.highschoolStateId + ')' : '',
                    GPA: d.GPA && d.GPA != null && d.GPA != '' ? d.GPA : '0',
                    ACT: d.ACT && d.ACT != null && d.ACT != '' ? d.ACT : '0',
                    SAT: d.SAT && d.SAT != null && d.SAT != '' ? d.SAT : '0',
                    athleteType: d.AthleteType.type,
                    rank: d.rank ? d.rank : 'Unknown',
                    committedTeam: committedTeam,
                    committedDate: committedDate,
                    enteredPortalDate: enteredPortalDate,
                    offers: offerTeams
                }

                athletes.push(addAthlete);
            })

            //index.saveObjects(athletes, { autoGenerateObjectIDIfNotExist: true });
        }
        else {
            console.log('error: ', JSON.stringify(error))
        }
    }
    else {
        console.log('error retrieving teams', JSON.stringify(teamsError))
    }
}

(async () => {
    uploadData();
})()