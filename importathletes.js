const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sburl = "https://ktbibwgpjxgqhgsovoec.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Ymlid2dwanhncWhnc292b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0OTU0MTEsImV4cCI6MjAwNjA3MTQxMX0.WTJOY5lb-7MwZX4gHOqpYwkKoZOBfRl5uveu6DFmwOM"

async function importAthletes() {
    const supabaseClient = await createClient(sburl, key);
    const errors = [];
    let errorCount = 0;

    fs.readFile("./athletes.json", 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        const athletes = JSON.parse(data);

        athletes.slice(66000, 67000).forEach(async (athlete) => {
            if (!athlete.jersey) { athlete.jersey = -1 };
            if (!athlete.SAT) { athlete.SAT = 0 };
            if (!athlete.SATMath) { athlete.SATMath = 0 };
            if (!athlete.SATReading) { athlete.SATReading = 0 };
            if (!athlete.ACT) { athlete.ACT = 0 };
            if (!athlete.GPA) { athlete.GPA = 0 };
            
            athlete.GPA = athlete.GPA.toString().replace(' ','.')
            
            if (athlete.height) {
                athlete.heightFeet = 0;
                athlete.heightInches = 0;

                if (athlete.height.includes("'")) {
                    const height = athlete.height.split("'");
                    athlete.heightFeet = height[0].replace("'", "");
                    athlete.heightInches = height[1].replace('"', '');
                }
                else if (parseInt(athlete.height)) {
                    athlete.heightFeet = athlete.height.replace("'", '').replace('"', '');
                    athlete.heightInches = 0;
                }
                else {
                    athlete.heightFeet = 0;
                    athlete.heightInches = 0;
                    athlete.height = 0;
                }
            }
            else {
                athlete.height = 0;
                athlete.heightInches = 0;
                athlete.heightFeet = 0;
            }

            if (athlete.heightInches == '') {
                athlete.heightInches = 0;
            }

            if (!athlete.standingBroadJump) {
                athlete.standingBroadJump = 0;
                athlete.standingBroadJumpHeight = 0;
                athlete.standingBroadJumpInches = 0;
            }

            if (!athlete.verticalJump) {
                athlete.verticalJump = 0;
            }
            if (!athlete.forty) {
                athlete.forty = 0;
            }

            if (!athlete.athleteStateId) {
                athlete.athleteStateId = 'NS';
            }

            if (!athlete.weight) {
                athlete.weight = 0;
            }

            const { data, error } = await supabaseClient
                .from('Athlete_New_Import')
                .upsert(athlete)
                .select();

            if (error) {
                athlete.error = JSON.stringify(error);
                fs.appendFile("errors.json", JSON.stringify(athlete) + "," , function (err) {
                    
                    
                 });

                errorCount = errorCount + 1;
                console.log('error: ', JSON.stringify(error));
                console.log('error count: ', errorCount);
            }

        });

    });

}

(async () => {
    await importAthletes();
})()