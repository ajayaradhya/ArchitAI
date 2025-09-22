import sqlite3

# Path to your SQLite DB file (adjust if different)
db_path = "app.db"  

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute("DROP TABLE IF EXISTS sessions;")
conn.commit()
conn.close()

print("Dropped sessions table successfully.")
