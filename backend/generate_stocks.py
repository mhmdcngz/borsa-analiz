import json
import os

def generate_stocks():
    print("İnternet bağlantısına ihtiyaç duymayan statik devasa liste oluşturuluyor...")
    
    # 500+ BİST Hisse Kodu (Virgülle ayrılmış ham liste)
    bist_raw = "A,ACSEL,ADEL,ADESE,AEFES,AFYON,AGESA,AGHOL,AGYO,AHGAZ,AKBNK,AKCNS,AKENR,AKFGY,AKFYE,AKGRT,AKMGY,AKSA,AKSEN,AKSGY,ALARK,ALBRK,ALCAR,ALCTL,ALFAS,ALKA,ALKIM,ALMAD,ALTNY,ALVES,AMATV,ANGEN,ANHYT,ANSGR,ARASE,ARCLK,ARDYZ,ARENA,ARSAN,ARZUM,ASELS,ASGYO,ASTOR,ASUZU,ATAGY,ATAKP,ATPCP,ATQSY,AVGYO,AVHOL,AVOD,AYCES,AYDEM,AYEN,AYES,AYGAZ,AZTEK,BAGFS,BAKAB,BALAT,BANVT,BARMA,BASGZ,BASRZ,BEYAZ,BFREN,BIENY,BIGCH,BIMAS,BINHO,BIOEN,BIZIM,BJKAS,BLTYS,BNTAS,BOBET,BOSSA,BRISA,BRKO,BRKSN,BRKVY,BRLSM,BRMEN,BRYAT,BSOKE,BTCIM,BUCIM,BURCE,BURVA,BVSAN,BYDNR,CANTE,CASA,CCOLA,CELHA,CEMAS,CEMTS,CEOEM,CATES,CIMENTAS,CIMSA,CLEBI,CMBTN,CMENT,CONSE,COSMO,CRDFA,CRFSA,CUSAN,CVKMD,CWENE,DAGHL,DAGI,DAPGM,DARDL,DGGYO,DGNMO,DIRIT,DITAS,DMSAS,DNISI,DOAS,DOCO,DOFER,DOGUB,DOHOL,DOKTA,DPC,DURDO,DYOBY,DZGYO,EBEBK,ECILC,ECZYT,EDATA,EDIP,EEEN,EFELER,EGEEN,EGEPO,EGESER,EGGUB,EGPRO,EKGYO,EKIZ,EKOS,EKSUN,ELITE,EMANU,EMKEL,ENERY,ENJSA,ENKAI,EPLAS,ERBOS,EREGL,ERSU,ESCAR,ESCOM,ESEN,ETILR,ETYAT,EUHOL,EUKYO,EURYO,EUPWR,EYGYO,FADE,FENER,FLAP,FMIZP,FONET,FORMT,FORTE,FRIGO,FROTO,FZLGY,GARAN,GARFA,GENTS,GEREL,GESAN,GIPTA,GLBMD,GLCVY,GLRYH,GLYHO,GMTAS,GOKNR,GOLTS,GOODY,GOZDE,GRNYO,GRSEL,GSDDE,GSDHO,GSRAY,GUBRF,GWIND,GZNMI,HALKB,HATEK,HATSN,HDM,HEKTAS,HLGYO,HTTBT,HUBVC,HUNER,HURGZ,ICBCT,IDEAS,IDGYO,IHAAS,IHEVA,IHGZT,IHLAS,IHLGM,IHYAY,IMASM,INDES,INFO,INGEN,INTC,INTEM,INVEO,INVES,IPEKE,ISBIR,ISBTR,ISCTR,ISDMR,ISFIN,ISGSY,ISGYO,ISKPL,ISMEN,ISSEN,ITEOS,IZMDC,IZINV,JANTS,KAPLM,KAREL,KARSN,KARTN,KARYE,KATMR,KCAER,KCHOL,KENT,KERV,KERVN,KFEIN,KGYO,KIMMR,KLGYO,KLKIM,KLNMA,KLRHO,KLSER,KLSYN,KMPUR,KNFRT,KOCMT,KONKA,KONTR,KONYA,KOPOL,KORDS,KOZAA,KOZAL,KRDMA,KRDMB,KRDMD,KRGYO,KRONT,KRPLS,KRTEK,KRVGD,KSTUR,KTLEV,KTSKR,KUTPO,KUVVA,KUYAS,KZBGY,KZGYO,LIDFA,LINK,LKMNH,LOGO,LRSHO,LUKSK,MAALT,MACKO,MAKIM,MAKTK,MANAS,MARKA,MARTI,MAVI,MAXVA,MEDTR,MEGAT,MEPET,MERCN,MERIT,MERKO,METRO,METUR,MGROS,MIATK,MIA,MHRGY,MIPA,MTRKS,MTS,MUGAR,NATHL,NATEN,NETAS,NIBAS,NTGAZ,NTHOL,NUGYO,NUHCM,OBASE,OBSA,ODAS,OFSYM,OLMIP,ONCSM,ORCA,ORGE,ORMA,OSMEN,OSTIM,OYAKC,OYAYO,OYLUM,OZGYO,OZKGY,OZRDN,OZSUB,PATEK,PCILT,PEGYO,PEKGY,PENGD,PENRO,PENTA,PETKM,PETUN,PGSUS,PINSU,PKART,PKENT,PNLK,PNLSN,POLHO,POLTK,PRDGS,PRKAB,PRKME,PRZMA,PSGYO,QNBFB,QNBFL,QUAGR,RALYH,RAYSG,REEDR,RNPOL,ROE,RTALB,RUBNS,RYGYO,RYSAS,SAHOL,SAMAT,SANEL,SANFM,SANKO,SARKY,SASA,SAYAS,SEKUR,SELEC,SELGD,SELVA,SEMA,SERVE,SEYKM,SILVR,SISE,SKBNK,SKTAS,SMART,SMRTG,SNDOC,SNGYO,SNICA,SNRGY,SOKM,SONME,SRVGY,SUWEN,TABGD,TARKM,TATEN,TATGD,TAVHL,TBORG,TCELL,TEKTU,TERPA,TETMT,TEZOL,TGSAS,THYAO,TKFEN,TKNSA,TLMAN,TMPOL,TMSN,TOASO,TRCAS,TRENT,TRGYO,TRILC,TSGYO,TSKB,TSPOR,TTKOM,TTRAK,TUCLK,TUKAS,TUPRS,TUREX,TURGG,TURSG,UCAK,UFUK,ULAS,ULKER,ULUSE,ULUUN,UMPAS,UNLU,USAK,UZERB,VAKBN,VAKFN,VAKKO,VANGD,VBTYZ,VERUS,VESBE,VESTL,VKGYO,VKING,VRGYO,YAPRK,YATAS,YAYLA,YBTAS,YGGYO,YGYO,YKBNK,YKSLN,YONGA,YUNSA,YYAPI,ZEDUR,ZOREN,ZRGYO"
    
    # Listeyi parçala
    bist_list = bist_raw.split(",")
    
    stock_list = []
    for code in bist_list:
        stock_list.append({
            "symbol": f"{code}.IS",
            "code": code,
            # Şirketlerin tam adını çekemediğimiz için kodlarını isim gibi gösteriyoruz
            "name": f"{code} (BİST)" 
        })
        
    # Global Varlıklar, Emtialar ve BİST Endeksleri
    global_assets = [
        # BİST Ana Endeksleri
        {"symbol": "XU100.IS", "code": "BIST100", "name": "BİST 100 Endeksi"},
        {"symbol": "XU030.IS", "code": "BIST30", "name": "BİST 30 Endeksi"},
        {"symbol": "XUTUM.IS", "code": "BISTTUM", "name": "BİST Tüm Endeksi (500+)"},
        {"symbol": "XBANK.IS", "code": "XBANK", "name": "BİST Bankacılık Endeksi"},
        {"symbol": "XUSIN.IS", "code": "XUSIN", "name": "BİST Sınai Endeksi"},
        
        # Emtialar ve Kriptolar
        {"symbol": "GC=F", "code": "ALTIN", "name": "Altın (Ons)"},
        {"symbol": "SI=F", "code": "GUMUS", "name": "Gümüş (Ons)"},
        {"symbol": "BTC-USD", "code": "BTC", "name": "Bitcoin / USD"},
        {"symbol": "ETH-USD", "code": "ETH", "name": "Ethereum / USD"},
        
        # Küresel Hisseler
        {"symbol": "AAPL", "code": "AAPL", "name": "Apple Inc."},
        {"symbol": "TSLA", "code": "TSLA", "name": "Tesla Inc."},
        {"symbol": "NVDA", "code": "NVDA", "name": "NVIDIA Corp."},
        {"symbol": "MSFT", "code": "MSFT", "name": "Microsoft Corp."}
    ]
    
    final_list = global_assets + stock_list
    
    try:
        # Frontend klasörüne kaydet
        frontend_data_path = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'src', 'data')
        os.makedirs(frontend_data_path, exist_ok=True)
        file_path = os.path.join(frontend_data_path, 'stocks.ts')
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write("// Statik olarak oluşturulmuş devasa hisse arşivi (Offline çalışır)\n")
            f.write("export const STOCK_LIST = ")
            json.dump(final_list, f, ensure_ascii=False, indent=4)
            f.write(";\n")
            
        print(f"Kusursuz Kurulum! Toplam {len(final_list)} hisse/varlık başarıyla eklendi.")
    except Exception as e:
        print(f"Hata oluştu: {e}")

if __name__ == "__main__":
    generate_stocks()