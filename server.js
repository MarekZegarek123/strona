const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const cors = require('cors');
app.use(cors());

// Middleware do parsowania JSON
app.use(bodyParser.json());

// Statyczne pliki (np. index.html, dane.json)
app.use(express.static(path.join(__dirname)));

// Endpoint do dodawania nowego harmonogramu
app.post('/add-schedule', (req, res) => {
    const newEntry = req.body;

    // Odczytujemy obecny harmonogram z pliku
    fs.readFile('./dane.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        const schedule = JSON.parse(data);

        // Sprawdzamy, czy dana osoba już istnieje w harmonogramie
        const person = schedule.find(p => p.name === newEntry.name);

        if (person) {
            // Jeśli istnieje, dodajemy nowy wpis do jej harmonogramu
            person.schedule.push({
                day: newEntry.day,
                start: newEntry.start,
                end: newEntry.end
            });
        } else {
            // Jeśli nie istnieje, dodajemy nową osobę z harmonogramem
            schedule.push({
                name: newEntry.name,
                status: "unavailable", // Automatyczne ustawienie statusu na "unavailable"
                schedule: [{
                    day: newEntry.day,
                    start: newEntry.start,
                    end: newEntry.end
                }]
            });
        }

        // Zapisujemy zaktualizowany harmonogram do pliku
        console.log(JSON.stringify(schedule, null, 2));
        fs.writeFile('./dane.json', JSON.stringify(schedule, null, 2), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: 'Nie udało się zapisać danych.' });
            }

            res.status(200).json({ message: 'Harmonogram zaktualizowany.' });
        });
    });
});

// Endpoint do zmiany statusu
app.post('/change-status', (req, res) => {
    const { name, status } = req.body;

    // Odczytujemy obecny harmonogram z pliku
    fs.readFile('./dane.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Błąd serwera.' });
        }

        const schedule = JSON.parse(data);

        // Sprawdzamy, czy dana osoba już istnieje w harmonogramie
        const person = schedule.find(p => p.name === name);

        if (person) {
            // Jeśli osoba istnieje, aktualizujemy jej status
            person.status = status;

            // Zapisujemy zaktualizowany harmonogram do pliku
            fs.writeFile('./dane.json', JSON.stringify(schedule, null, 2), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ message: 'Nie udało się zapisać danych.' });
                }

                res.status(200).json({ message: 'Status został zaktualizowany.' });
            });
        } else {
            // Jeśli osoba nie istnieje, zwracamy błąd
            res.status(404).json({ message: 'Osoba nie znaleziona w harmonogramie.' });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
});
