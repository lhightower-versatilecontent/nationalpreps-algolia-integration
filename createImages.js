
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sburl = "https://ktbibwgpjxgqhgsovoec.supabase.co"
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Ymlid2dwanhncWhnc292b2VjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTA0OTU0MTEsImV4cCI6MjAwNjA3MTQxMX0.WTJOY5lb-7MwZX4gHOqpYwkKoZOBfRl5uveu6DFmwOM"

async function createBuckets() {
    const supabaseClient = await createClient(sburl, key);

    const { data, error } = supabaseClient.storage.createBucket('avatars', {
        public: true, // default: false
    })
}


(async () => {
    await createBuckets();
})()