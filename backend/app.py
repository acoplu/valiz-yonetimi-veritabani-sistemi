import json

from flask import Flask, jsonify, request
import psycopg2
from flask_cors import CORS
import sys

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

# Add CORS support
CORS(app, resources={r"/*": {"origins": "*"}})

# PostgreSQL database configuration
DB_CONFIG = {
    'dbname': 'study_372',
    'user': 'postgres',
    'password': '314314',
    'host': 'localhost',
    'port': 5432
}
sys.stdout.reconfigure(encoding='utf-8')

# Connect to the database
def get_db_connection():
    """Establish and configure the database connection."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()
        cursor.execute("SET search_path TO bil372_project;")  # Set the search path
        cursor.execute("SET client_encoding TO 'UTF8';")  # Set encoding to UTF-8
        conn.commit()
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        return None


# Valizleri listeleme API'si
@app.route('/api/valizler', methods=['GET'])
def valizleri_getir():
    """Fetch all luggage records."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    query = "SELECT * FROM VALIZ;"
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    valiz_listesi = [
        {
            "id": row[0],
            "yolcu_id": row[1],
            "agirlik": row[4],
            "boyutlar": row[5],
            "durum": row[7]
        } for row in rows
    ]

    return jsonify(valiz_listesi)

@app.route('/api/valizekle', methods=['POST'])
def valiz_ekle():
    """Add new baggage."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        data = request.get_json()  # Parse the incoming JSON request body
        yolcu_id = data['yolcu_id']
        ucus_id = data.get('ucus_id')  # Assuming ucus_id should be included as well
        agirlik = data['agirlik']
        renk = data.get('renk', 'Bilinmiyor')  # Default to 'Bilinmiyor' if renk not provided
        durum = data['durum']
        boyutlar = data['boyutlar']

        # Parse boyutlar string (e.g., "5x5x5") to JSON format
        try:
            height, width, depth = boyutlar.split('x')
            boyutlar_json = json.dumps({
                "height": height,
                "width": width,
                "depth": depth
            })
        except ValueError:
            return jsonify({'error': 'Invalid format for boyutlar. Expected format is heightxwidthxdepth.'}), 400

        # Insert data into the database
        query = """
            INSERT INTO VALIZ (yolcu_id, ucus_id, agirlik, renk, durum, boyutlar)
            VALUES (%s, %s, %s, %s, %s, %s);
        """
        cursor = conn.cursor()
        cursor.execute(query, (yolcu_id, ucus_id, agirlik, renk, durum, boyutlar_json))
        conn.commit()

    except KeyError as e:
        return jsonify({'error': f'Missing required parameter: {str(e)}'}), 400
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify({'message': 'Baggage added successfully'}), 201


@app.route('/api/valizsorgu', methods=['POST'])
def valiz_sorgu():
    """Query baggage based on passenger ID."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    try:
        data = request.get_json()  # Parse the incoming JSON request body
        if 'yolcu_id' not in data:
            return jsonify({'error': 'Missing required parameter: yolcu_id'}), 400

        yolcu_id = data['yolcu_id']

        # Query the database for baggage based on the provided passenger ID
        query = """
            SELECT valiz_id, ucus_id, agirlik, renk, durum, boyutlar
            FROM VALIZ
            WHERE yolcu_id = %s;
        """
        cursor = conn.cursor()
        cursor.execute(query, (yolcu_id,))
        rows = cursor.fetchall()

        # Prepare the response data
        valiz_listesi = [
            {
                "valiz_id": row[0],
                "ucus_id": row[1],
                "agirlik": row[2],
                "renk": row[3],
                "durum": row[4],
                "boyutlar": row[5]
            } for row in rows
        ]

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

    return jsonify(valiz_listesi), 200

# Flight listing API
@app.route('/api/ucus', methods=['GET'])
def ucuslari_getir():
    """Fetch all flight records."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    query = """
        SELECT UCUS_ID, KALKIS_ZAMANI, VARIS_ZAMANI, HK.ISIM AS KALKIS_HAVALIMANI, HV.ISIM AS VARIS_HAVALIMANI
        FROM UCUS U
        JOIN HAVALIMANI HV ON U.VARIS_HAVALIMANI_ID = HV.HAVALIMANI_ID
        JOIN HAVALIMANI HK ON U.KALKIS_HAVALIMANI_ID = HK.HAVALIMANI_ID;
    """
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    ucus_listesi = [
        {
            "ucus_id": row[0],
            "kalkis_zamani": row[1],
            "varis_zamani": row[2],
            "kalkis_havalimani": row[3],
            "varis_havalimani": row[4]
        } for row in rows
    ]

    return jsonify(ucus_listesi)

# Tüm uçuşların valiz sayısını listeleyen API
@app.route('/api/valiz_sayisi', methods=['GET'])
def ucus_valiz_sayisi_getir():
    """Fetch all flights with luggage count."""
    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    query = """
        SELECT U.UCUS_ID, COUNT(V.VALIZ_ID) AS BAGGAGE_COUNT
        FROM UCUS U
        LEFT JOIN VALIZ V ON U.UCUS_ID = V.UCUS_ID
        GROUP BY U.UCUS_ID;
    """
    cursor = conn.cursor()
    cursor.execute(query)
    rows = cursor.fetchall()
    conn.close()

    valiz_sayisi_listesi = [
        {
            "ucus_id": row[0],
            "baggage_count": row[1]
        } for row in rows
    ]

    return jsonify(valiz_sayisi_listesi)

# Uçuş ID'sine göre valiz listeleme
@app.route('/api/ucus_valiz_listesi', methods=['GET'])
def ucus_valiz_listesi():
    """Fetch all luggage for a specific flight based on flight ID."""
    ucus_id = request.args.get('ucus_id')  # Uçuş ID'yi URL parametresi olarak alıyoruz
    if not ucus_id:
        return jsonify({'error': 'Uçuş ID parametresi eksik'}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({'error': 'Database connection failed'}), 500

    query = """
        SELECT V.VALIZ_ID, Y.ISIM, Y.SOYISIM, V.AGIRLIK, V.BOYUTLAR, V.RENK, V.DURUM
        FROM VALIZ as V
        JOIN UCUS AS U ON V.ucus_id = U.ucus_id
        JOIN YOLCU AS Y ON V.YOLCU_ID = Y.YOLCU_ID
        WHERE V.UCUS_ID = %s;
    """
    cursor = conn.cursor()
    cursor.execute(query, (ucus_id,))
    rows = cursor.fetchall()
    conn.close()

    ucus_valiz_listesi = [
        {
            "valiz_id": row[0],
            "isim": row[1],
            "soyisim": row[2],
            "agirlik": row[3],
            "boyutlar": row[4],
            "renk": row[5],
            "durum": row[6]
        } for row in rows
    ]

    return jsonify(ucus_valiz_listesi)

@app.route('/api/guvenlik_kontrolu', methods=['GET'])
def get_guvenlik_kontrolu():
    """Fetch all security checks for a specific luggage ID."""
    valiz_id = request.args.get('valiz_id')  # Retrieve the luggage ID from the query parameter
    if not valiz_id:
        return jsonify({"error": "VALIZ_ID is required"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        # SQL query to fetch security checks for the given VALIZ_ID
        query = """
        SELECT G.ZAMAN, G.SONUC, G.DETAYLAR, P.ISIM AS PERSONEL_ISIM, P.SOYISIM AS PERSONEL_SOYISIM
        FROM GUVENLIK_KONTROLU G
                 JOIN PERSONEL P ON G.PERSONEL_ID = P.PERSONEL_ID
        WHERE G.VALIZ_ID = %s;
        """
        cursor = conn.cursor()
        cursor.execute(query, (valiz_id,))
        rows = cursor.fetchall()

        # Format the results into a list of dictionaries
        guvenlik_kontrolu_listesi = [
            {
                "zaman": row[0],
                "sonuc": row[1],
                "detaylar": row[2],
                "personel_isim": row[3],
                "personel_soyisim": row[4]
            }
            for row in rows
        ]

        return jsonify(guvenlik_kontrolu_listesi), 200

    except Exception as e:
        conn.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()


@app.route('/api/durum', methods=['GET'])
def durum_sorgula():
    valiz_id = request.args.get('valiz_id')

    if not valiz_id:
        return jsonify({"error": "Valiz ID is required"}), 400

    # Veritabanı bağlantısı aç
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Failed to connect to the database"}), 500

    try:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT D.DURUM, D.ZAMAN, K.ISIM AS KONUM, D.DETAYLAR
            FROM DURUM_GUNCELLEME D
            JOIN KONUM K ON D.KONUM_ID = K.KONUM_ID
            WHERE D.VALIZ_ID = %s
            ORDER BY D.ZAMAN DESC;
        """, (valiz_id,))

        rows = cursor.fetchall()

        # Eğer veritabanında sonuç varsa
        if rows:
            durumlar = [
                {
                    "durum": row[0],
                    "zaman": row[1],
                    "konum": row[2]
                } for row in rows
            ]
            return jsonify(durumlar)
        else:
            return jsonify({"message": "No updates found for the given baggage ID"}), 404

    except Exception as e:
        conn.rollback()  # Hata durumunda geri alma işlemi
        return jsonify({"error": f"Error occurred: {str(e)}"}), 500
    finally:
        conn.close()  # Bağlantıyı kapat





if __name__ == '__main__':
    app.run(debug=True)
