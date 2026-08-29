# TulospalveluClient
Web-sovellus seurapelien tulosten ylhäällä pitämiselle. Tällä hetkellä tulospalvelu tukee kaikkien tuntemaa mölkkyä!

Tulospalvelu on tehty yhteensä noin kuuden viikon aikana ryhmätyönä Metropolia-ammattikorkeakoulussa.
Projektissa on asiakas- sekä palvelinpuolen toteutus. Sovelluksessa on mahdollista rekisteröidä oma ryhmätunnus, jonka avulla voit tallentaa pelattuja pelejä ulkoiseen tietokantaan. Asiakaspuoli toteutettiin React-projektina ja siinä käytettiin JavaScript, HTML sekä CSS kieliä. Sovelluksen ulkoasu on suunniteltu mobiililaitteella käytettäväksi.


Palvelinpuolen toteutus: https://github.com/Tiketin/Tulospalvelupalvelin
# Tulospalveluclient-react
Muuta .env.example muotoon .env (.env on .gitignore:ssa, älä vie palvelimille!)
Ajo:
-npm install
-npm start

# Deploymentit ja tuotanto:
Tulospalvelu pyörii Docker-konteissa osoitteissa https://tulospalvelu.tikkalandia.fi/ (tuotanto) ja https://dev-tulospalvelu.tikkalandia.fi/ (kehitys).
Dockerilla Tulospalveluclientista tehdään npm run buildilla staattinen sivusto, joka palvellaan Nginx:llä Cloudflare-tunnelin kautta domainiin.
GitHub Actions luo master-haarasta Docker imagen ja puskee sen Dockerhubiin, josta niitä haetaan palvelimille Portainerilla.
Muutokset siirtyvät master-haarasta automaattisesti dev-ympäristöön. Tuotantoympäristön asennukset tapahtuvat manuaalisesti Portainerin käyttöliittymältä.