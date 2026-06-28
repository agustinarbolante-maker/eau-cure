# Eau Cure - Water Station Delivery Tracker

A professional web application for tracking water delivery records in water station businesses. Stores delivery information with automatic timestamps and persistent database storage.

## Features

- 📝 **Form Input**: Record delivery details (Company, Bottles Delivered, Bottles Returned, DR Number)
- 📊 **Data Table**: View all past deliveries in an organized table
- ✏️ **Edit Records**: Modify existing delivery entries
- 🗑️ **Delete Records**: Remove entries with confirmation
- 🕐 **Automatic Timestamps**: Each entry is automatically timestamped
- 💾 **Persistent Storage**: SQLite database keeps data safe
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: SQLite3
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Port**: 3000

## Project Structure

```
eau-cure/
├── server.js              # Express server setup
├── database.js            # SQLite database operations
├── package.json           # Dependencies
├── data/
│   └── water_station.db   # SQLite database file (auto-created)
└── public/
    ├── index.html         # Main page UI
    ├── app.js             # Frontend logic
    └── styles.css         # Styling
```

## Installation & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

The application will start on `http://localhost:3000`

### 3. Access the Application
Open your browser and go to:
```
http://localhost:3000
```

## How to Use

### Adding a Delivery
1. Fill in the form fields:
   - **Company Delivered**: Name of the company
   - **Number of Bottles Delivered**: Quantity delivered
   - **Number of Bottles Returned**: Quantity returned
   - **DR Number**: Delivery Receipt number
2. Click **Add Delivery**
3. The entry appears in the table below with an automatic timestamp

### Editing a Delivery
1. Click the **Edit** button on any entry
2. Update the information in the modal dialog
3. Click **Save Changes**
4. The database is updated immediately

### Deleting a Delivery
1. Click the **Delete** button on any entry
2. Confirm the deletion when prompted
3. The entry is permanently removed from the database

## Database Schema

**deliveries table:**
- `id`: Integer (Primary Key, Auto-increment)
- `company`: Text (required)
- `bottles_delivered`: Integer (required)
- `bottles_returned`: Integer (required)
- `dr_number`: Text (required)
- `timestamp`: DateTime (auto-set to current time)

## API Endpoints

### Get All Deliveries
```
GET /api/deliveries
```

### Add New Delivery
```
POST /api/deliveries
Body: { company, bottlesDelivered, bottlesReturned, drNumber }
```

### Update Delivery
```
PUT /api/deliveries/:id
Body: { company, bottlesDelivered, bottlesReturned, drNumber }
```

### Delete Delivery
```
DELETE /api/deliveries/:id
```

## Development

To run in development mode with automatic restart:
```bash
npm run dev
```

## Data Persistence

All data is stored in `data/water_station.db` - a SQLite database file that persists even after closing the application.

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

MIT
