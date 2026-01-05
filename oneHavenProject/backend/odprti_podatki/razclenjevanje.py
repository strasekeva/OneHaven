from pyaxis import pyaxis
import json

def parse_px_with_pyaxis(file_path, output_file):
    try:
        # Naložimo PC-Axis datoteko z ustreznim kodiranjem
        px = pyaxis.parse(file_path, encoding='windows-1250', lang='sl')

        # Pretvorimo DataFrame v seznam slovarjev
        if 'DATA' in px:
            data = px['DATA'].to_dict(orient='records')  # Pretvori DataFrame v seznam slovarjev
        else:
            data = []

        # Preverimo, ali so metapodatki prisotni
        metadata = px.get('METADATA', {})

        # Preverimo, ali so prevodi prisotni
        translations = px.get('TRANSLATION', {})

        # Združimo vse v eno strukturo
        output = {
            "metadata": metadata,
            "data": data,
            "translations": translations
        }

        # Shranimo kot JSON
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(output, json_file, indent=4, ensure_ascii=False)
        print(f"Podatki so shranjeni v datoteko: {output_file}")

    except Exception as e:
        print(f"Napaka pri obdelavi datoteke z Pyaxis: {e}")

# Pot do datoteke
file_path = "odprti_podatki/1822303S.PX"  # Pot do vaše PC-Axis datoteke
output_file = "output_pyaxis.json"  # Ime izhodne JSON datoteke

# Klic funkcije za obdelavo
parse_px_with_pyaxis(file_path, output_file)