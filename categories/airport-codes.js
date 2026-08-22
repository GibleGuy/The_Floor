(function () {
    const TRANSPARENT_PIXEL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

    function item(code, name) {
        return { n: name, q: code, u: TRANSPARENT_PIXEL };
    }

    const airportCodesData = [
        // Tier 1 — Obvious (items 1–15)
        item("JFK", "NEW YORK (JFK)"),
        item("LAX", "LOS ANGELES (LAX)"),
        item("ATL", "ATLANTA (ATL)"),
        item("ORD", "CHICAGO O'HARE (ORD)"),
        item("DFW", "DALLAS/FORT WORTH (DFW)"),
        item("DEN", "DENVER (DEN)"),
        item("SFO", "SAN FRANCISCO (SFO)"),
        item("LAS", "LAS VEGAS (LAS)"),
        item("SEA", "SEATTLE (SEA)"),
        item("MCO", "ORLANDO (MCO)"),
        item("MIA", "MIAMI (MIA)"),
        item("BOS", "BOSTON (BOS)"),
        item("EWR", "NEWARK (EWR)"),
        item("PHX", "PHOENIX (PHX)"),
        item("IAH", "HOUSTON BUSH (IAH)"),

        // Tier 2 — Familiar (items 16–30)
        item("LHR", "LONDON HEATHROW (LHR)"),
        item("CDG", "PARIS CHARLES DE GAULLE (CDG)"),
        item("HND", "TOKYO HANEDA (HND)"),
        item("DXB", "DUBAI (DXB)"),
        item("SYD", "SYDNEY (SYD)"),
        item("YYZ", "TORONTO (YYZ)"),
        item("BNA", "NASHVILLE (BNA)"),
        item("AUS", "AUSTIN (AUS)"),
        item("SAN", "SAN DIEGO (SAN)"),
        item("HNL", "HONOLULU (HNL)"),
        item("SLC", "SALT LAKE CITY (SLC)"),
        item("DCA", "WASHINGTON REAGAN (DCA)"),
        item("IAD", "WASHINGTON DULLES (IAD)"),
        item("BWI", "BALTIMORE (BWI)"),
        item("DTW", "DETROIT (DTW)"),

        // Tier 3 — Knowledgeable (items 31–40)
        item("MSP", "MINNEAPOLIS (MSP)"),
        item("PHL", "PHILADELPHIA (PHL)"),
        item("LGA", "NEW YORK LAGUARDIA (LGA)"),
        item("TPA", "TAMPA (TPA)"),
        item("PDX", "PORTLAND (PDX)"),
        item("HOU", "HOUSTON HOBBY (HOU)"),
        item("MDW", "CHICAGO MIDWAY (MDW)"),
        item("DAL", "DALLAS LOVE FIELD (DAL)"),
        item("STL", "ST. LOUIS (STL)"),
        item("MSY", "NEW ORLEANS (MSY)"),

        // Tier 4 — Expert (items 41–50)
        item("CVG", "CINCINNATI (CVG)"),
        item("PIT", "PITTSBURGH (PIT)"),
        item("CLE", "CLEVELAND (CLE)"),
        item("RDU", "RALEIGH-DURHAM (RDU)"),
        item("MCI", "KANSAS CITY (MCI)"),
        item("SMF", "SACRAMENTO (SMF)"),
        item("SJC", "SAN JOSE (SJC)"),
        item("SNA", "JOHN WAYNE / ORANGE COUNTY (SNA)"),
        item("OGG", "MAUI / KAHULUI (OGG)"),
        item("RSW", "FORT MYERS (RSW)"),

        // ── BACKUPS (items 51–60) ────────────────
        item("IND", "INDIANAPOLIS (IND)"),
        item("SAT", "SAN ANTONIO (SAT)"),
        item("CMH", "COLUMBUS (CMH)"),
        item("MKE", "MILWAUKEE (MKE)"),
        item("BDL", "HARTFORD (BDL)"),
        item("PVD", "PROVIDENCE (PVD)"),
        item("OMA", "OMAHA (OMA)"),
        item("RIC", "RICHMOND (RIC)"),
        item("ABQ", "ALBUQUERQUE (ABQ)"),
        item("TUS", "TUCSON (TUS)")
    ];
    
    if (typeof window !== 'undefined') window.airportCodesData = airportCodesData;
})();
