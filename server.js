import express from "express";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"GenCare",
    password:"1612",
    port:5432,
  });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


db.connect();

let DrugList = [];

db.query("SELECT * FROM drug_list", (err , res) => {
    if(err){
        console.log("Error executing query", err.stack);
    }
    else{
        DrugList = res.rows;
    }

    db.end();
});

app.get("/search", (req, res) => {
    const searchTerm = req.query.q.toLowerCase(); // Get the query parameter
    const filteredDrugs = DrugList.filter(drug =>
        drug.name.toLowerCase().includes(searchTerm)
    );
    res.json(filteredDrugs); // Send filtered results as JSON
});

app.get("/all", (req, res) => {
    res.json(DrugList); // Send all medicines as JSON
});


app.get("/",(req, res) => {
    res.render("index.ejs", {DrugList: DrugList});
});

// About route
app.get("/about", (req, res) => {
    res.render("about.ejs");
});
//home page
app.get("/views/genmed.ejs" , (req, res) => {
    res.render("genmed.ejs", {});
})

// Contact route
app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});
    
app.get("/views/map.ejs" , (req, res) => {
    res.render("map.ejs");
});



import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyDq3OveM6a3WSxOiOWVuEVh2MWThWMKopc"; // Replace with your API key

app.get("/locate-store", async (req, res) => {
    const { lat, lng } = req.query; // Extract latitude and longitude from the query parameters

    if (!lat || !lng) {
        return res.status(400).json({ error: "Latitude and Longitude are required!" });
    }

    try {
        const response = await axios.get("https://maps.googleapis.com/maps/api/place/nearbysearch/json", {
            params: {
                location: `${lat},${lng}`,
                radius: 10000, // 5 km radius
                keyword: "Jan Aushadhi Kendra",
                key: GOOGLE_MAPS_API_KEY,
            },
        });

        const places = response.data.results.map(place => ({
            name: place.name,
            address: place.vicinity,
            location: place.geometry.location,
        }));

        res.json(places);
    } catch (error) {
        console.error("Error fetching nearby stores:", error);
        res.status(500).json({ error: "Failed to fetch nearby stores." });
    }
});



app.listen(3000, () => {
    console.log(`server running on port ${3000}`);
});
