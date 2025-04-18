import pandas as pd
import os
from manuf import manuf
from mac_vendor_lookup import MacLookup
from netaddr import EUI, NotRegisteredError

parser_manuf = manuf.MacParser()
mac_lookup = MacLookup()

def get_best_vendor(mac_addr):
    results = []

    # 1. manuf
    vendor_manuf = parser_manuf.get_manuf(mac_addr)
    if vendor_manuf:
        results.append(vendor_manuf)

    # 2. mac-vendor-lookup
    try:
        vendor_lookup = mac_lookup.lookup(mac_addr)
        if vendor_lookup:
            results.append(vendor_lookup)
    except Exception:
        pass  # 무시

    # 3. netaddr
    try:
        vendor_netaddr = str(EUI(mac_addr).oui)
        results.append(vendor_netaddr)
    except NotRegisteredError:
        pass


    if results:
        # 가장 긴 이름 (자세한 것) 선택
        return max(results, key=len)
    return None

# 폴더 경로
input_folder = './files'
output_folder = './results'

# 결과 폴더가 없으면 생성
os.makedirs(output_folder, exist_ok=True)

# MAC vendor 파서 생성
parser = manuf.MacParser()

# 새롭게 발견된 OUI 목록 저장용
seen_ouis = set()
new_ouis = []

# 기존 vendor/oui 계산 함수 내에서 일부 로직 이동
def get_vendor_and_oui(row):
    if row['multi'] == 'IP' and pd.notna(row['mac_addr']):
        mac = str(row['mac_addr']).strip().replace(':', '').replace('-', '').upper()
        oui = mac[:6] if len(mac) >= 6 else None
        vendor = get_best_vendor(row['mac_addr'])

        if oui and vendor and oui not in seen_ouis:
            seen_ouis.add(oui)
            new_ouis.append({
                'oui': f"'{oui}'",
                'vendor': vendor,
                'mac_addr': row['mac_addr']
            })
        return pd.Series({'vendor': vendor, 'oui': f"'{oui}'"})
    return pd.Series({'vendor': None, 'oui': None})

# files 폴더 안의 모든 엑셀/CSV 파일 처리
for file_name in os.listdir(input_folder):
    print(f"📄 처리 중: {file_name}")
    input_path = os.path.join(input_folder, file_name)
    output_path = os.path.join(output_folder, f"result_{file_name}")

    try:
        if file_name.endswith('.xlsx'):
            df = pd.read_excel(input_path, engine='openpyxl')
        elif file_name.endswith('.csv'):
            df = pd.read_csv(input_path)
        else:
            print(f"❌ 지원하지 않는 형식: {file_name}")
            continue

        # 'multi'가 'IP'인 행만 필터링
        df = df[df['multi'] == 'IP'].copy()

        # vendor, oui 열 추가
        df[['vendor', 'oui']] = df.apply(get_vendor_and_oui, axis=1)

        # vendor가 존재하는 행만 필터링
        df = df[pd.notna(df['vendor'])]

        # 결과 저장
        if file_name.endswith('.xlsx'):
            df.to_excel(output_path, index=False)
        else:
            df.to_csv(output_path, index=False, encoding='utf-8-sig')

        print(f"✅ 완료: {file_name} → results 폴더에 저장됨")

    except Exception as e:
        print(f"⚠️ 오류 발생 ({file_name}): {e}")

# 중복 없는 새로운 OUI 목록 저장
if new_ouis:
    new_oui_df = pd.DataFrame(new_ouis)
    new_oui_df.to_csv(os.path.join(output_folder, 'new_ouis.csv'), index=False, encoding='utf-8-sig')
    print(f"🆕 신규 OUI {len(new_ouis)}개 → new_ouis.csv에 저장됨")
else:
    print("📭 신규 OUI 없음")
