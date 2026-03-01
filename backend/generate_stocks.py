import yfinance as yf
import json
import time
import os

def generate_stock_list():
    # BİST Hisseleri
    bist_string = "A,ACSEL,ADEL,ADESE,AEFES,AFYON,AGESA,AGHOL,AGYO,AHGAZ,AKBNK,AKCNS,AKENR,AKFGY,AKFYE,AKGRT,AKMGY,AKSA,AKSEN,AKSGY,ALARK,ALBRK,ALCAR,ALCTL,ALFAS,ALKA,ALKIM,ALMAD,ALTNY,ALVES,AMATV,ANGEN,ANHYT,ANSGR,ARASE,ARCLK,ARDYZ,ARENA,ARSAN,ARZUM,ASELS,ASGYO,ASTOR,ASUZU,ATAGY,ATAKP,ATPCP,ATQSY,AVGYO,AVHOL,AVOD,AYCES,AYDEM,AYEN,AYES,AYGAZ,AZTEK,BAGFS,BAKAB,BALAT,BANVT,BARMA,BASGZ,BASRZ,BEYAZ,BFREN,BIENY,BIGCH,BIMAS,BINHO,BIOEN,BIZIM,BJKAS,BLTYS,BNTAS,BOBET,BOSSA,BRISA,BRKO,BRKSN,BRKVY,BRLSM,BRMEN,BRYAT,BSOKE,BTCIM,BUCIM,BURCE,BURVA,BVSAN,BYDNR,CANTE,CASA,CCOLA,CELHA,CEMAS,CEMTS,CEOEM,CATES,CIMENTAS,CIMSA,CLEBI,CMBTN,CMENT,CONSE,COSMO,CRDFA,CRFSA,CUSAN,CVKMD,CWENE,DAGHL,DAGI,DAPGM,DARDL,DGGYO,DGNMO,DIRIT,DITAS,DMSAS,DNISI,DOAS,DOCO,DOFER,DOGUB,DOHOL,DOKTA,DPC,DURDO,DYOBY,DZGYO,EBEBK,ECILC,ECZYT,EDATA,EDIP,EEEN,EFELER,EGEEN,EGEPO,EGESER,EGGUB,EGPRO,EKGYO,EKIZ,EKOS,EKSUN,ELITE,EMANU,EMKEL,ENERY,ENJSA,ENKAI,EPLAS,ERBOS,EREGL,ERSU,ESCAR,ESCOM,ESEN,ETILR,ETYAT,EUHOL,EUKYO,EURYO,EUPWR,EYGYO,FADE,FENER,FLAP,FMIZP,FONET,FORMT,FORTE,FRIGO,FROTO,FZLGY,GARAN,GARFA,GENTS,GEREL,GESAN,GIPTA,GLBMD,GLCVY,GLRYH,GLYHO,GMTAS,GOKNR,GOLTS,GOODY,GOZDE,GRNYO,GRSEL,GSDDE,GSDHO,GSRAY,GUBRF,GWIND,GZNMI,HALKB,HATEK,HATSN,HDM,HEKTAS,HLGYO,HTTBT,HUBVC,HUNER,HURGZ,ICBCT,IDEAS,IDGYO,IHAAS,IHEVA,IHGZT,IHLAS,IHLGM,IHYAY,IMASM,INDES,INFO,INGEN,INTC,INTEM,INVEO,INVES,IPEKE,ISBIR,ISBTR,ISCTR,ISDMR,ISFIN,ISGSY,ISGYO,ISKPL,ISMEN,ISSEN,ITEOS,IZMDC,IZINV,JANTS,KAPLM,KAREL,KARSN,KARTN,KARYE,KATMR,KCAER,KCHOL,KENT,KERV,KERVN,KFEIN,KGYO,KIMMR,KLGYO,KLKIM,KLNMA,KLRHO,KLSER,KLSYN,KMPUR,KNFRT,KOCMT,KONKA,KONTR,KONYA,KOPOL,KORDS,KOZAA,KOZAL,KRDMA,KRDMB,KRDMD,KRGYO,KRONT,KRPLS,KRTEK,KRVGD,KSTUR,KTLEV,KTSKR,KUTPO,KUVVA,KUYAS,KZBGY,KZGYO,LIDFA,LINK,LKMNH,LOGO,LRSHO,LUKSK,MAALT,MACKO,MAKIM,MAKTK,MANAS,MARKA,MARTI,MAVI,MAXVA,MEDTR,MEGAT,MEPET,MERCN,MERIT,MERKO,METRO,METUR,MGROS,MIATK,MIA,MHRGY,MIPA,MTRKS,MTS,MUGAR,NATHL,NATEN,NETAS,NIBAS,NTGAZ,NTHOL,NUGYO,NUHCM,OBASE,OBSA,ODAS,OFSYM,OLMIP,ONCSM,ORCA,ORGE,ORMA,OSMEN,OSTIM,OYAKC,OYAYO,OYLUM,OZGYO,OZKGY,OZRDN,OZSUB,PATEK,PCILT,PEGYO,PEKGY,PENGD,PENRO,PENTA,PETKM,PETUN,PGSUS,PINSU,PKART,PKENT,PNLK,PNLSN,POLHO,POLTK,PRDGS,PRKAB,PRKME,PRZMA,PSGYO,QNBFB,QNBFL,QUAGR,RALYH,RAYSG,REEDR,RNPOL,ROE,RTALB,RUBNS,RYGYO,RYSAS,SAHOL,SAMAT,SANEL,SANFM,SANKO,SARKY,SASA,SAYAS,SEKUR,SELEC,SELGD,SELVA,SEMA,SERVE,SEYKM,SILVR,SISE,SKBNK,SKTAS,SMART,SMRTG,SNDOC,SNGYO,SNICA,SNRGY,SOKM,SONME,SRVGY,SUWEN,TABGD,TARKM,TATEN,TATGD,TAVHL,TBORG,TCELL,TEKTU,TERPA,TETMT,TEZOL,TGSAS,THYAO,TKFEN,TKNSA,TLMAN,TMPOL,TMSN,TOASO,TRCAS,TRENT,TRGYO,TRILC,TSGYO,TSKB,TSPOR,TTKOM,TTRAK,TUCLK,TUKAS,TUPRS,TUREX,TURGG,TURSG,UCAK,UFUK,ULAS,ULKER,ULUSE,ULUUN,UMPAS,UNLU,USAK,UZERB,VAKBN,VAKFN,VAKKO,VANGD,VBTYZ,VERUS,VESBE,VESTL,VKGYO,VKING,VRGYO,YAPRK,YATAS,YAYLA,YBTAS,YGGYO,YGYO,YKBNK,YKSLN,YONGA,YUNSA,YYAPI,ZEDUR,ZOREN,ZRGYO"
    
    tickers = bist_string.split(',')
    stock_list = []
    
    print(f"Toplam {len(tickers)} hisse işlenecek. Bu işlem birkaç dakika sürebilir...")
    
    for count, ticker in enumerate(tickers, 1):
        symbol = f"{ticker}.IS"
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            # longName yoksa shortName dene, o da yoksa sadece kodu kullan
            name = info.get('longName') or info.get('shortName') or ticker
            
            stock_data = {
                "symbol": symbol,
                "code": ticker,
                "name": name
            }
            stock_list.append(stock_data)
            print(f"[{count}/{len(tickers)}] Başarılı: {ticker} -> {name}")
            
        except Exception as e:
            print(f"[{count}/{len(tickers)}] HATA: {ticker} çekilemedi. ({e})")
            # Hata olsa bile listeye fallback isimle ekleyelim ki arama çalışsın
            stock_list.append({
                "symbol": symbol,
                "code": ticker,
                "name": ticker
            })
            
        # Rate limit yememek için kısa bekleme
        time.sleep(0.1)

    # Output dosyası yolu (frontend klasörüne)
    # script backend içinde çalıştığı için ../frontend yolunu izliyoruz.
    current_dir = os.path.dirname(os.path.abspath(__file__))
    frontend_data_dir = os.path.join(current_dir, '..', 'frontend', 'src', 'data')
    
    # Dizin yoksa oluştur
    os.makedirs(frontend_data_dir, exist_ok=True)
    
    output_path = os.path.join(frontend_data_dir, 'stocks.ts')
    
    # Typescript formatında kaydet
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('export const STOCK_LIST = ')
        json.dump(stock_list, f, ensure_ascii=False, indent=4)
        f.write(';\n')
        
    print(f"\nİşlem Tamamlandı! Veriler {output_path} konumuna kaydedildi.")

if __name__ == "__main__":
    generate_stock_list()