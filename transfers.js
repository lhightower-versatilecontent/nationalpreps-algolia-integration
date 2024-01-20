const algoliasearch = require("algoliasearch");
const { createClient } = require('@supabase/supabase-js');

const sburl = "https://ktbibwgpjxgqhgsovoec.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Ymlid2dwanhncWhnc292b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0OTU0MTEsImV4cCI6MjAwNjA3MTQxMX0.WTJOY5lb-7MwZX4gHOqpYwkKoZOBfRl5uveu6DFmwOM"

function convertDateTimeToUnix(dateTimeString) {
    const unixTime = new Date(dateTimeString).getTime() / 1000; // Divide by 1000 to get seconds
    return unixTime;
}
// Search-only version
// import algoliasearch from 'algoliasearch/lite';
async function uploadData() {
    const client = algoliasearch('ETT8OD4DUG', '5a444039929899766ee85e78027b53a5');
    const index = client.initIndex('dev_TRANSFERS');

    const supabaseClient = createClient(sburl, key);
    const athletes = [];

    const { data: teams, error: teamsError } = await supabaseClient
        .from('Team')
        .select('*,College(*,Conference(name, conferenceDivisionId))');


    if (!teamsError) {
        const { data, error } = await supabaseClient
            .from('Athlete')
            .select()
            .eq('rank', '7 Transfer Portal')

        if (!error) {
            data.map((d) => {
                let displayLocation = d.city ? d.city + ", " : '';
                displayLocation += d.athleteStateId ? d.athleteStateId : ''
                let location = d.athleteStateId ? d.athleteStateId : 'Unknown';
                let teamId = 0;
                let committedTeam = {};
                let committedConference = '';
                let exitingConference = '';
                let committedDivision = '';
                let exitingDivision = '';
                let exitingTeam = {};
                let offerTeams = [];
                let enteredPortalDate = '';
                let committedDate = '';
                let offerTeam = {};
                let committed = false;
                let mostRecentInteraction = null;

                let aryInteractions = {};

                if (d.interactions && d.interactions.length > 0) {
                    aryInteractions = d.interactions;

                    // Finding the object with the most recent interactionDate
                    mostRecentInteraction = aryInteractions.reduce((prev, current) =>
                        new Date(prev.interactionDate) > new Date(current.interactionDate) ? prev : current
                    );

                    const c = aryInteractions.find(x => x.interactionType === 4)
                    if (c) {

                        teamId = c.teamId;
                        committedTeam = teams.find(x => x.id === teamId)
                        committedDate = c.interactionDate;
                        committedConference = committedTeam?.College?.Conference?.name;
                        committedDivision = committedTeam?.College?.Conference?.conferenceDivisionId;
                        committed = true;
                    }

                    const e = aryInteractions.find(x => x.interactionType === 6)
                    if (e) {
                        teamId = e.teamId;
                        exitingTeam = teams.find(x => x.id === teamId)
                        enteredPortalDate = e.interactionDate;
                        exitingConference = exitingTeam?.College?.Conference?.name;
                        exitingDivision = exitingTeam?.College?.Conference?.conferenceDivisionId;
                    }

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
                    enteredPortalDate: enteredPortalDate,
                    fname: d.fname,
                    lname: d.lname,
                    name: d.fname + " " + d.lname,
                    graduatingYear: d.graduatingYear,
                    athleteType: 'Transfer Portal',
                    twitterHandle: d.twitterHandle,
                    instagramHandle: d.instagramHandle,
                    position: d.offPosition,
                    inches: d.heightFeet ? (d.heightFeet * 12) + (d.heightInches) : 0,
                    height: d.heightFeet + "' " + d.heightInches + "\"",
                    weight: d.weight,
                    location: location,
                    displayLocation: displayLocation,
                    committedTeam: committedTeam,
                    committedDate: committedDate,
                    exitTeam: exitingTeam,
                    offers: offerTeams ? offerTeams.length : 0,
                    interactions: aryInteractions,
                    committed: committed,
                    committedConference: committedConference,
                    committedDivision: committedDivision?.toUpperCase(),
                    exitingConference: exitingConference,
                    exitingDivision: exitingDivision?.toUpperCase(),
                    lastInteractionDate: mostRecentInteraction?.interactionDate,
                    image: d.image,
                    status: committed ? 'Committed' : 'Undecided'
                }

                athletes.push(addAthlete);
            })

            index.saveObjects(athletes, { autoGenerateObjectIDIfNotExist: true });
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