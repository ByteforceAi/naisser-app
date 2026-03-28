import csv
import json

INPUT = r'C:\Users\oceantowerPD\Downloads\전국초중등학교위치표준데이터.csv'
OUTPUT = r'C:\Users\oceantowerPD\NAISSER\naisser-app\scripts\schools.json'

schools = []
with open(INPUT, 'r', encoding='cp949') as f:
    reader = csv.DictReader(f)
    print("Headers:", reader.fieldnames)
    for row in reader:
        status = row.get('운영상태', '')
        if status != '운영':
            continue
        school = {
            'schoolCode': row.get('학교ID', ''),
            'name': row.get('학교명', ''),
            'level': row.get('학교급구분', ''),
            'address': row.get('소재지도로명주소', '') or row.get('소재지지번주소', ''),
            'sido': row.get('시도교육청명', ''),
            'district': row.get('교육지원청명', ''),
            'latitude': row.get('위도', ''),
            'longitude': row.get('경도', ''),
        }
        schools.append(school)

print(f"Total operating schools: {len(schools)}")
print(f"Sample: {schools[0]}")

with open(OUTPUT, 'w', encoding='utf-8') as f:
    json.dump(schools, f, ensure_ascii=False, indent=0)

print(f"Written to {OUTPUT}")