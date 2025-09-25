# Jal Drishti

## Frontend

```bash
cd client
npm install
npm run dev
```

## Backend

```bash
cd server
npm install
npm run dev
```

### Hamlet Mapping & Asset Relinking

Endpoints:

- GET `/api/hamlets/:id`
- PUT `/api/hamlets/:id` body: `{ geom: GeoJSON }`
- POST `/api/hamlets/:id/preview-relink` body: `{ geom: GeoJSON }`
- POST `/api/hamlets/:id/relink`

Server validates geometries with `ST_IsValid` and `ST_MakeValid`. Relink runs in a transaction and uses parameterized SQL.

## PostgreSQL Setup

1. Install PostgreSQL.
2. Create database:
   ```sql
   CREATE DATABASE jal_drishti;
   ```
3. Run schema SQL:
   ```bash
   psql -U username -d jal_drishti -f ./database/init.sql
   ```
   psql -U username -d jal_drishti -f ./database/init.sql
   ```

## API Examples

### Get Hamlet
```bash
curl -X GET http://localhost:3000/api/hamlets/1
```

### Update Hamlet
```bash
curl -X PUT http://localhost:3000/api/hamlets/1 \
  -H "Content-Type: application/json" \
  -d '{"properties":{"name":"New Hamlet","hamlet_code":"H002","population":200,"avg_demand_lpcd":50,"notes":"Updated"},"geometry":{"type":"MultiPolygon","coordinates":[[[[78,22],[78.1,22],[78.1,22.1],[78,22.1],[78,22]]]]}}'
```

### Preview Relink
```bash
curl -X POST http://localhost:3000/api/hamlets/1/preview-relink \
  -H "Content-Type: application/json" \
  -d '{"geometry":{"type":"MultiPolygon","coordinates":[[[[78,22],[78.1,22],[78.1,22.1],[78,22.1],[78,22]]]]}}'
```

### Relink Now
```bash
curl -X POST http://localhost:3000/api/hamlets/1/relink \
  -H "Content-Type: application/json" \
  -d '{"geometry":{"type":"MultiPolygon","coordinates":[[[[78,22],[78.1,22],[78.1,22.1],[78,22.1],[78,22]]]]}}'
```

## Sample PUT Payload

```json
{
  "properties": {
    "name": "Hamlet Name",
    "hamlet_code": "H001",
    "population": 150,
    "avg_demand_lpcd": 45,
    "notes": "Some notes"
  },
  "geometry": {
    "type": "MultiPolygon",
    "coordinates": [
      [
        [
          [78,22],[78.1,22],[78.1,22.1],[78,22.1],[78,22]
        ]
      ]
    ]
  }
}
```
